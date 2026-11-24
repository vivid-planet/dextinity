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
import type { IconName } from "../../components/icon/iconRegistry";
import { IconButton } from "../../components/iconButton/IconButton";
import { Menu } from "../../components/menu/Menu";
import { MenuItem } from "../../components/menu/MenuItem";
import { SegmentedControl } from "../../components/segmentedControl/SegmentedControl";
import { Tabs } from "../../components/tabs/Tabs";
import { Theme } from "../../components/theme/Theme";
import { type TreeNode, TreeView } from "../../components/treeView/TreeView";
import { brandSetting } from "../brand";
import { colorSchemeSetting } from "../colorScheme";
import { densitySetting } from "../density";
import { scenarioSetting } from "../scenario";
import { textLengthSetting } from "../textLength";
import { CompareCanvas } from "./CompareCanvas";
import { getComponentStoryIds, type IndexedStory } from "./componentStories";
import { flowEdgeList } from "./flowEdges";
import { FlowMap } from "./FlowMap";
import { getElementPath } from "./frameElements";
import type { NotePage } from "./FrameNotes";
import { type FrameTool, FrameTools } from "./FrameTools";
import { hotspotList } from "./hotspots";
import { customPageList, customPagePrefix, type PageTemplate, pageTemplates } from "./pageTemplates";
import { buildPageTree, getPrototypePageNodeId } from "./prototypePageTree";
import { workspacePrototypes } from "./prototypes";
import { type InspectedComponent, useCanvasInspector } from "./useCanvasInspector";
import { useFramePage } from "./useFramePage";
import { ViewMenu } from "./ViewMenu";
import { WorkspaceGuide } from "./WorkspaceGuide";
import { workspaceLogo } from "./workspaceLogo";
import { commentList, textChangeList } from "./workspaceNotes";
import styles from "./WorkspaceShell.module.scss";
import {
    defaultWorkspaceState,
    useWorkspaceState,
    type WorkspaceCompare,
    type WorkspaceIntent,
    type WorkspaceMode,
    type WorkspaceTool,
} from "./workspaceState";
import { minFrameSize, SettingMenu, ViewportControl, zoomOptions } from "./WorkspaceToolbarControls";

const shellStoryId = "workspace-shell--shell";
const narrowQuery = "(width < 760px)";
const minPanelWidth = 260;
const maxPanelWidth = 520;
const panelKeyboardStep = 20;
const inspectLabelHeight = 18;
const prototypesTitle = "Workspace/Prototypes";
const compareOptions: Array<{ value: WorkspaceCompare; icon: ReactNode; "aria-label": string; shortLabel: string }> = [
    { value: "off", icon: <Icon name="window" />, "aria-label": "One frame", shortLabel: "Off" },
    { value: "viewports", icon: <Icon name="device-tablet" />, "aria-label": "Phone, tablet, and desktop side by side", shortLabel: "Devices" },
    { value: "variants", icon: <Icon name="swap-boxes" />, "aria-label": "Two variants side by side", shortLabel: "Variants" },
    { value: "swipe", icon: <Icon name="move-vertical" />, "aria-label": "Two variants on top of each other, with a divider", shortLabel: "Swipe" },
];

type ModeTab = WorkspaceIntent | "library";

// The modes by what the designer came to do, then Storybook's own UI as the library of components
const modeTabs: Array<{ value: ModeTab; label: string }> = [
    { value: "prototype", label: "Prototype" },
    { value: "inspect", label: "Inspect" },
    { value: "review", label: "Review" },
    { value: "flow", label: "Flow" },
    { value: "library", label: "Library" },
];

const intentKeys: Record<string, WorkspaceIntent> = { "1": "prototype", "2": "inspect", "3": "review", "4": "flow" };

