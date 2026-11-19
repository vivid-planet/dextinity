import {
    type KeyboardEvent as ReactKeyboardEvent,
    type PointerEvent as ReactPointerEvent,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useMediaQuery } from "../../components/appShell/useMediaQuery";
import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Input } from "../../components/input/Input";
import { Tabs } from "../../components/tabs/Tabs";
import { Theme } from "../../components/theme/Theme";
import { getExpandableTreeNodeIds, type TreeNode, TreeView } from "../../components/treeView/TreeView";
import { TreeViewExpandButtons } from "../../components/treeViewExpandButtons/TreeViewExpandButtons";
import type { ThemeColorScheme } from "../../theme/types";
import { brandSetting } from "../brand";
import { colorSchemeSetting, getAppliedColorScheme } from "../colorScheme";
import { densitySetting } from "../density";
import { getComponentStoryIds } from "./componentStories";
import { workspacePrototypes } from "./prototypes";
import { buildStoryTree, getStoryFolderIds, type IndexedStory } from "./storyTree";
import { type InspectedComponent, useCanvasInspector } from "./useCanvasInspector";
import { useFramePage } from "./useFramePage";
import { workspaceLogo } from "./workspaceLogo";
import styles from "./WorkspaceShell.module.scss";
import { defaultWorkspaceState, useWorkspaceState, type WorkspaceMode } from "./workspaceState";
import { colorSchemeOptions, densityOptions, minFrameSize, SettingMenu, ViewportControl } from "./WorkspaceToolbarControls";

const shellStoryId = "workspace-shell--shell";
const narrowQuery = "(width < 760px)";
const minPanelWidth = 260;
const maxPanelWidth = 520;
const panelKeyboardStep = 20;
const inspectLabelHeight = 18;
const prototypesTitle = "Workspace/Prototypes";
const brandOptions = brandSetting.options.map(({ value, title }) => ({ value, "aria-label": title, icon: null }));

const modeTabs: Array<{ value: WorkspaceMode; label: string }> = [
    { value: "components", label: "Components" },
    { value: "prototypes", label: "Prototypes" },
];

/** A story the workspace showed before, to go back to: in the prototypes, with the prototype's page then. */
interface HistoryEntry {
    mode: WorkspaceMode;
    storyId: string;
    page?: string;
}

interface StoryIndex {
    entries: Record<string, { id: string; title: string; name: string; type: string; tags?: string[] }>;
}

async function fetchStories(): Promise<IndexedStory[]> {
    const response = await fetch(new URL("index.json", document.baseURI));
    const index: StoryIndex = await response.json();
    return Object.values(index.entries)
        .filter((entry) => entry.type === "story" && entry.id !== shellStoryId && !entry.tags?.includes("development"))
        .map(({ id, title, name }) => ({ id, title, name }))
        .sort((a, b) => Number(b.title.startsWith("Workspace/")) - Number(a.title.startsWith("Workspace/")));
}

function useElementSize(element: HTMLElement | null) {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useLayoutEffect(() => {
        if (!element) {
            return;
        }
        const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
        observer.observe(element);
        return () => observer.disconnect();
    }, [element]);
    return size;
}

type ResizeEdge = "inline" | "block" | "both";

function isPrototype(story: IndexedStory) {
    return story.title === prototypesTitle || story.title.startsWith(`${prototypesTitle}/`);
}

function getPrototypePageNodeId(storyId: string, pageId: string) {
    return `${storyId}#${pageId}`;
}

function getStoryLabel(story: IndexedStory) {
    return `${story.title.split("/").at(-1)} · ${story.name}`;
}

/** The stories whose title or name contains the query, and the folders around them. */
function getSearchMatches(stories: IndexedStory[], query: string) {
    const matches = query === "" ? [] : stories.filter((story) => `${story.title} ${story.name}`.toLowerCase().includes(query));
    return { storyIds: new Set(matches.map((story) => story.id)), folderIds: new Set(matches.flatMap(getStoryFolderIds)) };
}

function clampPanelWidth(width: number) {
    return Math.min(maxPanelWidth, Math.max(minPanelWidth, Math.round(width)));
}

