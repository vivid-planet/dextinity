import {
    type KeyboardEvent as ReactKeyboardEvent,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
    type RefObject,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useMediaQuery } from "../../components/appShell/useMediaQuery";
import { Button } from "../../components/button/Button";
import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Menu } from "../../components/menu/Menu";
import { MenuItem } from "../../components/menu/MenuItem";
import { SegmentedControl } from "../../components/segmentedControl/SegmentedControl";
import { Tabs } from "../../components/tabs/Tabs";
import { Theme } from "../../components/theme/Theme";
import { type TreeNode, TreeView } from "../../components/treeView/TreeView";
import type { ThemeColorScheme } from "../../theme/types";
import { brandSetting } from "../brand";
import { colorSchemeSetting, getAppliedColorScheme } from "../colorScheme";
import { densitySetting } from "../density";
import { scenarioSetting, useScenario } from "../scenario";
import { CompareCanvas } from "./CompareCanvas";
import { getComponentStoryIds, type IndexedStory } from "./componentStories";
import { FlowMap } from "./FlowMap";
import { type NotePage, useTextChanges } from "./FrameNotes";
import { type FrameTool, FrameTools } from "./FrameTools";
import { customPageList, customPagePrefix, type PageTemplate, pageTemplates } from "./pageTemplates";
import { workspacePrototypes } from "./prototypes";
import { type InspectedComponent, useCanvasInspector } from "./useCanvasInspector";
import { useFramePage } from "./useFramePage";
import { workspaceLogo } from "./workspaceLogo";
import { commentList, textChangeList } from "./workspaceNotes";
import styles from "./WorkspaceShell.module.scss";
import { defaultWorkspaceState, useWorkspaceState, type WorkspaceCompare, type WorkspaceMode } from "./workspaceState";
import { colorSchemeOptions, densityOptions, minFrameSize, SettingMenu, ViewportControl, zoomOptions } from "./WorkspaceToolbarControls";

const shellStoryId = "workspace-shell--shell";
const narrowQuery = "(width < 760px)";
const minPanelWidth = 260;
const maxPanelWidth = 520;
const panelKeyboardStep = 20;
const inspectLabelHeight = 18;
const prototypesTitle = "Workspace/Prototypes";
const scenarioOptions = scenarioSetting.options.map(({ value, title }) => ({ value, "aria-label": title, icon: null }));
const brandOptions = brandSetting.options.map(({ value, title }) => ({ value, "aria-label": title, icon: null }));

const compareOptions: Array<{ value: WorkspaceCompare; icon: ReactNode; "aria-label": string }> = [
    { value: "off", icon: <Icon name="window" />, "aria-label": "One frame" },
    { value: "viewports", icon: <Icon name="device-tablet" />, "aria-label": "Phone, tablet, and desktop side by side" },
    { value: "variants", icon: <Icon name="swap-boxes" />, "aria-label": "Two variants side by side" },
];