/** The tools of each mode, which the bar under the modes shows as labeled buttons. */
/** The tools of each mode, which the bar under the modes shows as labeled buttons; the key opens the tool from any mode. */
const intentToolButtons: Record<WorkspaceIntent, Array<{ tool: WorkspaceTool; label: string; icon: IconName; description: string; key: string }>> = {
    prototype: [],
    inspect: [
        { tool: "component", label: "Component", icon: "select", description: "Click a component in the page to open its story", key: "I" },
        {
            tool: "measure",
            label: "Measure",
            icon: "crop-action",
            description: "Sizes, spacing, and tokens; point at another element for the distance",
            key: "M",
        },
        { tool: "accessibility", label: "Accessibility", icon: "contrast", description: "Tab order, small targets, and contrast", key: "A" },
    ],
    review: [
        { tool: "comment", label: "Comments", icon: "chat-add", description: "Pin comments to the page", key: "C" },
        { tool: "text", label: "Edit texts", icon: "pencil-line", description: "Click a text to change it", key: "E" },
    ],
    flow: [
        { tool: "map", label: "Flow map", icon: "tune-logic", description: "All pages and the links between them", key: "F" },
        { tool: "hotspot", label: "Link elements", icon: "link-diagonal", description: "Make an element open another page", key: "L" },
    ],
};

const toolKeys = new Map(
    Object.entries(intentToolButtons).flatMap(([intent, buttons]) =>
        buttons.map((button) => [button.key.toLowerCase(), { intent: intent as WorkspaceIntent, tool: button.tool }] as const),
    ),
);

// The tools that end themselves on Escape, e.g. Measure first clears its selection
const toolsWithOwnEscape: Array<WorkspaceTool | null> = ["measure", "component"];