/** Calls `onMove` with the distance from where the pointer went down until it's released, and `onEnd` on release. */
function trackPointerDrag(event: ReactPointerEvent, { onMove, onEnd }: { onMove: (deltaX: number, deltaY: number) => void; onEnd: () => void }) {
    event.preventDefault();
    const start = { x: event.clientX, y: event.clientY };

    function handleMove(moveEvent: PointerEvent) {
        onMove(moveEvent.clientX - start.x, moveEvent.clientY - start.y);
    }

    // A touch drag can end in `pointercancel` instead of `pointerup`, e.g. when the browser takes it over for scrolling
    function handleEnd() {
        onEnd();
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleEnd);
        window.removeEventListener("pointercancel", handleEnd);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleEnd);
    window.addEventListener("pointercancel", handleEnd);
}

/**
 * A design workspace: the stories of the Storybook in a frame that behaves like a browser window, with the theme, color scheme,
 * density, and viewport size switchable around it. The shell itself always keeps the same look.
 */
export function WorkspaceShell() {
    const [state, updateState] = useWorkspaceState();
    const [stories, setStories] = useState<IndexedStory[]>([]);
    const [search, setSearch] = useState("");
    const [colorScheme, setColorScheme] = useState(getAppliedColorScheme);
    const [brand, setBrand] = useState(brandSetting.get);
    const [density, setDensity] = useState(densitySetting.get);
    const [canvasElement, setCanvasElement] = useState<HTMLDivElement | null>(null);
    const [resizing, setResizing] = useState<"frame" | "panel" | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [frameLoadCount, setFrameLoadCount] = useState(0);
    const [inspecting, setInspecting] = useState(false);
    // The stories opened before the current one, most recent last, to go back to the page a component was picked on
    const [storyHistory, setStoryHistory] = useState<HistoryEntry[]>([]);
    // The prototype's page to open the frame on; the prototype keeps the page it navigates to in the frame's hash
    const [prototypeStartPage, setPrototypeStartPage] = useState("");
    const frameRef = useRef<HTMLIFrameElement>(null);
    const treeRef = useRef<HTMLUListElement>(null);
    const framePage = useFramePage(frameRef, frameLoadCount);
    const canvasSize = useElementSize(canvasElement);
    const narrow = useMediaQuery(narrowQuery);
    // On a narrow screen, the stories cover the canvas, so they start closed and close again once a story is picked
    const [overlayPanelOpen, setOverlayPanelOpen] = useState(false);
    const panelVisible = narrow ? overlayPanelOpen : state.panelOpen;

    function togglePanel() {
        if (narrow) {
            setOverlayPanelOpen(!overlayPanelOpen);
        } else {
            updateState({ panelOpen: !state.panelOpen });
        }
    }

    function changeColorScheme(value: ThemeColorScheme) {
        colorSchemeSetting.store(value);
        setColorScheme(value);
    }

    useEffect(() => {
        void fetchStories().then(setStories);
    }, []);

    const componentStories = useMemo(() => stories.filter((story) => !isPrototype(story)), [stories]);
    const prototypes = useMemo(() => stories.filter(isPrototype), [stories]);
    const isLoading = stories.length === 0;
    const isPrototypeMode = state.mode === "prototypes";

    // A stored story may since have been removed or renamed; until the index has loaded, there's nothing to check it against
    const storedStoryId = isLoading || componentStories.some((story) => story.id === state.storyId) ? state.storyId : null;
    const storyId = storedStoryId ?? componentStories.find((story) => story.title.startsWith("Workspace/"))?.id ?? componentStories[0]?.id ?? null;
    const currentStory = componentStories.find((story) => story.id === storyId);
    const storedPrototypeId = isLoading || prototypes.some((story) => story.id === state.prototypeId) ? state.prototypeId : null;
    const prototypeId = storedPrototypeId ?? prototypes[0]?.id ?? null;
    const currentPrototype = prototypes.find((story) => story.id === prototypeId);
    const frameStoryId = isPrototypeMode ? prototypeId : storyId;
    const frameStory = isPrototypeMode ? currentPrototype : currentStory;

    const storyTree = useMemo(() => buildStoryTree(componentStories), [componentStories]);
    const prototypeNodes = useMemo<TreeNode[]>(
        () =>
            prototypes.map((story) => {
                const prototype = workspacePrototypes.get(story.id);
                return {
                    id: story.id,
                    label: story.name,
                    icon: <Icon name="window" />,
                    children: prototype?.designedPageIds.map((pageId) => ({
                        id: getPrototypePageNodeId(story.id, pageId),
                        label: prototype.getPageLabel(pageId) ?? pageId,
                        type: "page" as const,
                    })),
                };
            }),
        [prototypes],
    );
    // Until the tree is first changed, every prototype shows its pages
    const [prototypeExpandedIds, setPrototypeExpandedIds] = useState<string[] | null>(null);
    const visiblePrototypeExpandedIds = prototypeExpandedIds ?? prototypes.map((story) => story.id);
    const currentPrototypePageId = framePage.hash || workspacePrototypes.get(prototypeId ?? "")?.startPageId;
    const storiesById = useMemo(() => new Map(componentStories.map((story) => [story.id, story])), [componentStories]);
    const expandedIds = state.expandedIds ?? (currentStory ? getStoryFolderIds(currentStory) : []);
    const searchQuery = search.trim().toLowerCase();
    const isSearching = searchQuery !== "";
    const searchMatches = useMemo(() => getSearchMatches(componentStories, searchQuery), [componentStories, searchQuery]);
    // While searching, the tree has its own expanded folders, so the search doesn't change the ones kept for later
    const [searchExpandedIds, setSearchExpandedIds] = useState<string[]>([]);
    const visibleExpandedIds = isSearching ? searchExpandedIds : expandedIds;

    function setVisibleExpandedIds(ids: string[]) {
        if (isSearching) {
            setSearchExpandedIds(ids);
        } else {
            updateState({ expandedIds: ids });
        }
    }

    function changeSearch(value: string) {
        setSearch(value);
        setSearchExpandedIds([...getSearchMatches(componentStories, value.trim().toLowerCase()).folderIds]);
    }

    function rememberFrameStory() {
        if (frameStoryId) {
            const entry: HistoryEntry = { mode: state.mode, storyId: frameStoryId, page: isPrototypeMode ? framePage.hash : undefined };
            setStoryHistory((history) => [...history, entry]);
        }
    }

    function openStory(nodeId: string) {
        const story = storiesById.get(nodeId);
        if (!story || (nodeId === storyId && !isPrototypeMode)) {
            return;
        }
        rememberFrameStory();
        setInspecting(false);
        setOverlayPanelOpen(false);
        updateState({ mode: "components", storyId: nodeId, expandedIds: [...new Set([...expandedIds, ...getStoryFolderIds(story)])] });
    }

    function selectPrototypeNode(nodeId: string) {
        const [storyId, pageId] = nodeId.split("#");
        if (pageId === undefined) {
            setPrototypeExpandedIds(
                visiblePrototypeExpandedIds.includes(nodeId)
                    ? visiblePrototypeExpandedIds.filter((id) => id !== nodeId)
                    : [...visiblePrototypeExpandedIds, nodeId],
            );
            return;
        }
        setInspecting(false);
        setOverlayPanelOpen(false);
        const frameWindow = frameRef.current?.contentWindow;
        // The prototype in the frame navigates itself, which keeps its state, like a click in its own navigation
        if (storyId === prototypeId && frameWindow) {
            frameWindow.location.hash = pageId;
        } else {
            setPrototypeStartPage(pageId);
            updateState({ prototypeId: storyId });
        }
    }

    function changeMode(mode: WorkspaceMode) {
        setInspecting(false);
        // The prototype opens again on the page it was left on
        setPrototypeStartPage(isPrototypeMode ? framePage.hash : prototypeStartPage);
        updateState({ mode });
    }

    function goBack() {
        const previous = storyHistory.at(-1);
        if (previous) {
            setStoryHistory((history) => history.slice(0, -1));
            setInspecting(false);
            if (previous.mode === "prototypes") {
                setPrototypeStartPage(previous.page ?? "");
                updateState({ mode: "prototypes", prototypeId: previous.storyId });
            } else {
                updateState({ mode: "components", storyId: previous.storyId });
            }
        }
    }

    function restartPrototype() {
        setPrototypeStartPage("");
        setReloadKey((key) => key + 1);
    }

    function reloadFrame() {
        if (isPrototypeMode) {
            setPrototypeStartPage(framePage.hash);
        }
        setReloadKey((key) => key + 1);
    }

    const componentStoryIds = useMemo(() => getComponentStoryIds(componentStories), [componentStories]);
    const inspected = useCanvasInspector({
        frameRef,
        active: inspecting,
        frameLoadCount,
        componentStoryIds,
        onPick: (component: InspectedComponent) => {
            setInspecting(false);
            openStory(component.storyId);
        },
        onExit: () => setInspecting(false),
    });
    const previousEntry = storyHistory.at(-1);
    const previousStory = previousEntry && stories.find((story) => story.id === previousEntry.storyId);

    function selectTreeNode(nodeId: string) {
        if (storiesById.has(nodeId)) {
            openStory(nodeId);
            return;
        }
        setVisibleExpandedIds(
            visibleExpandedIds.includes(nodeId) ? visibleExpandedIds.filter((id) => id !== nodeId) : [...visibleExpandedIds, nodeId],
        );
    }

    function collapseAll() {
        setVisibleExpandedIds([]);
        // The button stays where it is, but moving on to the tree is what's next after collapsing it
        treeRef.current?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]')?.focus();
    }

    function focusCurrentStory() {
        if (currentStory) {
            setSearch("");
            updateState({ expandedIds: getStoryFolderIds(currentStory) });
        }
    }

    function applyDensityToFrame() {
        // Before the story has loaded, the frame's document has no root element yet
        const frameRoot = frameRef.current?.contentDocument?.documentElement;
        if (frameRoot) {
            frameRoot.dataset.dextinityDensity = density;
        }
    }

    useEffect(applyDensityToFrame);

    // Matches the canvas padding in the stylesheet: the room around the frame, plus the frame label above it
    const canvasInset = narrow ? { inline: 16, block: 16 * 2 + 28 } : { inline: 48, block: 48 * 2 };
    const fitScale = Math.min(1, (canvasSize.width - canvasInset.inline * 2) / state.width, (canvasSize.height - canvasInset.block) / state.height);
    const scale = state.responsive ? 1 : state.zoom === "fit" ? Math.max(fitScale, 0.1) : Number(state.zoom);
    const storyUrl = frameStoryId ? `iframe.html?id=${encodeURIComponent(frameStoryId)}&viewMode=story` : null;
    const frameSrc = storyUrl && isPrototypeMode && prototypeStartPage ? `${storyUrl}#${prototypeStartPage}` : storyUrl;
    // A prototype titles the document after its page, e.g. "Job ads · Career portal"
    const panelLabel = isPrototypeMode ? "Prototypes" : "Stories";
    const prototypePageLabel = isPrototypeMode ? framePage.title.split(" · ")[0] : "";

    function startFrameResize(edge: ResizeEdge, event: ReactPointerEvent) {
        const start = { width: state.width, height: state.height };
        setResizing("frame");
        trackPointerDrag(event, {
            onMove: (deltaX, deltaY) => {
                const changes: { width?: number; height?: number } = {};
                if (edge !== "block") {
                    changes.width = Math.max(minFrameSize, Math.round(start.width + deltaX / scale));
                }
                if (edge !== "inline") {
                    changes.height = Math.max(minFrameSize, Math.round(start.height + deltaY / scale));
                }
                updateState(changes);
            },
            onEnd: () => setResizing(null),
        });
    }

    function startPanelResize(event: ReactPointerEvent) {
        const startWidth = state.panelWidth;
        setResizing("panel");
        trackPointerDrag(event, {
            onMove: (deltaX) => updateState({ panelWidth: clampPanelWidth(startWidth + deltaX) }),
            onEnd: () => setResizing(null),
        });
    }

    function resizePanelWithKeyboard(event: ReactKeyboardEvent) {
        const steps: Record<string, number> = { ArrowLeft: -panelKeyboardStep, ArrowRight: panelKeyboardStep };
        if (event.key in steps) {
            event.preventDefault();
            updateState({ panelWidth: clampPanelWidth(state.panelWidth + steps[event.key]) });
        }
    }

    return (
        <Theme colorScheme="light" brand="dextinity" density="compact" className={styles.themeRoot}>
            <div className={styles.root} data-resizing={resizing ?? undefined}>
                <header className={styles.header}>
                    <div className={styles.toolbar}>
                        <div className={styles.brand}>
                            <IconButton
                                variant="text"
                                color="secondary"
                                aria-label={panelVisible ? `Hide ${panelLabel.toLowerCase()}` : `Show ${panelLabel.toLowerCase()}`}
                                aria-expanded={panelVisible}
                                onClick={togglePanel}
                            >
                                <Icon name={panelVisible ? "sidebar-close" : "sidebar-open"} />
                            </IconButton>
                            <img className={styles.logo} src={workspaceLogo} alt="Next UI Workspace" />
                        </div>

                        <Tabs className={styles.modeTabs} aria-label="Workspace" items={modeTabs} value={state.mode} onChange={changeMode} />

                        <div className={styles.settings}>
                            <ViewportControl
                                responsive={state.responsive}
                                onResponsiveChange={() => updateState({ responsive: true })}
                                width={state.width}
                                height={state.height}
                                zoom={state.zoom}
                                onSizeChange={(size) => updateState({ ...size, responsive: false })}
                                onZoomChange={(zoom) => updateState({ zoom })}
                            />
                            <SettingMenu label="Color scheme" options={colorSchemeOptions} value={colorScheme} onChange={changeColorScheme} />
                            <SettingMenu
                                label="Theme"
                                icon={<Icon name="layers" />}
                                options={brandOptions}
                                value={brand}
                                onChange={(value) => {
                                    brandSetting.store(value);
                                    setBrand(brandSetting.get());
                                }}
                            />
                            <SettingMenu
                                label="Density"
                                options={densityOptions}
                                value={density}
                                onChange={(value) => {
                                    densitySetting.store(value);
                                    setDensity(value);
                                }}
                            />
                            <span className={styles.divider} />
                            <IconButton variant="text" color="secondary" aria-label="Reload story" onClick={reloadFrame}>
                                <Icon name="refresh" />
                            </IconButton>
                            <IconButton
                                variant="text"
                                color="secondary"
                                aria-label="Open story in a new tab"
                                disabled={!storyUrl}
                                onClick={() => storyUrl && window.open(storyUrl, "_blank")}
                            >
                                <Icon name="external-link" />
                            </IconButton>
                        </div>
                    </div>

                    <div className={styles.contextBar}>
                        <p className={styles.location}>
                            {isPrototypeMode ? (
                                <>
                                    <span className={styles.locationTrail}>{currentPrototype?.name}</span>
                                    {prototypePageLabel && <span className={styles.locationCurrent}>{prototypePageLabel}</span>}
                                </>
                            ) : (
                                currentStory && (
                                    <>
                                        <span className={styles.locationTrail}>{currentStory.title.split("/").join(" / ")}</span>
                                        <span className={styles.locationCurrent}>{currentStory.name}</span>
                                    </>
                                )
                            )}
                        </p>
                        <div className={styles.toolbarGroup}>
                            {isPrototypeMode && (
                                <IconButton variant="text" color="secondary" aria-label="Restart the prototype" onClick={restartPrototype}>
                                    <Icon name="home" />
                                </IconButton>
                            )}
                            <IconButton
                                variant="text"
                                color="secondary"
                                aria-label={previousStory ? `Back to ${getStoryLabel(previousStory)}` : "Back"}
                                disabled={!previousStory}
                                onClick={goBack}
                            >
                                <Icon name="back" />
                            </IconButton>
                            <IconButton
                                variant={inspecting ? "contained" : "text"}
                                color={inspecting ? "primary" : "secondary"}
                                aria-label="Pick a component in the canvas"
                                aria-pressed={inspecting}
                                onClick={() => setInspecting(!inspecting)}
                            >
                                <Icon name="select" />
                            </IconButton>
                        </div>
                    </div>
                </header>

                <div className={styles.body}>
                    {panelVisible && narrow && <div className={styles.panelBackdrop} onClick={() => setOverlayPanelOpen(false)} />}
                    {panelVisible && (
                        <nav
                            className={styles.panel}
                            aria-label={panelLabel}
                            data-overlay={narrow || undefined}
                            style={{ inlineSize: narrow ? undefined : state.panelWidth }}
                            onKeyDown={(event) => narrow && event.key === "Escape" && setOverlayPanelOpen(false)}
                        >
                            {isPrototypeMode ? (
                                <div className={styles.panelList} data-prototypes>
                                    <TreeView
                                        aria-label="Prototypes"
                                        nodes={prototypeNodes}
                                        expandedIds={visiblePrototypeExpandedIds}
                                        onExpandedChange={setPrototypeExpandedIds}
                                        selectedId={
                                            prototypeId && currentPrototypePageId
                                                ? getPrototypePageNodeId(prototypeId, currentPrototypePageId)
                                                : undefined
                                        }
                                        onSelect={selectPrototypeNode}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className={styles.panelSearch}>
                                        <Input
                                            aria-label="Search stories"
                                            placeholder="Search stories"
                                            startAdornment={<Icon name="search" />}
                                            value={search}
                                            onChange={(event) => changeSearch(event.target.value)}
                                        />
                                    </div>
                                    <div className={styles.panelActions}>
                                        <IconButton
                                            variant="text"
                                            color="secondary"
                                            size="small"
                                            aria-label="Show only the current story"
                                            disabled={!currentStory}
                                            onClick={focusCurrentStory}
                                        >
                                            <Icon name="locate" />
                                        </IconButton>
                                        <TreeViewExpandButtons
                                            onExpandAll={() =>
                                                setVisibleExpandedIds(
                                                    isSearching ? [...searchMatches.folderIds] : getExpandableTreeNodeIds(storyTree),
                                                )
                                            }
                                            onCollapseAll={collapseAll}
                                        />
                                    </div>
                                    <p role="status" className={styles.visuallyHidden}>
                                        {isSearching ? `${searchMatches.storyIds.size} stories found` : ""}
                                    </p>
                                    <div className={styles.panelList}>
                                        {isSearching && searchMatches.storyIds.size === 0 ? (
                                            <p className={styles.panelEmpty}>No stories match “{search.trim()}”</p>
                                        ) : (
                                            <TreeView
                                                ref={treeRef}
                                                aria-label="Stories"
                                                nodes={storyTree}
                                                expandedIds={visibleExpandedIds}
                                                onExpandedChange={setVisibleExpandedIds}
                                                selectedId={storyId ?? undefined}
                                                onSelect={selectTreeNode}
                                                filter={
                                                    isSearching
                                                        ? (node) => searchMatches.storyIds.has(node.id) || searchMatches.folderIds.has(node.id)
                                                        : undefined
                                                }
                                            />
                                        )}
                                    </div>
                                </>
                            )}
                        </nav>
                    )}
                    {panelVisible && !narrow && (
                        <div
                            role="separator"
                            aria-orientation="vertical"
                            aria-label={`Resize ${panelLabel.toLowerCase()} panel`}
                            aria-valuemin={minPanelWidth}
                            aria-valuemax={maxPanelWidth}
                            aria-valuenow={state.panelWidth}
                            tabIndex={0}
                            className={styles.panelHandle}
                            onPointerDown={startPanelResize}
                            onKeyDown={resizePanelWithKeyboard}
                            onDoubleClick={() => updateState({ panelWidth: defaultWorkspaceState.panelWidth })}
                        />
                    )}

                    <div ref={setCanvasElement} className={styles.canvas} data-responsive={state.responsive || undefined}>
                        <div
                            className={styles.stage}
                            style={state.responsive ? undefined : { width: state.width * scale, height: state.height * scale }}
                        >
                            {!state.responsive && (
                                <div className={styles.frameLabel}>
                                    <span className={styles.frameStory}>{frameStory ? getStoryLabel(frameStory) : ""}</span>
                                    <span>
                                        {state.width} × {state.height} · {Math.round(scale * 100)} %
                                    </span>
                                </div>
                            )}
                            <div
                                className={styles.frame}
                                style={state.responsive ? undefined : { width: state.width, height: state.height, transform: `scale(${scale})` }}
                            >
                                {storyUrl && (
                                    <iframe
                                        key={`${storyUrl}-${reloadKey}`}
                                        ref={frameRef}
                                        className={styles.iframe}
                                        src={frameSrc ?? undefined}
                                        title={frameStory ? `${frameStory.title} · ${frameStory.name}` : "Story"}
                                        onLoad={() => {
                                            applyDensityToFrame();
                                            setFrameLoadCount((count) => count + 1);
                                        }}
                                    />
                                )}
                            </div>
                            {inspected && (
                                <div className={styles.inspectLayer}>
                                    <div
                                        className={styles.inspectBox}
                                        // At the frame's top edge, the label goes inside the box, where the frame doesn't cut it off
                                        data-label-inside={inspected.rect.top * scale < inspectLabelHeight || undefined}
                                        style={{
                                            top: inspected.rect.top * scale,
                                            left: inspected.rect.left * scale,
                                            width: inspected.rect.width * scale,
                                            height: inspected.rect.height * scale,
                                        }}
                                    >
                                        <span className={styles.inspectLabel}>{inspected.componentName}</span>
                                    </div>
                                </div>
                            )}
                            {!state.responsive && (
                                <>
                                    <div className={styles.handleInline} onPointerDown={(event) => startFrameResize("inline", event)} />
                                    <div className={styles.handleBlock} onPointerDown={(event) => startFrameResize("block", event)} />
                                    <div className={styles.handleCorner} onPointerDown={(event) => startFrameResize("both", event)} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Theme>
    );
}