const modeTabs: Array<{ value: WorkspaceMode; label: string }> = [
    { value: "prototypes", label: "Prototypes" },
    // The stories of the Storybook, as its sidebar lists them
    { value: "components", label: "Storybook" },
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

/**
 * The page of Storybook's own UI: the development server serves it as the start page, a static build for the designer's link as
 * `storybook.html`, since there the start page is the link's own launcher.
 */
function useStorybookPage() {
    const [page, setPage] = useState<string | null>(null);
    useEffect(() => {
        async function findPage() {
            try {
                const response = await fetch(new URL("storybook.html", document.baseURI), { method: "HEAD" });
                setPage(response.ok ? "storybook.html" : "./");
            } catch {
                setPage("./");
            }
        }
        void findPage();
    }, []);
    return page;
}

/** The id of the story Storybook's UI shows, from its `path` parameter, e.g. `/story/building-blocks-button--default`. */
function readStorybookStoryId(frame: HTMLIFrameElement | null) {
    const path = frame?.contentWindow?.location.search ? new URLSearchParams(frame.contentWindow.location.search).get("path") : null;
    return path?.match(/^\/(?:story|docs)\/(.+)$/)?.[1] ?? null;
}

/** Follows the story Storybook's UI shows; Storybook changes its address without an event the workspace can listen to. */
function useStorybookStoryId(frameRef: RefObject<HTMLIFrameElement | null>, active: boolean) {
    const [storyId, setStoryId] = useState<string | null>(null);
    useEffect(() => {
        if (!active) {
            return;
        }
        const interval = window.setInterval(() => setStoryId(readStorybookStoryId(frameRef.current)), 500);
        return () => window.clearInterval(interval);
    }, [frameRef, active]);
    return storyId;
}

function isPrototype(story: IndexedStory) {
    return story.title === prototypesTitle || story.title.startsWith(`${prototypesTitle}/`);
}

function getPrototypePageNodeId(storyId: string, pageId: string) {
    return `${storyId}#${pageId}`;
}

function getStoryLabel(story: IndexedStory) {
    return `${story.title.split("/").at(-1)} · ${story.name}`;
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
 * A design workspace: clickable prototypes in a frame that behaves like a browser window, with the theme, color scheme, density,
 * and viewport size switchable around it, next to Storybook's own UI. The shell itself always keeps the same look.
 */
export function WorkspaceShell() {
    const [state, updateState] = useWorkspaceState();
    const [stories, setStories] = useState<IndexedStory[]>([]);
    const [colorScheme, setColorScheme] = useState(getAppliedColorScheme);
    const [brand, setBrand] = useState(brandSetting.get);
    const [density, setDensity] = useState(densitySetting.get);
    const scenario = useScenario();
    const [canvasElement, setCanvasElement] = useState<HTMLDivElement | null>(null);
    const [resizing, setResizing] = useState<"frame" | "panel" | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [frameLoadCount, setFrameLoadCount] = useState(0);
    const [inspecting, setInspecting] = useState(false);
    const [frameTool, setFrameTool] = useState<FrameTool | null>(null);
    // Shows only the prototype, without the workspace around it, e.g. to walk stakeholders through it
    const [presenting, setPresenting] = useState(false);
    const [showingFlow, setShowingFlow] = useState(false);
    // The stories opened before the current one, most recent last, to go back to the page a component was picked on
    const [storyHistory, setStoryHistory] = useState<HistoryEntry[]>([]);
    // The prototype's page to open the frame on; the prototype keeps the page it navigates to in the frame's hash
    const [prototypeStartPage, setPrototypeStartPage] = useState("");
    const frameRef = useRef<HTMLIFrameElement>(null);
    const storybookFrameRef = useRef<HTMLIFrameElement>(null);
    const storybookPage = useStorybookPage();
    const framePage = useFramePage(frameRef, frameLoadCount);
    const canvasSize = useElementSize(canvasElement);
    const narrow = useMediaQuery(narrowQuery);
    // On a narrow screen, the prototypes cover the canvas, so they start closed and close again once a page is picked
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
        async function loadStories() {
            setStories(await fetchStories());
        }
        void loadStories();
    }, []);

    const componentStories = useMemo(() => stories.filter((story) => !isPrototype(story)), [stories]);
    const prototypes = useMemo(() => stories.filter(isPrototype), [stories]);
    const isLoading = stories.length === 0;
    const isPrototypeMode = state.mode === "prototypes";
    const isComparing = isPrototypeMode && state.compare !== "off";

    // A stored story may since have been removed or renamed; until the index has loaded, there's nothing to check it against
    const storedStoryId = isLoading || componentStories.some((story) => story.id === state.storyId) ? state.storyId : null;
    const storyId = storedStoryId ?? componentStories.find((story) => story.title.startsWith("Workspace/"))?.id ?? componentStories[0]?.id ?? null;
    const currentStory = componentStories.find((story) => story.id === storyId);
    const storedPrototypeId = isLoading || prototypes.some((story) => story.id === state.prototypeId) ? state.prototypeId : null;
    const prototypeId = storedPrototypeId ?? prototypes[0]?.id ?? null;
    const currentPrototype = prototypes.find((story) => story.id === prototypeId);

    const customPages = customPageList.useItems();
    const [newPageMenuOpen, setNewPageMenuOpen] = useState(false);
    const prototypeNodes = useMemo<TreeNode[]>(
        () =>
            prototypes.map((story) => {
                const prototype = workspacePrototypes.get(story.id);
                return {
                    id: story.id,
                    label: story.name,
                    icon: <Icon name="window" />,
                    children: [
                        ...(prototype?.designedPageIds.map((pageId) => ({
                            id: getPrototypePageNodeId(story.id, pageId),
                            label: prototype.getPageLabel(pageId) ?? pageId,
                            type: "page" as const,
                        })) ?? []),
                        ...customPages
                            .filter((page) => page.prototypeId === story.id)
                            .map((page) => ({
                                id: getPrototypePageNodeId(story.id, page.id),
                                label: page.title,
                                icon: <Icon name="edit-page" />,
                                type: "page" as const,
                            })),
                    ],
                };
            }),
        [prototypes, customPages],
    );
    // Until the tree is first changed, every prototype shows its pages
    const [prototypeExpandedIds, setPrototypeExpandedIds] = useState<string[] | null>(null);
    const visiblePrototypeExpandedIds = prototypeExpandedIds ?? prototypes.map((story) => story.id);
    // While comparing, the frames report their page to the start page, which the single frame then opens on again
    const shownPage = isComparing ? prototypeStartPage : framePage.hash;
    const currentPrototypePageId = shownPage || workspacePrototypes.get(prototypeId ?? "")?.startPageId;
    const currentWorkspacePrototype = workspacePrototypes.get(prototypeId ?? "");
    const prototypeCustomPages = customPages.filter((page) => page.prototypeId === prototypeId);
    const getPageLabel = (page: string) =>
        prototypeCustomPages.find((customPage) => customPage.id === page)?.title ?? currentWorkspacePrototype?.getPageLabel(page) ?? page;
    const currentCustomPage = prototypeCustomPages.find((page) => page.id === currentPrototypePageId);

    function addPage(template: PageTemplate) {
        if (!prototypeId) {
            return;
        }
        const label = pageTemplates.find((option) => option.value === template)?.label ?? "Page";
        const count = prototypeCustomPages.filter((page) => page.template === template).length + 1;
        const id = `${customPagePrefix}${template}-${Date.now().toString(36)}`;
        customPageList.update((pages) => [...pages, { id, prototypeId, template, title: `${label} (new${count > 1 ? ` ${count}` : ""})` }]);
        setPrototypeExpandedIds([...new Set([...visiblePrototypeExpandedIds, prototypeId])]);
        selectPrototypeNode(getPrototypePageNodeId(prototypeId, id));
    }

    function renameCurrentPage(title: string) {
        const trimmed = title.trim();
        if (currentCustomPage && trimmed !== "" && trimmed !== currentCustomPage.title) {
            customPageList.update((pages) => pages.map((page) => (page === currentCustomPage ? { ...page, title: trimmed } : page)));
        }
    }

    function removeCurrentPage() {
        if (currentCustomPage && prototypeId) {
            customPageList.update((pages) => pages.filter((page) => page !== currentCustomPage));
            // Its comments and text changes would otherwise stay in the lists, pointing to a page that's gone
            const isOnRemovedPage = (note: { prototypeId: string; page: string }) =>
                note.prototypeId === prototypeId && note.page === currentCustomPage.id;
            commentList.update((comments) => comments.filter((comment) => !isOnRemovedPage(comment)));
            textChangeList.update((changes) => changes.filter((change) => !isOnRemovedPage(change)));
            selectPrototypeNode(getPrototypePageNodeId(prototypeId, currentWorkspacePrototype?.startPageId ?? ""));
        }
    }

    const notePage: NotePage = {
        prototypeId: prototypeId ?? "",
        page: currentPrototypePageId ?? "",
        getPageLabel,
        onOpenPage: (page) => {
            const frameWindow = frameRef.current?.contentWindow;
            if (frameWindow) {
                frameWindow.location.hash = page;
            }
        },
    };
    useTextChanges({ frameRef, frameLoadCount, prototypeId: notePage.prototypeId, page: notePage.page });
    const storiesById = useMemo(() => new Map(componentStories.map((story) => [story.id, story])), [componentStories]);

    function rememberCurrentStory() {
        const currentStoryId = isPrototypeMode ? prototypeId : storyId;
        if (currentStoryId) {
            const entry: HistoryEntry = { mode: state.mode, storyId: currentStoryId, page: isPrototypeMode ? framePage.hash : undefined };
            setStoryHistory((history) => [...history, entry]);
        }
    }

    function openStory(nodeId: string) {
        if (!storiesById.has(nodeId) || (nodeId === storyId && !isPrototypeMode)) {
            return;
        }
        rememberCurrentStory();
        setInspecting(false);
        setOverlayPanelOpen(false);
        updateState({ mode: "components", storyId: nodeId });
        openInStorybook(nodeId);
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
        setShowingFlow(false);
        const frameWindow = frameRef.current?.contentWindow;
        // The prototype in the frame navigates itself, which keeps its state, like a click in its own navigation
        if (storyId === prototypeId && isComparing) {
            setPrototypeStartPage(pageId);
        } else if (storyId === prototypeId && frameWindow) {
            frameWindow.location.hash = pageId;
        } else {
            setPrototypeStartPage(pageId);
            updateState({ prototypeId: storyId });
        }
    }

    function toggleFlow() {
        setInspecting(false);
        setFrameTool(null);
        if (!showingFlow) {
            setPrototypeStartPage(shownPage);
        }
        setShowingFlow(!showingFlow);
    }

    function startPresenting() {
        setInspecting(false);
        setFrameTool(null);
        setOverlayPanelOpen(false);
        setShowingFlow(false);
        setPresenting(true);
    }

    useEffect(() => {
        if (!presenting) {
            return;
        }
        const frameDocuments = [document, frameRef.current?.contentDocument].filter((target): target is Document => target != null);
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setPresenting(false);
            }
        };
        frameDocuments.forEach((target) => target.addEventListener("keydown", handleKey));
        return () => frameDocuments.forEach((target) => target.removeEventListener("keydown", handleKey));
    }, [presenting, frameLoadCount]);

    function toggleFrameTool(tool: FrameTool) {
        setInspecting(false);
        setFrameTool(frameTool === tool ? null : tool);
    }

    function changeCompare(compare: WorkspaceCompare) {
        setInspecting(false);
        setFrameTool(null);
        if (!isComparing) {
            setPrototypeStartPage(framePage.hash);
        }
        updateState({ compare });
    }

    function changeMode(mode: WorkspaceMode) {
        setInspecting(false);
        setFrameTool(null);
        // The prototype opens again on the page it was left on
        setPrototypeStartPage(isPrototypeMode ? shownPage : prototypeStartPage);
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
                openInStorybook(previous.storyId);
            }
        }
    }

    function openInStorybook(nextStoryId: string) {
        if (storybookPage == null) {
            return;
        }
        const url = `${storybookPage}?path=/story/${encodeURIComponent(nextStoryId)}`;
        // The loaded frame may have moved on from its first address, so it navigates itself instead of getting a new one
        const frameWindow = storybookFrameRef.current?.contentWindow;
        if (frameWindow) {
            frameWindow.location.href = new URL(url, document.baseURI).href;
        } else {
            setStorybookSrc(url);
        }
    }

    function restartPrototype() {
        setPrototypeStartPage("");
        setReloadKey((key) => key + 1);
    }

    function reloadFrame() {
        if (!isPrototypeMode) {
            storybookFrameRef.current?.contentWindow?.location.reload();
            return;
        }
        setPrototypeStartPage(shownPage);
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
    const storyUrl = prototypeId ? `iframe.html?id=${encodeURIComponent(prototypeId)}&viewMode=story` : null;
    const frameSrc = storyUrl && prototypeStartPage ? `${storyUrl}#${prototypeStartPage}` : storyUrl;
    // Storybook's own UI keeps its place in its address; the workspace only sets it when it opens a story, e.g. a picked component
    const storybookUrl = storybookPage == null ? null : storyId ? `${storybookPage}?path=/story/${encodeURIComponent(storyId)}` : storybookPage;
    const [storybookSrc, setStorybookSrc] = useState<string | null>(null);
    // Loaded the first time the Storybook tab opens, and kept from then on
    if (storybookUrl != null && storybookSrc == null && !isPrototypeMode) {
        setStorybookSrc(storybookUrl);
    }
    const storybookStoryId = useStorybookStoryId(storybookFrameRef, !isPrototypeMode);
    useEffect(() => {
        if (storybookStoryId && storybookStoryId !== state.storyId) {
            updateState({ storyId: storybookStoryId });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only the story Storybook shows changes the stored one here
    }, [storybookStoryId]);
    // A prototype titles the document after its page, e.g. "Job ads · Career portal"
    const prototypePageLabel = !isPrototypeMode ? "" : isComparing ? getPageLabel(currentPrototypePageId ?? "") : framePage.title.split(" · ")[0];

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
            <div className={styles.root} data-resizing={resizing ?? undefined} data-presenting={presenting || undefined}>
                <header className={styles.header}>
                    <div className={styles.toolbar}>
                        <div className={styles.brand}>
                            {isPrototypeMode && (
                                <IconButton
                                    variant="text"
                                    color="secondary"
                                    aria-label={panelVisible ? "Hide prototypes" : "Show prototypes"}
                                    aria-expanded={panelVisible}
                                    onClick={togglePanel}
                                >
                                    <Icon name={panelVisible ? "sidebar-close" : "sidebar-open"} />
                                </IconButton>
                            )}
                            <img className={styles.logo} src={workspaceLogo} alt="Next UI Workspace" />
                        </div>

                        <Tabs className={styles.modeTabs} aria-label="Workspace" items={modeTabs} value={state.mode} onChange={changeMode} />

                        <div className={styles.settings}>
                            {isPrototypeMode && (
                                <SettingMenu label="Compare" options={compareOptions} value={state.compare} onChange={changeCompare} />
                            )}
                            {isComparing && (
                                <SegmentedControl
                                    size="small"
                                    aria-label="Zoom"
                                    options={zoomOptions}
                                    value={state.zoom}
                                    onChange={(zoom) => updateState({ zoom })}
                                />
                            )}
                            {isPrototypeMode && !isComparing && !showingFlow && (
                                <ViewportControl
                                    responsive={state.responsive}
                                    onResponsiveChange={() => updateState({ responsive: true })}
                                    width={state.width}
                                    height={state.height}
                                    zoom={state.zoom}
                                    onSizeChange={(size) => updateState({ ...size, responsive: false })}
                                    onZoomChange={(zoom) => updateState({ zoom })}
                                />
                            )}
                            {isPrototypeMode && (
                                <SettingMenu
                                    label="Content"
                                    icon={<Icon name="file-data" />}
                                    options={scenarioOptions}
                                    value={scenario}
                                    onChange={scenarioSetting.store}
                                />
                            )}
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
                                disabled={isPrototypeMode ? !storyUrl : storybookSrc == null}
                                onClick={() => {
                                    if (!isPrototypeMode) {
                                        window.open(storybookFrameRef.current?.contentWindow?.location.href ?? storybookSrc ?? undefined, "_blank");
                                    } else if (storyUrl) {
                                        // The link keeps the toolbar's settings, so whoever opens it sees the prototype as it's shown here
                                        const settings = [colorSchemeSetting, brandSetting, densitySetting, scenarioSetting]
                                            .map((setting) => `&${setting.storageKey}=${encodeURIComponent(setting.get())}`)
                                            .join("");
                                        window.open(`${storyUrl}${settings}${shownPage ? `#${shownPage}` : ""}`, "_blank");
                                    }
                                }}
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
                                    {currentCustomPage ? (
                                        <input
                                            key={`${currentCustomPage.id}-${currentCustomPage.title}`}
                                            className={styles.locationInput}
                                            aria-label="Page name"
                                            title="Rename the page"
                                            defaultValue={currentCustomPage.title}
                                            size={Math.max(8, currentCustomPage.title.length)}
                                            onBlur={(event) => {
                                                renameCurrentPage(event.currentTarget.value);
                                                // An empty name isn't kept, so the field shows the name again
                                                if (event.currentTarget.value.trim() === "") {
                                                    event.currentTarget.value = currentCustomPage.title;
                                                }
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.currentTarget.blur();
                                                } else if (event.key === "Escape") {
                                                    event.currentTarget.value = currentCustomPage.title;
                                                    event.currentTarget.blur();
                                                }
                                            }}
                                        />
                                    ) : (
                                        prototypePageLabel && <span className={styles.locationCurrent}>{prototypePageLabel}</span>
                                    )}
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
                                <IconButton
                                    variant={showingFlow ? "contained" : "text"}
                                    color={showingFlow ? "primary" : "secondary"}
                                    aria-label="Show the flow map"
                                    aria-pressed={showingFlow}
                                    onClick={toggleFlow}
                                >
                                    <Icon name="tune-logic" />
                                </IconButton>
                            )}
                            {isPrototypeMode && (
                                <IconButton variant="text" color="secondary" aria-label="Present the prototype" onClick={startPresenting}>
                                    <Icon name="eye" />
                                </IconButton>
                            )}
                            {isPrototypeMode && currentCustomPage && (
                                <IconButton
                                    variant="text"
                                    color="secondary"
                                    aria-label={`Delete “${currentCustomPage.title}”`}
                                    onClick={removeCurrentPage}
                                >
                                    <Icon name="trash" />
                                </IconButton>
                            )}
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
                            {isPrototypeMode && !isComparing && !showingFlow && (
                                <IconButton
                                    variant={inspecting ? "contained" : "text"}
                                    color={inspecting ? "primary" : "secondary"}
                                    aria-label="Pick a component in the canvas"
                                    aria-pressed={inspecting}
                                    onClick={() => {
                                        setFrameTool(null);
                                        setInspecting(!inspecting);
                                    }}
                                >
                                    <Icon name="select" />
                                </IconButton>
                            )}
                            {isPrototypeMode && !isComparing && !showingFlow && (
                                <IconButton
                                    variant={frameTool === "measure" ? "contained" : "text"}
                                    color={frameTool === "measure" ? "primary" : "secondary"}
                                    aria-label="Measure sizes, distances, and tokens"
                                    aria-pressed={frameTool === "measure"}
                                    onClick={() => toggleFrameTool("measure")}
                                >
                                    <Icon name="crop-action" />
                                </IconButton>
                            )}
                            {isPrototypeMode && !isComparing && !showingFlow && (
                                <IconButton
                                    variant={frameTool === "comment" ? "contained" : "text"}
                                    color={frameTool === "comment" ? "primary" : "secondary"}
                                    aria-label="Pin comments to the page"
                                    aria-pressed={frameTool === "comment"}
                                    onClick={() => toggleFrameTool("comment")}
                                >
                                    <Icon name="chat-add" />
                                </IconButton>
                            )}
                            {isPrototypeMode && !isComparing && !showingFlow && (
                                <IconButton
                                    variant={frameTool === "text" ? "contained" : "text"}
                                    color={frameTool === "text" ? "primary" : "secondary"}
                                    aria-label="Edit texts"
                                    aria-pressed={frameTool === "text"}
                                    onClick={() => toggleFrameTool("text")}
                                >
                                    <Icon name="pencil-line" />
                                </IconButton>
                            )}
                            {isPrototypeMode && !isComparing && !showingFlow && (
                                <IconButton
                                    variant={frameTool === "accessibility" ? "contained" : "text"}
                                    color={frameTool === "accessibility" ? "primary" : "secondary"}
                                    aria-label="Check accessibility"
                                    aria-pressed={frameTool === "accessibility"}
                                    onClick={() => toggleFrameTool("accessibility")}
                                >
                                    <Icon name="contrast" />
                                </IconButton>
                            )}
                        </div>
                    </div>
                </header>

                {/* Storybook's own UI stays loaded while a prototype shows, so it keeps the page it was on */}
                <div className={styles.body} hidden={isPrototypeMode}>
                    {storybookSrc != null && (
                        <iframe
                            key={`storybook-${reloadKey}`}
                            ref={storybookFrameRef}
                            className={styles.storybookFrame}
                            src={storybookSrc}
                            title="Storybook"
                        />
                    )}
                </div>

                {isPrototypeMode && (
                    <div className={styles.body}>
                        {presenting && (
                            <Button
                                className={styles.presentExit}
                                variant="outlined"
                                color="secondary"
                                size="small"
                                startIcon={<Icon name="close" />}
                                onClick={() => setPresenting(false)}
                            >
                                Exit presentation · Esc
                            </Button>
                        )}
                        {panelVisible && !presenting && narrow && <div className={styles.panelBackdrop} onClick={() => setOverlayPanelOpen(false)} />}
                        {panelVisible && !presenting && (
                            <nav
                                className={styles.panel}
                                aria-label="Prototypes"
                                data-overlay={narrow || undefined}
                                style={{ inlineSize: narrow ? undefined : state.panelWidth }}
                                onKeyDown={(event) => narrow && event.key === "Escape" && setOverlayPanelOpen(false)}
                            >
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
                                <div className={styles.panelFooter}>
                                    <Menu
                                        open={newPageMenuOpen}
                                        onOpenChange={setNewPageMenuOpen}
                                        placement="top-start"
                                        trigger={
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                size="small"
                                                startIcon={<Icon name="plus" />}
                                                disabled={!prototypeId}
                                            >
                                                New page
                                            </Button>
                                        }
                                    >
                                        {pageTemplates.map((template) => (
                                            <MenuItem key={template.value} label={template.label} onClick={() => addPage(template.value)} />
                                        ))}
                                    </Menu>
                                </div>
                            </nav>
                        )}
                        {panelVisible && !presenting && !narrow && (
                            <div
                                role="separator"
                                aria-orientation="vertical"
                                aria-label="Resize prototypes panel"
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

                        {showingFlow && storyUrl && prototypeId ? (
                            <FlowMap
                                prototypeId={prototypeId}
                                storyUrl={storyUrl}
                                startPageId={currentWorkspacePrototype?.startPageId ?? ""}
                                pageIds={[...(currentWorkspacePrototype?.designedPageIds ?? []), ...prototypeCustomPages.map((page) => page.id)]}
                                getPageLabel={getPageLabel}
                                onOpenPage={(page) => {
                                    setPrototypeStartPage(page);
                                    setShowingFlow(false);
                                }}
                            />
                        ) : isComparing && storyUrl ? (
                            <CompareCanvas
                                mode={state.compare === "variants" ? "variants" : "viewports"}
                                storyUrl={storyUrl}
                                startPage={prototypeStartPage}
                                density={density}
                                zoom={state.zoom}
                                reloadKey={reloadKey}
                                onPageChange={setPrototypeStartPage}
                            />
                        ) : (
                            <div ref={setCanvasElement} className={styles.canvas} data-responsive={state.responsive || undefined}>
                                <div
                                    className={styles.stage}
                                    style={state.responsive ? undefined : { width: state.width * scale, height: state.height * scale }}
                                >
                                    {!state.responsive && (
                                        <div className={styles.frameLabel}>
                                            <span className={styles.frameStory}>{currentPrototype ? getStoryLabel(currentPrototype) : ""}</span>
                                            <span>
                                                {state.width} × {state.height} · {Math.round(scale * 100)} %
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        className={styles.frame}
                                        style={
                                            state.responsive ? undefined : { width: state.width, height: state.height, transform: `scale(${scale})` }
                                        }
                                    >
                                        {storyUrl && (
                                            <iframe
                                                key={`${storyUrl}-${reloadKey}`}
                                                ref={frameRef}
                                                className={styles.iframe}
                                                src={frameSrc ?? undefined}
                                                title={currentPrototype ? `${currentPrototype.title} · ${currentPrototype.name}` : "Prototype"}
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
                                    {frameTool && (
                                        <FrameTools
                                            tool={frameTool}
                                            frameRef={frameRef}
                                            frameLoadCount={frameLoadCount}
                                            scale={scale}
                                            notePage={notePage}
                                            onExit={() => setFrameTool(null)}
                                        />
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
                        )}
                    </div>
                )}
            </div>
        </Theme>
    );
}
