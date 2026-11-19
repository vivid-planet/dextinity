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
import { SegmentedControl } from "../../components/segmentedControl/SegmentedControl";
import { Theme } from "../../components/theme/Theme";
import { getExpandableTreeNodeIds, TreeView } from "../../components/treeView/TreeView";
import { TreeViewExpandButtons } from "../../components/treeViewExpandButtons/TreeViewExpandButtons";
import type { ThemeColorScheme } from "../../theme/types";
import { brandSetting } from "../brand";
import { colorSchemeSetting } from "../colorScheme";
import { densitySetting } from "../density";
import { getComponentStoryIds } from "./componentStories";
import { buildStoryTree, getStoryFolderIds, type IndexedStory } from "./storyTree";
import { type InspectedComponent, useCanvasInspector } from "./useCanvasInspector";
import { workspaceLogo } from "./workspaceLogo";
import styles from "./WorkspaceShell.module.scss";
import { defaultWorkspaceState, useWorkspaceState } from "./workspaceState";
import { AppearanceControl, colorSchemeOptions, minFrameSize, MoreActionsMenu, ViewportControl } from "./WorkspaceToolbarControls";

const shellStoryId = "workspace-shell--shell";
const narrowQuery = "(width < 760px)";
const minPanelWidth = 260;
const maxPanelWidth = 520;
const panelKeyboardStep = 20;
const inspectLabelHeight = 18;

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

