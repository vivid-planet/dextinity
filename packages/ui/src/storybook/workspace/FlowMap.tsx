import { type KeyboardEvent, type PointerEvent, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Button } from "../../components/button/Button";
import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Switch } from "../../components/switch/Switch";
import { Tooltip } from "../../components/tooltip/Tooltip";
import { scenarioSetting } from "../scenario";
import { addFlowEdges, type FlowEdge, flowEdgeList } from "./flowEdges";
import {
    fitFlowView,
    type FlowLink,
    type FlowRect,
    type FlowView,
    layOutFlow,
    revealFlowRect,
    routeFlowLinks,
    stepFlowZoom,
    wheelZoomFactor,
    zoomFlowViewAt,
} from "./flowLayout";
import styles from "./FlowMap.module.scss";
import { hotspotList } from "./hotspots";

const nodeWidth = 200;
const nodeHeight = 48;
const columnGap = 120;
const rowGap = 24;
const padding = 48;
const scanDelay = 700;
const lineHeightInPixels = 16;
// Each prototype is scanned once per visit of the workspace on opening the map, its pages rarely change in between; the entries of
// its navigation stay known for opening the map again
const navigationByPrototype = new Map<string, string[]>();

interface FlowNode extends FlowRect {
    id: string;
    label: string;
    inNavigation: boolean;
    designed: boolean;
    deadEnd: boolean;
}

