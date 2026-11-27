import { type KeyboardEvent, type MouseEvent, type PointerEvent, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Button } from "../../components/button/Button";
import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Menu } from "../../components/menu/Menu";
import { MenuCheckboxItem } from "../../components/menu/MenuCheckboxItem";
import { MenuItem } from "../../components/menu/MenuItem";
import { Switch } from "../../components/switch/Switch";
import { Tooltip } from "../../components/tooltip/Tooltip";
import { scenarioSetting } from "../scenario";
import { addFlowEdges, type FlowEdge, flowEdgeList } from "./flowEdges";
import {
    expandFlowGroups,
    findFlowDepths,
    fitFlowView,
    type FlowLink,
    type FlowRect,
    type FlowView,
    groupUnreachableFlowPages,
    layOutFlow,
    pinchFlowView,
    revealFlowRect,
    routeFlowLinks,
    stepFlowZoom,
    wheelZoomFactor,
    zoomFlowViewAt,
} from "./flowLayout";
import styles from "./FlowMap.module.scss";
import { hotspotList } from "./hotspots";
import type { PageAncestor } from "./prototypes";

const nodeWidth = 200;
const nodeHeight = 56;
const columnGap = 120;
const rowGap = 24;
const padding = 48;
const scanDelay = 700;
const lineHeightInPixels = 16;
const compactBarWidth = 720;
// The zoom controls float over the map's bottom edge, so fitting the map keeps their height free
const zoomControlsRoom = 64;
const recordNavigationHint = "Click through the app's navigation in Prototype mode to record them";
// Each prototype is scanned once per visit of the workspace on opening the map, its pages rarely change in between; the entries of
// its navigation stay known for opening the map again
const navigationByPrototype = new Map<string, string[]>();

interface FlowNode extends FlowRect {
    id: string;
    label: string;
    inNavigation: boolean;
    designed: boolean;
    deadEnd: boolean;
    unreachable: boolean;
    /** Set on the card of a group of pages without a way in. */
    group?: { pageCount: number; open: boolean };
}

/** The page above a page that a group of pages without a way in is named after, e.g. the list of a detail page. */
function getGroupParent(ancestors: PageAncestor[]) {
    const parent = ancestors.findLast((ancestor) => ancestor.pageId != null) ?? ancestors.at(-1);
    return parent ? { id: parent.pageId ?? parent.id, label: parent.label } : undefined;
}