function getInitialColorScheme(): ThemeColorScheme {
    const stored = colorSchemeSetting.get();
    return stored === "system" ? "light" : stored;
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

    function handleUp() {
        onEnd();
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
}

/**
 * A design workspace: the stories of the Storybook in a frame that behaves like a browser window, with the theme, color scheme,
 * density, and viewport size switchable around it. The shell itself always keeps the same look.
 */
export function WorkspaceShell() {
    const [state, updateState] = useWorkspaceState();
    const [stories, setStories] = useState<IndexedStory[]>([]);
    const [search, setSearch] = useState("");
    const [colorScheme, setColorScheme] = useState(getInitialColorScheme);
    const [brand, setBrand] = useState(brandSetting.get);
    const [density, setDensity] = useState(densitySetting.get);
    const [canvasElement, setCanvasElement] = useState<HTMLDivElement | null>(null);
    const [resizing, setResizing] = useState<"frame" | "panel" | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [frameLoadCount, setFrameLoadCount] = useState(0);
    const [inspecting, setInspecting] = useState(false);
    // The stories opened before the current one, most recent last, to go back to the page a component was picked on
    const [storyHistory, setStoryHistory] = useState<string[]>([]);
    const frameRef = useRef<HTMLIFrameElement>(null);
    const treeRef = useRef<HTMLUListElement>(null);
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

    const storyId = state.storyId ?? stories.find((story) => story.title.startsWith("Workspace/"))?.id ?? stories[0]?.id ?? null;
    const currentStory = stories.find((story) => story.id === storyId);

    const storyTree = useMemo(() => buildStoryTree(stories), [stories]);
    const storiesById = useMemo(() => new Map(stories.map((story) => [story.id, story])), [stories]);
    const expandedIds = state.expandedIds ?? (currentStory ? getStoryFolderIds(currentStory) : []);
    const searchQuery = search.trim().toLowerCase();
    const isSearching = searchQuery !== "";
    const searchMatches = useMemo(() => getSearchMatches(stories, searchQuery), [stories, searchQuery]);
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
        setSearchExpandedIds([...getSearchMatches(stories, value.trim().toLowerCase()).folderIds]);
    }

    function openStory(nodeId: string) {
        const story = storiesById.get(nodeId);
        if (!story || nodeId === storyId) {
            return;
        }
        if (storyId) {
            setStoryHistory((history) => [...history, storyId]);
        }
        setInspecting(false);
        setOverlayPanelOpen(false);
        updateState({ storyId: nodeId, expandedIds: [...new Set([...expandedIds, ...getStoryFolderIds(story)])] });
    }

    function goBack() {
        const previousStoryId = storyHistory.at(-1);
        if (previousStoryId) {
            setStoryHistory((history) => history.slice(0, -1));
            setInspecting(false);
            updateState({ storyId: previousStoryId });
        }
    }

    const componentStoryIds = useMemo(() => getComponentStoryIds(stories), [stories]);
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
    const previousStory = storiesById.get(storyHistory.at(-1) ?? "");

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
    const scale = state.zoom === "fit" ? Math.max(fitScale, 0.1) : Number(state.zoom);
    const storyUrl = storyId ? `iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story` : null;

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
                <header className={styles.toolbar}>
                    <div className={styles.toolbarGroup}>
                        <IconButton
                            variant="text"
                            color="secondary"
                            aria-label={panelVisible ? "Hide stories" : "Show stories"}
                            aria-expanded={panelVisible}
                            onClick={togglePanel}
                        >
                            <Icon name={panelVisible ? "sidebar-close" : "sidebar-open"} />
                        </IconButton>
                        <img className={styles.logo} src={workspaceLogo} alt="Next UI Workspace" />
                    </div>

                    <div className={styles.toolbarGroup}>
                        <IconButton
                            variant={inspecting ? "contained" : "text"}
                            color={inspecting ? "primary" : "secondary"}
                            aria-label="Pick a component in the canvas"
                            aria-pressed={inspecting}
                            onClick={() => setInspecting(!inspecting)}
                        >
                            <Icon name="select" />
                        </IconButton>
                        <IconButton
                            variant="text"
                            color="secondary"
                            aria-label={previousStory ? `Back to ${previousStory.title.split("/").at(-1)} · ${previousStory.name}` : "Back"}
                            disabled={!previousStory}
                            onClick={goBack}
                        >
                            <Icon name="back" />
                        </IconButton>
                        <ViewportControl
                            width={state.width}
                            height={state.height}
                            zoom={state.zoom}
                            onSizeChange={updateState}
                            onZoomChange={(zoom) => updateState({ zoom })}
                        />
                    </div>

                    <div className={styles.toolbarGroup}>
                        <SegmentedControl
                            size="small"
                            aria-label="Color scheme"
                            className={styles.colorScheme}
                            options={colorSchemeOptions}
                            value={colorScheme}
                            onChange={changeColorScheme}
                        />
                        <AppearanceControl
                            brand={brand}
                            onBrandChange={(value) => {
                                brandSetting.store(value);
                                setBrand(brandSetting.get());
                            }}
                            colorScheme={colorScheme}
                            onColorSchemeChange={changeColorScheme}
                            density={density}
                            onDensityChange={(value) => {
                                densitySetting.store(value);
                                setDensity(value);
                            }}
                        />
                        <MoreActionsMenu storyUrl={storyUrl} onReload={() => setReloadKey((key) => key + 1)} />
                    </div>
                </header>

                <div className={styles.body}>
                    {panelVisible && narrow && <div className={styles.panelBackdrop} onClick={() => setOverlayPanelOpen(false)} />}
                    {panelVisible && (
                        <nav
                            className={styles.panel}
                            aria-label="Stories"
                            data-overlay={narrow || undefined}
                            style={{ inlineSize: narrow ? undefined : state.panelWidth }}
                            onKeyDown={(event) => narrow && event.key === "Escape" && setOverlayPanelOpen(false)}
                        >
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
                                        setVisibleExpandedIds(isSearching ? [...searchMatches.folderIds] : getExpandableTreeNodeIds(storyTree))
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
                        </nav>
                    )}
                    {panelVisible && !narrow && (
                        <div
                            role="separator"
                            aria-orientation="vertical"
                            aria-label="Resize stories panel"
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

                    <div ref={setCanvasElement} className={styles.canvas}>
                        <div className={styles.stage} style={{ width: state.width * scale, height: state.height * scale }}>
                            <div className={styles.frameLabel}>
                                <span className={styles.frameStory}>
                                    {currentStory ? `${currentStory.title.split("/").at(-1)} · ${currentStory.name}` : ""}
                                </span>
                                <span>
                                    {state.width} × {state.height} · {Math.round(scale * 100)} %
                                </span>
                            </div>
                            <div className={styles.frame} style={{ width: state.width, height: state.height, transform: `scale(${scale})` }}>
                                {storyUrl && (
                                    <iframe
                                        key={`${storyUrl}-${reloadKey}`}
                                        ref={frameRef}
                                        className={styles.iframe}
                                        src={storyUrl}
                                        title={currentStory ? `${currentStory.title} · ${currentStory.name}` : "Story"}
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
                            <div className={styles.handleInline} onPointerDown={(event) => startFrameResize("inline", event)} />
                            <div className={styles.handleBlock} onPointerDown={(event) => startFrameResize("block", event)} />
                            <div className={styles.handleCorner} onPointerDown={(event) => startFrameResize("both", event)} />
                        </div>
                    </div>
                </div>
            </div>
        </Theme>
    );
}