function wait(milliseconds: number) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function readLinks(frameDocument: Document) {
    const links = Array.from(frameDocument.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const toPage = (link: HTMLAnchorElement) => decodeURIComponent(link.getAttribute("href")?.slice(1) ?? "");
    return {
        content: links
            .filter((link) => !link.closest("nav"))
            .map(toPage)
            .filter(Boolean),
        navigation: links
            .filter((link) => link.closest("nav"))
            .map(toPage)
            .filter(Boolean),
    };
}

/**
 * All pages of a prototype as a map of the ways between them: the links found on its pages, and the ones the designer took while
 * clicking through it. Shows pages no link leads to, links to pages without a design, and pages without a way on.
 */
export function FlowMap({
    prototypeId,
    storyUrl,
    startPageId,
    pageIds,
    getPageLabel,
    onOpenPage,
}: {
    prototypeId: string;
    storyUrl: string;
    startPageId: string;
    /** The pages with a design, including the ones the designer added. */
    pageIds: string[];
    getPageLabel: (pageId: string) => string;
    onOpenPage: (pageId: string) => void;
}) {
    const recordedEdges = flowEdgeList.useItems();
    const hotspots = hotspotList.useItems();
    // A hotspot is a link too, already before anyone clicked it
    const edges = useMemo(
        () => [
            ...recordedEdges.filter((edge) => edge.prototypeId === prototypeId),
            ...hotspots
                .filter((hotspot) => hotspot.prototypeId === prototypeId)
                .map((hotspot): FlowEdge => ({ prototypeId, from: hotspot.page, to: hotspot.target, kind: "link" })),
        ],
        [recordedEdges, hotspots, prototypeId],
    );
    const [scan, setScan] = useState<{ done: number; total: number } | null>(null);
    const [navigationIds, setNavigationIds] = useState<string[]>(() => navigationByPrototype.get(prototypeId) ?? []);
    const [scanFrameLoaded, setScanFrameLoaded] = useState(false);
    const scanFrameRef = useRef<HTMLIFrameElement>(null);
    // Closing the map ends a scan; the frame it reads is gone then, and what it found so far is incomplete
    const unmountedRef = useRef(false);
    useEffect(
        () => () => {
            unmountedRef.current = true;
        },
        [],
    );
    const scanStarted = useRef(false);

    async function scanPages() {
        const frameWindow = scanFrameRef.current?.contentWindow;
        if (!frameWindow || !scanFrameLoaded || scanStarted.current) {
            return;
        }
        scanStarted.current = true;
        const found: FlowEdge[] = [];
        const navigation = new Set<string>();
        for (const [index, pageId] of pageIds.entries()) {
            setScan({ done: index, total: pageIds.length });
            frameWindow.location.hash = pageId;
            await wait(scanDelay);
            if (unmountedRef.current) {
                return;
            }
            const links = readLinks(frameWindow.document);
            links.content.forEach((to) => found.push({ prototypeId, from: pageId, to, kind: "link" }));
            links.navigation.forEach((id) => navigation.add(id));
        }
        addFlowEdges(found);
        navigationByPrototype.set(prototypeId, [...navigation]);
        setNavigationIds([...navigation]);
        setScan(null);
        scanStarted.current = false;
    }

    const [showsNavigationLinks, setShowsNavigationLinks] = useState(false);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    const { nodes, rects, contentLinks, navigationLinks, width, height } = useMemo(() => {
        const linkTargets = new Map<string, Set<string>>();
        for (const edge of edges.filter((candidate) => candidate.kind === "link")) {
            linkTargets.set(edge.from, (linkTargets.get(edge.from) ?? new Set()).add(edge.to));
        }
        const navigation = new Set([...navigationIds, ...edges.filter((edge) => edge.kind === "navigation").map((edge) => edge.to)]);
        const allIds = [...new Set([...pageIds, ...linkTargets.keys(), ...[...linkTargets.values()].flatMap((targets) => [...targets])])];
        const placements = layOutFlow({
            pageIds: allIds,
            startPageId,
            links: linkTargets,
            navigationIds: navigation,
            compare: (a, b) => getPageLabel(a).localeCompare(getPageLabel(b)),
        });
        const flowNodes: FlowNode[] = placements.map(({ id, column, row }) => {
            const designed = pageIds.includes(id);
            return {
                id,
                label: getPageLabel(id),
                x: padding + column * (nodeWidth + columnGap),
                y: padding + row * (nodeHeight + rowGap),
                width: nodeWidth,
                height: nodeHeight,
                inNavigation: navigation.has(id),
                designed,
                deadEnd: designed && !linkTargets.has(id),
            };
        });
        const rects = new Map(flowNodes.map((node) => [node.id, node]));
        const contentLinks: FlowLink[] = [...linkTargets.entries()].flatMap(([from, targets]) => [...targets].map((to) => ({ from, to })));
        const linkKeys = new Set(contentLinks.map((link) => `${link.from}->${link.to}`));
        // A way through the navigation that a link on the page offers as well is that link
        const navigationOnlyLinks = edges
            .filter((edge) => edge.kind === "navigation" && edge.from !== edge.to && !linkKeys.has(`${edge.from}->${edge.to}`))
            .map(({ from, to }) => ({ from, to, navigation: true }));
        const uniqueNavigationLinks = [...new Map(navigationOnlyLinks.map((link) => [`${link.from}->${link.to}`, link])).values()];
        const columns = Math.max(0, ...placements.map((placement) => placement.column)) + 1;
        const rows = Math.max(1, ...placements.map((placement) => placement.row + 1));
        return {
            nodes: flowNodes,
            rects,
            contentLinks,
            navigationLinks: uniqueNavigationLinks,
            width: padding * 2 + columns * nodeWidth + (columns - 1) * columnGap,
            height: padding * 2 + rows * nodeHeight + (rows - 1) * rowGap,
        };
    }, [edges, navigationIds, pageIds, startPageId, getPageLabel]);

    // Routed together, so that a navigation link and a link on the page get their own places on a card's side
    const shownLinks = useMemo(
        () => routeFlowLinks([...contentLinks, ...(showsNavigationLinks ? navigationLinks : [])], rects),
        [contentLinks, navigationLinks, rects, showsNavigationLinks],
    );
    const highlightedNeighborIds = useMemo(() => {
        if (highlightedId == null) {
            return null;
        }
        const ids = new Set([highlightedId]);
        shownLinks.filter((link) => link.from === highlightedId || link.to === highlightedId).forEach((link) => ids.add(link.from).add(link.to));
        return ids;
    }, [highlightedId, shownLinks]);

    const canvasRef = useRef<HTMLDivElement>(null);
    const [viewport, setViewport] = useState({ width: 0, height: 0 });
    const [view, setView] = useState<FlowView>({ zoom: 1, x: 0, y: 0 });
    // Until the designer zooms or moves the map, it keeps showing all pages, also when a scan adds some
    const viewMovedRef = useRef(false);
    const panStartRef = useRef<{ pointerX: number; pointerY: number; viewX: number; viewY: number } | null>(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const observer = new ResizeObserver(() => setViewport({ width: canvas.clientWidth, height: canvas.clientHeight }));
        observer.observe(canvas);
        return () => observer.disconnect();
    }, []);

    useLayoutEffect(() => {
        if (!viewMovedRef.current && viewport.width > 0 && viewport.height > 0) {
            setView(fitFlowView({ width, height }, viewport));
        }
    }, [width, height, viewport]);

    function moveView(update: (current: FlowView) => FlowView) {
        viewMovedRef.current = true;
        setView(update);
    }

    function zoomAroundCenter(zoom: (current: FlowView) => number) {
        moveView((current) => zoomFlowViewAt(current, zoom(current), { x: viewport.width / 2, y: viewport.height / 2 }));
    }

    function revealNode(node: FlowRect) {
        const revealedView = revealFlowRect(view, node, viewport);
        if (revealedView !== view) {
            moveView(() => revealedView);
        }
    }

    function fitToScreen() {
        viewMovedRef.current = false;
        setView(fitFlowView({ width, height }, viewport));
    }

    // React's wheel listener is passive, so it couldn't keep the page from scrolling or the browser from zooming on a pinch
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            viewMovedRef.current = true;
            if (event.ctrlKey || event.metaKey) {
                const bounds = canvas.getBoundingClientRect();
                const pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
                setView((current) => zoomFlowViewAt(current, current.zoom * wheelZoomFactor(event.deltaY, event.deltaMode), pointer));
            } else {
                const scale = event.deltaMode === 1 ? lineHeightInPixels : 1;
                setView((current) => ({ ...current, x: current.x - event.deltaX * scale, y: current.y - event.deltaY * scale }));
            }
        };
        canvas.addEventListener("wheel", handleWheel, { passive: false });
        return () => canvas.removeEventListener("wheel", handleWheel);
    }, []);

    function startPan(event: PointerEvent<HTMLDivElement>) {
        if (event.button !== 0 || (event.target as Element).closest("button")) {
            return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        panStartRef.current = { pointerX: event.clientX, pointerY: event.clientY, viewX: view.x, viewY: view.y };
    }

    function pan(event: PointerEvent<HTMLDivElement>) {
        const start = panStartRef.current;
        if (start) {
            moveView((current) => ({ ...current, x: start.viewX + event.clientX - start.pointerX, y: start.viewY + event.clientY - start.pointerY }));
        }
    }

    function endPan() {
        panStartRef.current = null;
    }

    function zoomWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }
        if (event.key === "+" || event.key === "=") {
            zoomAroundCenter((current) => stepFlowZoom(current.zoom, 1));
        } else if (event.key === "-" || event.key === "_") {
            zoomAroundCenter((current) => stepFlowZoom(current.zoom, -1));
        } else if (event.key === "0") {
            zoomAroundCenter(() => 1);
        } else {
            return;
        }
        event.preventDefault();
    }

    useEffect(() => {
        if (scanFrameLoaded && !navigationByPrototype.has(prototypeId)) {
            void scanPages();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once the frame has loaded
    }, [scanFrameLoaded]);

    const arrowId = useId();

    return (
        <div className={styles.root}>
            <div className={styles.bar}>
                <p className={styles.summary}>
                    {nodes.length} pages · {contentLinks.length} links · {nodes.filter((node) => node.deadEnd).length} without a way on
                </p>
                <ul className={styles.legend}>
                    <li data-edge="link">Link</li>
                    <li data-edge="back">Link back</li>
                    {showsNavigationLinks && <li data-edge="navigation">Through the navigation</li>}
                    <li data-tag="navigation">In the navigation</li>
                    <li data-tag="undesigned">No design yet</li>
                    <li data-tag="deadEnd">No link on</li>
                </ul>
                <Switch size="small" checked={showsNavigationLinks} onChange={setShowsNavigationLinks}>
                    Show navigation links
                </Switch>
                <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<Icon name="refresh" />}
                    disabled={scan != null || !scanFrameLoaded}
                    onClick={() => void scanPages()}
                >
                    {scan ? `Scanning ${scan.done + 1} of ${scan.total}` : "Scan pages"}
                </Button>
                <Button
                    variant="text"
                    color="secondary"
                    size="small"
                    onClick={() => flowEdgeList.update((items) => items.filter((edge) => edge.prototypeId !== prototypeId))}
                >
                    Forget links
                </Button>
            </div>
            <div
                ref={canvasRef}
                className={styles.canvas}
                role="group"
                aria-label="Flow map. Plus and minus zoom, 0 zooms to 100%."
                tabIndex={0}
                onPointerDown={startPan}
                onPointerMove={pan}
                onPointerUp={endPan}
                onPointerCancel={endPan}
                onKeyDown={zoomWithKeyboard}
            >
                <div
                    className={styles.map}
                    style={{ width, height, transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
                    data-highlighting={highlightedId != null || undefined}
                >
                    <svg className={styles.lines} width={width} height={height} aria-hidden>
                        <defs>
                            <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                                <path d="M 0 1 L 9 5 L 0 9 z" />
                            </marker>
                        </defs>
                        {shownLinks.map((link) => (
                            <path
                                key={link.key}
                                d={link.path}
                                data-direction={link.direction}
                                data-navigation={link.navigation || undefined}
                                data-highlighted={(highlightedId != null && (link.from === highlightedId || link.to === highlightedId)) || undefined}
                                markerEnd={`url(#${CSS.escape(arrowId)})`}
                            />
                        ))}
                    </svg>
                    {nodes.map((node) => (
                        <button
                            key={node.id}
                            type="button"
                            className={styles.node}
                            data-undesigned={!node.designed || undefined}
                            data-dead-end={node.deadEnd || undefined}
                            data-highlighted={highlightedNeighborIds?.has(node.id) || undefined}
                            style={{ left: node.x, top: node.y, width: node.width, height: node.height }}
                            onClick={() => onOpenPage(node.id)}
                            onPointerEnter={() => setHighlightedId(node.id)}
                            onPointerLeave={() => setHighlightedId((current) => (current === node.id ? null : current))}
                            onFocus={() => {
                                setHighlightedId(node.id);
                                revealNode(node);
                            }}
                            onBlur={() => setHighlightedId((current) => (current === node.id ? null : current))}
                        >
                            <span className={styles.nodeLabel}>{node.label}</span>
                            <span className={styles.tags}>
                                {node.inNavigation && <span data-tag="navigation">Nav</span>}
                                {!node.designed && <span data-tag="undesigned">No design</span>}
                                {node.deadEnd && <span data-tag="deadEnd">No link on</span>}
                            </span>
                        </button>
                    ))}
                </div>
                {edges.length === 0 && scan == null && (
                    <p className={styles.hint}>Click through the prototype or scan its pages to see the ways between them.</p>
                )}
                <FlowZoomControls
                    zoom={view.zoom}
                    onZoomOut={() => zoomAroundCenter((current) => stepFlowZoom(current.zoom, -1))}
                    onZoomIn={() => zoomAroundCenter((current) => stepFlowZoom(current.zoom, 1))}
                    onReset={() => zoomAroundCenter(() => 1)}
                    onFit={fitToScreen}
                />
            </div>
            <iframe
                ref={scanFrameRef}
                className={styles.scanFrame}
                // The sample content, so that the pages and links are the ones the prototype has, e.g. not the copies of many entries
                src={`${storyUrl}&${scenarioSetting.storageKey}=default`}
                onLoad={() => setScanFrameLoaded(true)}
                title="Scanning the prototype's pages"
                tabIndex={-1}
                aria-hidden
            />
        </div>
    );
}

function FlowZoomControls({
    zoom,
    onZoomOut,
    onZoomIn,
    onReset,
    onFit,
}: {
    zoom: number;
    onZoomOut: () => void;
    onZoomIn: () => void;
    onReset: () => void;
    onFit: () => void;
}) {
    return (
        <div className={styles.zoomControls}>
            <IconButton
                variant="text"
                color="secondary"
                size="small"
                aria-label="Zoom out"
                slotProps={{ tooltip: { placement: "top" } }}
                onClick={onZoomOut}
            >
                <Icon name="minus" />
            </IconButton>
            <Tooltip content="Zoom to 100%" keyboardShortcut="0" placement="top">
                <Button variant="text" color="secondary" size="small" className={styles.zoomValue} onClick={onReset}>
                    {`${Math.round(zoom * 100)}%`}
                </Button>
            </Tooltip>
            <IconButton
                variant="text"
                color="secondary"
                size="small"
                aria-label="Zoom in"
                slotProps={{ tooltip: { placement: "top" } }}
                onClick={onZoomIn}
            >
                <Icon name="plus" />
            </IconButton>
            <IconButton
                variant="text"
                color="secondary"
                size="small"
                aria-label="Fit to screen"
                slotProps={{ tooltip: { placement: "top" } }}
                onClick={onFit}
            >
                <Icon name="scale-to-fit-on" />
            </IconButton>
        </div>
    );
}