function uniqueLinks<Link extends FlowLink>(links: Link[]) {
    return [...new Map(links.filter((link) => link.from !== link.to).map((link) => [`${link.from}->${link.to}`, link])).values()];
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

function pointerPosition(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
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
    getPageAncestors,
    onOpenPage,
}: {
    prototypeId: string;
    storyUrl: string;
    startPageId: string;
    /** The pages with a design, including the ones the designer added. */
    pageIds: string[];
    getPageLabel: (pageId: string) => string;
    /** The steps above a page, which group the pages without a way in by their parent. */
    getPageAncestors: (pageId: string) => PageAncestor[];
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
    const [openGroupIds, setOpenGroupIds] = useState<string[]>([]);

    const { nodes, rects, contentLinks, navigationLinks, pageCount, linkCount, deadEndCount, unreachableCount, unreachableColumnX, width, height } =
        useMemo(() => {
            const linkTargets = new Map<string, Set<string>>();
            for (const edge of edges.filter((candidate) => candidate.kind === "link")) {
                linkTargets.set(edge.from, (linkTargets.get(edge.from) ?? new Set()).add(edge.to));
            }
            const navigationEdges = edges.filter((edge) => edge.kind === "navigation" && edge.from !== edge.to);
            const navigation = new Set([...navigationIds, ...navigationEdges.map((edge) => edge.to)]);
            const allIds = [
                ...new Set([
                    ...pageIds,
                    ...linkTargets.keys(),
                    ...[...linkTargets.values()].flatMap((targets) => [...targets]),
                    ...navigationEdges.flatMap((edge) => [edge.from, edge.to]),
                ]),
            ];
            const compareLabels = (a: string, b: string) => getPageLabel(a).localeCompare(getPageLabel(b));
            const depths = findFlowDepths({ startPageId, links: linkTargets, navigationIds: navigation, compare: compareLabels });
            const isDeadEnd = (id: string) => pageIds.includes(id) && !linkTargets.has(id);
            const groups = groupUnreachableFlowPages({
                pageIds: allIds.filter((id) => !depths.has(id)),
                getParent: (id) => getGroupParent(getPageAncestors(id)),
            });
            const groupOf = new Map(groups.flatMap((group) => group.pageIds.map((id) => [id, group])));
            const groupsById = new Map(groups.map((group) => [group.id, group]));
            const groupLabel = (id: string) => {
                const group = groupsById.get(id);
                return group ? `${group.pageIds.length} pages under ${group.parentLabel}` : undefined;
            };
            const labelOf = (id: string) => groupLabel(id) ?? getPageLabel(id);
            // An open group keeps its card, the pages go below it
            const layoutIdOf = (id: string) => groupOf.get(id)?.id ?? id;
            const shownIdOf = (id: string) => {
                const group = groupOf.get(id);
                return group && !openGroupIds.includes(group.id) ? group.id : id;
            };

            const layoutLinks = new Map<string, Set<string>>();
            for (const [from, targets] of linkTargets) {
                for (const to of targets) {
                    layoutLinks.set(layoutIdOf(from), (layoutLinks.get(layoutIdOf(from)) ?? new Set()).add(layoutIdOf(to)));
                }
            }
            const placements = expandFlowGroups(
                layOutFlow({
                    pageIds: [...new Set(allIds.map(layoutIdOf))],
                    startPageId,
                    links: layoutLinks,
                    navigationIds: navigation,
                    compare: (a, b) => labelOf(a).localeCompare(labelOf(b)),
                }),
                new Map(groups.filter((group) => openGroupIds.includes(group.id)).map((group) => [group.id, [...group.pageIds].sort(compareLabels)])),
            );
            const flowNodes: FlowNode[] = placements.map(({ id, column, row }) => {
                const group = groupsById.get(id);
                const designed = group != null || pageIds.includes(id);
                return {
                    id,
                    label: labelOf(id),
                    x: padding + column * (nodeWidth + columnGap),
                    y: padding + row * (nodeHeight + rowGap),
                    width: nodeWidth,
                    height: nodeHeight,
                    inNavigation: navigation.has(id),
                    designed,
                    deadEnd: group ? group.pageIds.every(isDeadEnd) : isDeadEnd(id),
                    unreachable: !depths.has(id),
                    group: group && { pageCount: group.pageIds.length, open: openGroupIds.includes(group.id) },
                };
            });
            const rects = new Map(flowNodes.map((node) => [node.id, node]));
            const pageLinks: FlowLink[] = [...linkTargets.entries()].flatMap(([from, targets]) => [...targets].map((to) => ({ from, to })));
            const linkKeys = new Set(pageLinks.map((link) => `${link.from}->${link.to}`));
            // A way through the navigation that a link on the page offers as well is that link
            const navigationOnlyLinks = navigationEdges
                .filter((edge) => !linkKeys.has(`${edge.from}->${edge.to}`))
                .map(({ from, to }) => ({ from: shownIdOf(from), to: shownIdOf(to), navigation: true }));
            // A group counts once, so that many pages of one kind don't make up most of the count
            const countUnits = (ids: string[]) => new Set(ids.map(layoutIdOf)).size;
            const unreachableNodes = flowNodes.filter((node) => node.unreachable);
            const columns = Math.max(0, ...placements.map((placement) => placement.column)) + 1;
            const rows = Math.max(1, ...placements.map((placement) => placement.row + 1));
            return {
                nodes: flowNodes,
                rects,
                contentLinks: uniqueLinks(pageLinks.map(({ from, to }) => ({ from: shownIdOf(from), to: shownIdOf(to) }))),
                navigationLinks: uniqueLinks(navigationOnlyLinks),
                pageCount: countUnits(allIds),
                linkCount: pageLinks.length,
                deadEndCount: countUnits(allIds.filter(isDeadEnd).filter((id) => !groupOf.has(id) || groupOf.get(id)?.pageIds.every(isDeadEnd))),
                unreachableCount: countUnits(allIds.filter((id) => !depths.has(id))),
                unreachableColumnX: unreachableNodes.length > 0 ? Math.max(...unreachableNodes.map((node) => node.x)) : null,
                width: padding * 2 + columns * nodeWidth + (columns - 1) * columnGap,
                height: padding * 2 + rows * nodeHeight + (rows - 1) * rowGap,
            };
        }, [edges, navigationIds, pageIds, startPageId, getPageLabel, getPageAncestors, openGroupIds]);
    const hasNavigationEdges = edges.some((edge) => edge.kind === "navigation" && edge.from !== edge.to);

    // Routed together, so that a navigation link and a link on the page get their own places on a card's side
    const shownLinks = useMemo(
        () => routeFlowLinks([...contentLinks, ...(showsNavigationLinks ? navigationLinks : [])], rects),
        [contentLinks, navigationLinks, rects, showsNavigationLinks],
    );
    const isHighlightedLink = (link: FlowLink) => highlightedId != null && (link.from === highlightedId || link.to === highlightedId);
    // Drawn last, so that a highlighted link runs on top of the links it shares a card's side with
    const orderedLinks = [...shownLinks].sort((a, b) => Number(isHighlightedLink(a)) - Number(isHighlightedLink(b)));
    const legendEntries = [
        { key: "link", kind: "edge", label: "Link", shown: shownLinks.some((link) => !link.navigation && !link.backward) },
        {
            key: "back",
            kind: "edge",
            label: "Link back or up",
            shown: shownLinks.some((link) => !link.navigation && link.backward),
        },
        { key: "navigation", kind: "edge", label: "Through the navigation", shown: shownLinks.some((link) => link.navigation) },
        { key: "navigation", kind: "tag", label: "In the navigation", shown: nodes.some((node) => node.inNavigation) },
        { key: "undesigned", kind: "tag", label: "No design yet", shown: nodes.some((node) => !node.designed) },
        { key: "deadEnd", kind: "tag", label: "No link on", shown: nodes.some((node) => node.deadEnd) },
        { key: "unreachable", kind: "tag", label: "No way in", shown: nodes.some((node) => node.unreachable) },
    ].filter((entry) => entry.shown);
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
    const pointersRef = useRef(new Map<number, { x: number; y: number; onCard: boolean }>());
    const pinchedRef = useRef(false);
    const panStartRef = useRef<{ pointerX: number; pointerY: number; viewX: number; viewY: number } | null>(null);
    const pinchStartRef = useRef<{ view: FlowView; points: [{ x: number; y: number }, { x: number; y: number }] } | null>(null);

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
            setView(fitFlowView({ width, height }, viewport, { reservedBottom: zoomControlsRoom }));
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
        setView(fitFlowView({ width, height }, viewport, { reservedBottom: zoomControlsRoom }));
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

    function startPanOrPinch(currentView: FlowView) {
        const points = [...pointersRef.current.values()];
        if (points.length >= 2) {
            pinchedRef.current = true;
            panStartRef.current = null;
            pinchStartRef.current = { view: currentView, points: [points[0], points[1]] };
        } else if (points.length === 1 && !points[0].onCard) {
            pinchStartRef.current = null;
            panStartRef.current = { pointerX: points[0].x, pointerY: points[0].y, viewX: currentView.x, viewY: currentView.y };
        } else {
            pinchStartRef.current = null;
            panStartRef.current = null;
        }
    }

    function startPan(event: PointerEvent<HTMLDivElement>) {
        const target = event.target as Element;
        if (event.button !== 0 || target.closest("[data-floating]")) {
            return;
        }
        // A touch on a card is tracked without panning, so that a second finger can still start a pinch and a tap still opens the card
        const onCard = target.closest("button") != null;
        if (onCard && event.pointerType !== "touch") {
            return;
        }
        if (!onCard) {
            event.currentTarget.setPointerCapture(event.pointerId);
        }
        pointersRef.current.set(event.pointerId, { ...pointerPosition(event), onCard });
        startPanOrPinch(view);
    }

    function ignoreClickAfterPinch(event: MouseEvent<HTMLDivElement>) {
        if (pinchedRef.current) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    function pan(event: PointerEvent<HTMLDivElement>) {
        const pointer = pointersRef.current.get(event.pointerId);
        if (!pointer) {
            return;
        }
        const position = pointerPosition(event);
        pointersRef.current.set(event.pointerId, { ...position, onCard: pointer.onCard });
        const pinchStart = pinchStartRef.current;
        const panStart = panStartRef.current;
        if (pinchStart) {
            const [first, second] = pointersRef.current.values();
            moveView(() => pinchFlowView(pinchStart.view, pinchStart.points, [first, second]));
        } else if (panStart) {
            moveView((current) => ({
                ...current,
                x: panStart.viewX + position.x - panStart.pointerX,
                y: panStart.viewY + position.y - panStart.pointerY,
            }));
        }
    }

    function endPan(event: PointerEvent<HTMLDivElement>) {
        if (pointersRef.current.delete(event.pointerId)) {
            startPanOrPinch(view);
            if (pointersRef.current.size === 0 && pinchedRef.current) {
                // The click that follows the last pointerup is dispatched before this timeout runs
                setTimeout(() => (pinchedRef.current = false));
            }
        }
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
    const compact = viewport.width > 0 && viewport.width < compactBarWidth;
    // Until the designer opens or closes it, the legend is open where it leaves enough of the map in sight
    const [legendOpenChoice, setLegendOpenChoice] = useState<boolean | null>(null);
    const legendOpen = legendOpenChoice ?? !compact;
    const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
    const scanLabel = scan ? `Scanning ${scan.done + 1} of ${scan.total}` : "Scan pages";
    const forgetLinks = () => flowEdgeList.update((items) => items.filter((edge) => edge.prototypeId !== prototypeId));

    function openNode(node: FlowNode) {
        if (node.group) {
            setOpenGroupIds((current) => (current.includes(node.id) ? current.filter((id) => id !== node.id) : [...current, node.id]));
        } else {
            onOpenPage(node.id);
        }
    }

    return (
        <div className={styles.root}>
            <div className={styles.bar}>
                <p className={styles.summary} title="A group of pages counts once">
                    {pageCount} pages · {linkCount} links · {deadEndCount} without a way on · {unreachableCount} without a way in
                    {compact && scan && ` · ${scanLabel}`}
                </p>
                {compact ? (
                    <Menu
                        open={actionsMenuOpen}
                        onOpenChange={setActionsMenuOpen}
                        placement="bottom-end"
                        trigger={
                            <IconButton variant="text" color="secondary" size="small" aria-label="Flow map actions">
                                <Icon name="more-horizontal" />
                            </IconButton>
                        }
                    >
                        <MenuCheckboxItem
                            label="Show navigation links"
                            checked={showsNavigationLinks && hasNavigationEdges}
                            disabled={!hasNavigationEdges}
                            onChange={setShowsNavigationLinks}
                        />
                        <MenuItem
                            label={scanLabel}
                            icon={<Icon name="refresh" />}
                            disabled={scan != null || !scanFrameLoaded}
                            onClick={() => void scanPages()}
                        />
                        <MenuItem label="Forget links" icon={<Icon name="trash" />} onClick={forgetLinks} />
                    </Menu>
                ) : (
                    <>
                        <Tooltip content={recordNavigationHint} disabled={hasNavigationEdges}>
                            <Switch
                                size="small"
                                checked={showsNavigationLinks && hasNavigationEdges}
                                disabled={!hasNavigationEdges}
                                onChange={setShowsNavigationLinks}
                            >
                                Show navigation links
                            </Switch>
                        </Tooltip>
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<Icon name="refresh" />}
                            disabled={scan != null || !scanFrameLoaded}
                            onClick={() => void scanPages()}
                        >
                            {scanLabel}
                        </Button>
                        <Button variant="text" color="secondary" size="small" onClick={forgetLinks}>
                            Forget links
                        </Button>
                    </>
                )}
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
                onClickCapture={ignoreClickAfterPinch}
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
                        {orderedLinks.map((link) => (
                            <path
                                key={link.key}
                                d={link.path}
                                data-backward={link.backward || undefined}
                                data-navigation={link.navigation || undefined}
                                data-highlighted={isHighlightedLink(link) || undefined}
                                markerEnd={`url(#${CSS.escape(arrowId)})`}
                            />
                        ))}
                    </svg>
                    {unreachableColumnX != null && (
                        <p className={styles.columnCaption} style={{ left: unreachableColumnX, width: nodeWidth }}>
                            No way in
                        </p>
                    )}
                    {nodes.map((node) => (
                        <button
                            key={node.id}
                            type="button"
                            className={styles.node}
                            title={node.label}
                            aria-expanded={node.group?.open}
                            data-group={node.group != null || undefined}
                            data-undesigned={!node.designed || undefined}
                            data-dead-end={node.deadEnd || undefined}
                            data-highlighted={highlightedNeighborIds?.has(node.id) || undefined}
                            style={{ left: node.x, top: node.y, width: node.width, height: node.height }}
                            onClick={() => openNode(node)}
                            onPointerEnter={() => setHighlightedId(node.id)}
                            onPointerLeave={() => setHighlightedId((current) => (current === node.id ? null : current))}
                            onFocus={() => {
                                setHighlightedId(node.id);
                                revealNode(node);
                            }}
                            onBlur={() => setHighlightedId((current) => (current === node.id ? null : current))}
                        >
                            <span className={styles.nodeLabel}>
                                {node.group && <Icon name={node.group.open ? "chevron-up" : "chevron-down"} className={styles.groupIcon} />}
                                {node.label}
                            </span>
                            <span className={styles.tags}>
                                {node.inNavigation && <span data-tag="navigation">Nav</span>}
                                {!node.designed && <span data-tag="undesigned">No design</span>}
                                {node.unreachable && <span data-tag="unreachable">No way in</span>}
                                {node.deadEnd && <span data-tag="deadEnd">No link on</span>}
                            </span>
                        </button>
                    ))}
                </div>
                {edges.length === 0 && scan == null && (
                    <p className={styles.hint}>Click through the prototype or scan its pages to see the ways between them.</p>
                )}
                {legendEntries.length > 0 && (
                    <div className={styles.legend} data-floating>
                        <Button
                            variant="text"
                            color="secondary"
                            size="small"
                            endIcon={<Icon name={legendOpen ? "chevron-down" : "chevron-up"} />}
                            aria-expanded={legendOpen}
                            onClick={() => setLegendOpenChoice(!legendOpen)}
                        >
                            Legend
                        </Button>
                        {legendOpen && (
                            <ul className={styles.legendList}>
                                {legendEntries.map((entry) => (
                                    <li
                                        key={`${entry.kind}:${entry.key}`}
                                        data-edge={entry.kind === "edge" ? entry.key : undefined}
                                        data-tag={entry.kind === "tag" ? entry.key : undefined}
                                    >
                                        {entry.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
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
        <div className={styles.zoomControls} data-floating>
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