// Typing in a field or a text of the page doesn't switch the mode or tool, and Escape there belongs to the field
function isTyping(target: EventTarget | null) {
    const element = target as HTMLElement | null;
    return element?.closest?.("input, textarea, select, [contenteditable]") != null;
}

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
        void fetch(new URL("storybook.html", document.baseURI), { method: "HEAD" })
            .then((response) => setPage(response.ok ? "storybook.html" : "./"))
            .catch(() => setPage("./"));
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
    const density = densitySetting.useValue();
    const [canvasElement, setCanvasElement] = useState<HTMLDivElement | null>(null);
    const [resizing, setResizing] = useState<"frame" | "panel" | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [frameLoadCount, setFrameLoadCount] = useState(0);
    // Shows only the prototype, without the workspace around it, e.g. to walk stakeholders through it
    const [presenting, setPresenting] = useState(false);
    // An element to measure right away, chosen with a double click while clicking through
    const [measuredPath, setMeasuredPath] = useState<number[] | null>(null);
    // The stories opened before the current one, most recent last, to go back to the page a component was picked on
    const [storyHistory, setStoryHistory] = useState<HistoryEntry[]>([]);
    // The prototype's page to open the frame on; the prototype keeps the page it navigates to in the frame's hash
    const [prototypeStartPage, setPrototypeStartPage] = useState("");
    const frameRef = useRef<HTMLIFrameElement>(null);
    const storybookFrameRef = useRef<HTMLIFrameElement>(null);
    const storybookPage = useStorybookPage();
    const framePage = useFramePage(frameRef, frameLoadCount);
    // The element's path belongs to the page it was double clicked on
    useEffect(() => setMeasuredPath(null), [framePage.hash]);
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

    useEffect(() => {
        void fetchStories().then(setStories);
    }, []);

    const componentStories = useMemo(() => stories.filter((story) => !isPrototype(story)), [stories]);
    const prototypes = useMemo(() => stories.filter(isPrototype), [stories]);
    const isLoading = stories.length === 0;
    const isPrototypeMode = state.mode === "prototypes";
    const intent = state.intent;
    // Presenting shows the prototype as it is, without the tool of the mode it was started from
    const activeTool = intent === "prototype" || presenting ? null : (state.intentTools[intent] ?? null);
    // Comparing is a way of inspecting; the other modes show the single frame
    const isComparing = isPrototypeMode && !presenting && intent === "inspect" && state.compare !== "off";
    const isSingleFrame = isPrototypeMode && !isComparing && !(intent === "flow" && activeTool === "map");
    const showingFlow = isPrototypeMode && intent === "flow" && activeTool === "map";
    const inspecting = isPrototypeMode && !isComparing && activeTool === "component";
    const frameTool: FrameTool | null =
        isPrototypeMode && !isComparing && activeTool && activeTool !== "component" && activeTool !== "map" ? activeTool : null;

    function setTool(tool: WorkspaceTool | null) {
        setMeasuredPath(null);
        // The flow map takes the single frame's place; the frame opens again on the page it was left on
        if (tool === "map" && isSingleFrame) {
            setPrototypeStartPage(framePage.hash);
        }
        if (intent !== "prototype") {
            updateState({ intentTools: { ...state.intentTools, [intent]: tool } });
        }
    }

    function changeIntent(next: WorkspaceIntent) {
        setMeasuredPath(null);
        // Only the single frame knows its page; the flow map, comparing, and Library keep it in the start page already
        if (isSingleFrame) {
            setPrototypeStartPage(framePage.hash);
        }
        updateState({ mode: "prototypes", intent: next });
    }

    // A stored story may since have been removed or renamed; until the index has loaded, there's nothing to check it against
    const storedStoryId = isLoading || componentStories.some((story) => story.id === state.storyId) ? state.storyId : null;
    const storyId = storedStoryId ?? componentStories.find((story) => story.title.startsWith("Workspace/"))?.id ?? componentStories[0]?.id ?? null;
    const currentStory = componentStories.find((story) => story.id === storyId);
    const storedPrototypeId = isLoading || prototypes.some((story) => story.id === state.prototypeId) ? state.prototypeId : null;
    const prototypeId = storedPrototypeId ?? prototypes[0]?.id ?? null;
    const currentPrototype = prototypes.find((story) => story.id === prototypeId);

    const customPages = customPageList.useItems();
    const [newPageMenuOpen, setNewPageMenuOpen] = useState(false);
    const prototypeTrees = useMemo(
        () =>
            prototypes.map((story) => {
                const prototype = workspacePrototypes.get(story.id);
                const pageTree = prototype
                    ? buildPageTree({
                          storyId: story.id,
                          pageIds: prototype.designedPageIds,
                          getPageLabel: prototype.getPageLabel,
                          getPageAncestors: prototype.getPageAncestors,
                          groupIcon: <span className={styles.pageGroupMarker} />,
                      })
                    : undefined;
                const node: TreeNode = {
                    id: story.id,
                    label: story.name,
                    icon: <Icon name="window" />,
                    children: [
                        ...(pageTree?.nodes ?? []),
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
                return { node, pageTree };
            }),
        [prototypes, customPages],
    );
    const prototypeNodes = prototypeTrees.map((tree) => tree.node);
    // Until the tree is first changed, the prototypes and the groups of their menus are open, the pages with detail pages closed
    const [prototypeExpandedIds, setPrototypeExpandedIds] = useState<string[] | null>(null);
    const visiblePrototypeExpandedIds = prototypeExpandedIds ?? prototypeTrees.flatMap((tree) => [tree.node.id, ...(tree.pageTree?.groupIds ?? [])]);
    // While comparing, the frames report their page to the start page, which the single frame then opens on again
    const shownPage = isComparing ? prototypeStartPage : framePage.hash;
    const currentPrototypePageId = shownPage || workspacePrototypes.get(prototypeId ?? "")?.startPageId;
    const currentWorkspacePrototype = workspacePrototypes.get(prototypeId ?? "");
    const selectedPrototypeNodeId = prototypeId && currentPrototypePageId ? getPrototypePageNodeId(prototypeId, currentPrototypePageId) : undefined;
    // A page opened in the frame or the flow map shows in the list, also when it's in a closed part of the tree
    const [revealedPrototypeNodeId, setRevealedPrototypeNodeId] = useState(selectedPrototypeNodeId);
    if (selectedPrototypeNodeId !== revealedPrototypeNodeId) {
        setRevealedPrototypeNodeId(selectedPrototypeNodeId);
        const pageTree = prototypeTrees.find((tree) => tree.node.id === prototypeId)?.pageTree;
        const closedIds = [prototypeId ?? "", ...(pageTree?.getAncestorIds(selectedPrototypeNodeId ?? "") ?? [])].filter(
            (id) => id !== "" && !visiblePrototypeExpandedIds.includes(id),
        );
        if (closedIds.length > 0) {
            setPrototypeExpandedIds([...visiblePrototypeExpandedIds, ...closedIds]);
        }
    }
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
            const removedId = currentCustomPage.id;
            hotspotList.update((hotspots) =>
                hotspots.filter((hotspot) => !(hotspot.prototypeId === prototypeId && (hotspot.page === removedId || hotspot.target === removedId))),
            );
            flowEdgeList.update((edges) =>
                edges.filter((edge) => !(edge.prototypeId === prototypeId && (edge.from === removedId || edge.to === removedId))),
            );
            selectPrototypeNode(getPrototypePageNodeId(prototypeId, currentWorkspacePrototype?.startPageId ?? ""));
        }
    }

    const notePage: NotePage = {
        prototypeId: prototypeId ?? "",
        page: currentPrototypePageId ?? "",
        pageIds: [...(currentWorkspacePrototype?.designedPageIds ?? []), ...prototypeCustomPages.map((page) => page.id)],
        getPageLabel,
        onOpenPage: (page) => {
            const frameWindow = frameRef.current?.contentWindow;
            if (frameWindow) {
                frameWindow.location.hash = page;
            }
        },
    };
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
        setOverlayPanelOpen(false);
        setMeasuredPath(null);
        // A page picked in the list opens in the frame, also from the flow map
        if (showingFlow) {
            setTool(null);
        }
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

    function startPresenting() {
        setOverlayPanelOpen(false);
        setPresenting(true);
    }

    useEffect(() => {
        if (!presenting) {
            return;
        }
        // Also the frames of the compare modes, where the focus may be when Escape is pressed
        const frameDocuments = [document, ...Array.from(document.querySelectorAll("iframe"), (frame) => frame.contentDocument)].filter(
            (target): target is Document => target != null,
        );
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setPresenting(false);
            }
        };
        frameDocuments.forEach((target) => target.addEventListener("keydown", handleKey));
        return () => frameDocuments.forEach((target) => target.removeEventListener("keydown", handleKey));
    }, [presenting, frameLoadCount]);

    function changeCompare(compare: WorkspaceCompare) {
        if (!isComparing) {
            setPrototypeStartPage(framePage.hash);
        }
        updateState({ compare });
    }

    function changeModeTab(tab: ModeTab) {
        if (tab === "library") {
            // The prototype opens again on the page it was left on
            setPrototypeStartPage(isPrototypeMode ? shownPage : prototypeStartPage);
            updateState({ mode: "components" });
        } else {
            changeIntent(tab);
        }
    }

    /** Opens a tool, in its mode; the key of the tool that's open closes it again. */
    function toggleToolOfMode(next: WorkspaceIntent, tool: WorkspaceTool) {
        // The tools of Inspect work on the single frame, so their key ends comparing
        const compare = next === "inspect" ? "off" : state.compare;
        if (isPrototypeMode && next === intent && !isComparing) {
            setTool(activeTool === tool ? null : tool);
            return;
        }
        setMeasuredPath(null);
        // Only the single frame knows its page; the next mode's view opens on it
        if (isSingleFrame) {
            setPrototypeStartPage(framePage.hash);
        }
        updateState({ mode: "prototypes", intent: next, compare, intentTools: { ...state.intentTools, [next]: tool } });
    }

    // 1–4 switch the mode, a tool's letter opens the tool, and Escape closes it, also while the focus is in the prototype's frame
    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            // A key that a field, an editor, or a list already used, e.g. Escape ending a text edit or a letter jumping in a tree, is theirs
            const target = event.target as Element | null;
            // The workspace's page list jumps to a page by its first letter too, but there the tool's key wins
            const inPageList = target?.closest?.("[data-prototypes]") != null;
            if (
                presenting ||
                (event.defaultPrevented && !inPageList) ||
                event.repeat ||
                event.metaKey ||
                event.ctrlKey ||
                event.altKey ||
                isTyping(event.target)
            ) {
                return;
            }
            if (event.key === "Escape") {
                // An open menu, dialog, or overlay panel closes first
                if (
                    activeTool &&
                    !toolsWithOwnEscape.includes(activeTool) &&
                    !target?.closest?.('[role="menu"], [role="dialog"], [role="alertdialog"], [role="listbox"], nav[data-overlay]')
                ) {
                    setTool(null);
                }
                return;
            }
            const next = intentKeys[event.key];
            const toolKey = toolKeys.get(event.key.toLowerCase());
            // Lists jump to an entry by its first letter, so a letter there isn't a tool's key; the workspace's own page list is for
            // moving around, where the keys are worth more
            const inList =
                target?.closest?.('[role="tree"], [role="treegrid"], [role="menu"], [role="listbox"], [role="grid"], [role="combobox"]') &&
                !inPageList;
            if (next) {
                changeIntent(next);
            } else if (toolKey && !event.shiftKey && !inList) {
                toggleToolOfMode(toolKey.intent, toolKey.tool);
            }
        };
        const documents = [document, frameRef.current?.contentDocument].filter((target): target is Document => target != null);
        documents.forEach((target) => target.addEventListener("keydown", handleKey));
        return () => documents.forEach((target) => target.removeEventListener("keydown", handleKey));
    });

    // A double click on an element while clicking through opens it in Inspect, measured
    useEffect(() => {
        const frameDocument = frameRef.current?.contentDocument;
        if (!isPrototypeMode || intent !== "prototype" || presenting || !frameDocument) {
            return;
        }
        const handleDoubleClick = (event: MouseEvent) => {
            const target = event.target as Element | null;
            // A double click in a field selects a word, one on a control uses it twice; neither asks to inspect
            if (target?.nodeType !== Node.ELEMENT_NODE || isTyping(target) || target.closest('a, button, [role="button"], [role="link"], label')) {
                return;
            }
            setMeasuredPath(getElementPath(target));
            setPrototypeStartPage(framePage.hash);
            // Measured in the single frame, also when comparing was on in Inspect before
            updateState({ intent: "inspect", compare: "off", intentTools: { ...state.intentTools, inspect: "measure" } });
        };
        frameDocument.addEventListener("dblclick", handleDoubleClick);
        return () => frameDocument.removeEventListener("dblclick", handleDoubleClick);
    });

    function goBack() {
        const previous = storyHistory.at(-1);
        if (previous) {
            setStoryHistory((history) => history.slice(0, -1));
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
        if (storybookPage != null) {
            setStorybookSrc(`${storybookPage}?path=/story/${encodeURIComponent(nextStoryId)}`);
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
            openStory(component.storyId);
        },
        onExit: () => setTool(null),
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
    if (storybookUrl != null && storybookSrc == null) {
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

                        <Tabs
                            className={styles.modeTabs}
                            aria-label="Mode"
                            items={modeTabs}
                            value={isPrototypeMode ? intent : "library"}
                            onChange={changeModeTab}
                        />

                        <div className={styles.settings}>
                            {isPrototypeMode && <ViewMenu />}
                            {isPrototypeMode && (
                                <IconButton variant="text" color="secondary" aria-label="Present the prototype" onClick={startPresenting}>
                                    <Icon name="eye" />
                                </IconButton>
                            )}
                            <IconButton
                                variant="text"
                                color="secondary"
                                aria-label={isPrototypeMode ? "Open the prototype with this view in a new tab" : "Open the story in a new tab"}
                                disabled={isPrototypeMode ? !storyUrl : storybookSrc == null}
                                onClick={() => {
                                    if (!isPrototypeMode) {
                                        window.open(storybookFrameRef.current?.contentWindow?.location.href ?? storybookSrc ?? undefined, "_blank");
                                    } else if (storyUrl) {
                                        // The link keeps the view, so whoever opens it sees the prototype as it's shown here
                                        const settings = [colorSchemeSetting, brandSetting, densitySetting, scenarioSetting, textLengthSetting]
                                            .map((setting) => `&${setting.storageKey}=${encodeURIComponent(setting.get())}`)
                                            .join("");
                                        window.open(`${storyUrl}${settings}${shownPage ? `#${shownPage}` : ""}`, "_blank");
                                    }
                                }}
                            >
                                <Icon name="external-link" />
                            </IconButton>
                            <IconButton variant="text" color="secondary" aria-label="Reload" onClick={reloadFrame}>
                                <Icon name="refresh" />
                            </IconButton>
                            {isPrototypeMode && <WorkspaceGuide />}
                        </div>
                    </div>

                    <div className={styles.contextBar} data-centered={isPrototypeMode || undefined}>
                        <div className={styles.contextStart}>
                            <IconButton
                                variant="text"
                                color="secondary"
                                aria-label={previousStory ? `Back to ${getStoryLabel(previousStory)}` : "Back"}
                                disabled={!previousStory}
                                onClick={goBack}
                            >
                                <Icon name="back" />
                            </IconButton>
                            {isPrototypeMode && (
                                <IconButton variant="text" color="secondary" aria-label="Restart the prototype" onClick={restartPrototype}>
                                    <Icon name="home" />
                                </IconButton>
                            )}
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
                                        {currentCustomPage && (
                                            <IconButton
                                                variant="text"
                                                color="secondary"
                                                aria-label={`Delete “${currentCustomPage.title}”`}
                                                onClick={removeCurrentPage}
                                            >
                                                <Icon name="trash" />
                                            </IconButton>
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
                        </div>
                        {isPrototypeMode && (
                            <div className={styles.contextCenter}>
                                {intent === "inspect" && (
                                    <SettingMenu
                                        label="Compare"
                                        options={compareOptions}
                                        value={state.compare}
                                        onChange={changeCompare}
                                        showLabel={!narrow}
                                    />
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
                                {!isComparing && !showingFlow && (
                                    <ViewportControl
                                        showLabel={!narrow}
                                        responsive={state.responsive}
                                        onResponsiveChange={() => updateState({ responsive: true })}
                                        width={state.width}
                                        height={state.height}
                                        zoom={state.zoom}
                                        onSizeChange={(size) => updateState({ ...size, responsive: false })}
                                        onZoomChange={(zoom) => updateState({ zoom })}
                                    />
                                )}
                            </div>
                        )}
                        {isPrototypeMode && (
                            <div
                                className={styles.toolbarGroup}
                                role="group"
                                aria-label={`${modeTabs.find((tab) => tab.value === intent)?.label} tools`}
                            >
                                {/* Comparing shows several frames, where the tools of the single frame don't work, so it takes their place */}
                                {!isComparing &&
                                    intentToolButtons[intent].map(({ tool, label, icon, description, key }) => (
                                        <Button
                                            key={tool}
                                            variant={activeTool === tool ? "contained" : "text"}
                                            color={activeTool === tool ? "primary" : "secondary"}
                                            size="small"
                                            startIcon={<Icon name={icon} />}
                                            aria-pressed={activeTool === tool}
                                            title={`${description} · ${key}`}
                                            aria-keyshortcuts={key}
                                            onClick={() => setTool(activeTool === tool ? null : tool)}
                                        >
                                            {label}
                                        </Button>
                                    ))}
                            </div>
                        )}
                    </div>
                </header>

                {!isPrototypeMode ? (
                    <div className={styles.body}>
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
                ) : (
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
                                        selectedId={selectedPrototypeNodeId}
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
                                    setTool(null);
                                }}
                            />
                        ) : isComparing && storyUrl ? (
                            <CompareCanvas
                                mode={state.compare === "off" ? "viewports" : state.compare}
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
                                            measuredPath={measuredPath ?? undefined}
                                            onExit={() => setTool(null)}
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
