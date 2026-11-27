/** The geometry of the Flow map: where its cards go, how the links between them run, and how far it is zoomed. */

export interface FlowPlacement {
    id: string;
    column: number;
    row: number;
}

export interface FlowRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface FlowLink {
    from: string;
    to: string;
    /** A way through the app's navigation rather than a link on the page. */
    navigation?: boolean;
}

/** `back` leads to an earlier column, `sideways` to a card in the same column. */
type FlowDirection = "forward" | "back" | "sideways";

export interface RoutedFlowLink extends FlowLink {
    key: string;
    direction: FlowDirection;
    /** Leads back to an earlier column, or up to a card above in the same column. */
    backward: boolean;
    path: string;
}

/** Pages without a way in that share a parent, shown as one card. */
export interface FlowGroup {
    id: string;
    parentLabel: string;
    pageIds: string[];
}

export interface FlowView {
    zoom: number;
    /** Where the map's top left corner is in the viewport, in screen pixels. */
    x: number;
    y: number;
}

export const minFlowZoom = 0.1;
export const maxFlowZoom = 2;
const zoomSteps = [0.1, 0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.25, 1.5, 2];
const orderingPasses = 4;
const bundledPortCount = 5;
const bundleStub = 16;
const firstLoopBend = 32;
const loopBendStep = 16;
const maxLoopBend = 144;

/**
 * The number of steps from the start page to each page that a way leads to: links first, then the app's navigation where no link
 * leads. A page that isn't in the result has no way in.
 */
export function findFlowDepths({
    startPageId,
    links,
    navigationIds,
    compare,
}: {
    startPageId: string;
    links: Map<string, Set<string>>;
    navigationIds: Set<string>;
    compare: (a: string, b: string) => number;
}) {
    const depth = new Map<string, number>();
    function walk(roots: string[], startDepth: number) {
        let current = roots.filter((id) => !depth.has(id));
        current.forEach((id) => depth.set(id, startDepth));
        let level = startDepth;
        while (current.length > 0) {
            level++;
            const next: string[] = [];
            for (const id of current) {
                for (const target of links.get(id) ?? []) {
                    if (!depth.has(target)) {
                        depth.set(target, level);
                        next.push(target);
                    }
                }
            }
            current = next;
        }
    }
    walk([startPageId], 0);
    walk([...navigationIds].sort(compare), 1);
    return depth;
}

/**
 * Groups the pages without a way in by their parent, e.g. the detail pages of a list, when more than `maxUngrouped` share one, so that
 * they don't fill the map's last column. A page without a parent stays on its own.
 */
export function groupUnreachableFlowPages({
    pageIds,
    getParent,
    maxUngrouped = 4,
}: {
    /** The pages without a way in. */
    pageIds: string[];
    getParent: (pageId: string) => { id: string; label: string } | undefined;
    maxUngrouped?: number;
}): FlowGroup[] {
    const byParent = new Map<string, FlowGroup>();
    for (const pageId of pageIds) {
        const parent = getParent(pageId);
        if (parent) {
            const group = byParent.get(parent.id) ?? { id: `group:${parent.id}`, parentLabel: parent.label, pageIds: [] };
            group.pageIds.push(pageId);
            byParent.set(parent.id, group);
        }
    }
    return [...byParent.values()].filter((group) => group.pageIds.length > maxUngrouped);
}

/** Puts the pages of each opened group right below the group's card, and moves the cards below it down to make room. */
export function expandFlowGroups(placements: FlowPlacement[], openGroups: Map<string, string[]>): FlowPlacement[] {
    const shiftByColumn = new Map<number, number>();
    return [...placements]
        .sort((a, b) => a.column - b.column || a.row - b.row)
        .flatMap((placement) => {
            const shift = shiftByColumn.get(placement.column) ?? 0;
            const row = placement.row + shift;
            const memberIds = openGroups.get(placement.id) ?? [];
            shiftByColumn.set(placement.column, shift + memberIds.length);
            return [{ ...placement, row }, ...memberIds.map((id, index) => ({ id, column: placement.column, row: row + index + 1 }))];
        });
}

/**
 * Columns by the number of steps from the start page: links first, the app's navigation where no link leads, and pages no way leads
 * to in a last column. Within a column, a card goes near the cards that link to it and that it links to, so that fewer links cross.
 */
export function layOutFlow({
    pageIds,
    startPageId,
    links,
    navigationIds,
    compare,
}: {
    pageIds: string[];
    startPageId: string;
    links: Map<string, Set<string>>;
    navigationIds: Set<string>;
    /** The order before any link is taken into account, e.g. by the pages' labels. */
    compare: (a: string, b: string) => number;
}): FlowPlacement[] {
    const depth = findFlowDepths({ startPageId, links, navigationIds, compare });
    const pageSet = new Set(pageIds);
    const lastColumn = Math.max(0, ...[...depth].filter(([id]) => pageSet.has(id)).map(([, value]) => value)) + 1;
    const columnOf = (id: string) => depth.get(id) ?? lastColumn;

    const columns: string[][] = [];
    for (const id of [...pageSet].sort(compare)) {
        (columns[columnOf(id)] ??= []).push(id);
    }
    const filledColumns = Array.from(columns, (ids) => ids ?? []);

    const parents = new Map<string, string[]>();
    const children = new Map<string, string[]>();
    for (const [from, targets] of links) {
        for (const to of targets) {
            if (!pageSet.has(from) || !pageSet.has(to) || columnOf(from) === columnOf(to)) {
                continue;
            }
            const [earlier, later] = columnOf(from) < columnOf(to) ? [from, to] : [to, from];
            parents.set(later, [...(parents.get(later) ?? []), earlier]);
            children.set(earlier, [...(children.get(earlier) ?? []), later]);
        }
    }

    const rowOf = new Map<string, number>();
    const numberRows = (ids: string[]) => ids.forEach((id, row) => rowOf.set(id, row));
    filledColumns.forEach(numberRows);
    for (let pass = 0; pass < orderingPasses; pass++) {
        const forward = pass % 2 === 0;
        const neighbors = forward ? parents : children;
        const indexes = filledColumns.map((_, index) => index);
        for (const index of forward ? indexes.slice(1) : indexes.reverse().slice(1)) {
            const column = filledColumns[index];
            const key = new Map(column.map((id) => [id, barycenter(neighbors.get(id) ?? [], rowOf) ?? rowOf.get(id) ?? 0]));
            column.sort((a, b) => (key.get(a) ?? 0) - (key.get(b) ?? 0) || (rowOf.get(a) ?? 0) - (rowOf.get(b) ?? 0));
            numberRows(column);
        }
    }

    return filledColumns.flatMap((ids, column) => ids.map((id, row) => ({ id, column, row })));
}

function barycenter(ids: string[], rowOf: Map<string, number>) {
    const rows = ids.map((id) => rowOf.get(id)).filter((row) => row != null);
    return rows.length > 0 ? rows.reduce((sum, row) => sum + row, 0) / rows.length : null;
}

type Side = "left" | "right";

/**
 * Curves between the sides of two cards that face each other, ending at the target, so that a link doesn't cross its own cards. A link
 * to a card in the same column loops out on the right, a longer loop farther out than a shorter one. The links on one side of a card are
 * spread along it, ordered by where they lead, so that links in both directions between two cards don't lie on top of each other. More
 * than a few links on one side leave it together from its middle and fan out after a short stub, so that they don't crowd its edge.
 */
export function routeFlowLinks(links: FlowLink[], rects: Map<string, FlowRect>): RoutedFlowLink[] {
    const ends = links.flatMap((link) => {
        const from = rects.get(link.from);
        const to = rects.get(link.to);
        if (!from || !to || link.from === link.to) {
            return [];
        }
        const direction: FlowDirection = to.x >= from.x + from.width ? "forward" : to.x + to.width <= from.x ? "back" : "sideways";
        const fromSide: Side = direction === "back" ? "left" : "right";
        const toSide: Side = direction === "forward" ? "left" : "right";
        return [
            {
                ...link,
                key: `${link.navigation ? "navigation:" : ""}${link.from}->${link.to}`,
                direction,
                fromRect: from,
                toRect: to,
                fromSide,
                toSide,
            },
        ];
    });

    const ports = new Map<string, { linkKey: string; towardY: number }[]>();
    const addPort = (nodeId: string, side: Side, linkKey: string, towardRect: FlowRect) => {
        const portKey = `${nodeId}:${side}`;
        ports.set(portKey, [...(ports.get(portKey) ?? []), { linkKey, towardY: centerY(towardRect) }]);
    };
    for (const end of ends) {
        addPort(end.from, end.fromSide, end.key, end.toRect);
        addPort(end.to, end.toSide, end.key, end.fromRect);
    }
    // The same order on both cards, also for the two directions between them, which lead to the same place
    ports.forEach((entries) => entries.sort((a, b) => a.towardY - b.towardY || a.linkKey.localeCompare(b.linkKey)));
    const portOf = (nodeId: string, side: Side, linkKey: string, rect: FlowRect) => {
        const entries = ports.get(`${nodeId}:${side}`) ?? [];
        const outward = side === "right" ? 1 : -1;
        const x = side === "right" ? rect.x + rect.width : rect.x;
        if (entries.length > bundledPortCount) {
            return { x, y: centerY(rect), fanX: x + outward * bundleStub, outward };
        }
        const index = entries.findIndex((entry) => entry.linkKey === linkKey);
        return { x, y: rect.y + (rect.height * (index + 1)) / (entries.length + 1), fanX: x, outward };
    };

    // Shorter loops inside longer ones, so that the loops out of one column don't run on top of each other
    const loopBends = new Map<string, number>();
    const loopsByColumn = new Map<number, typeof ends>();
    for (const end of ends.filter((candidate) => candidate.direction === "sideways")) {
        loopsByColumn.set(end.fromRect.x, [...(loopsByColumn.get(end.fromRect.x) ?? []), end]);
    }
    const loopSpan = (end: (typeof ends)[number]) => Math.abs(centerY(end.toRect) - centerY(end.fromRect));
    loopsByColumn.forEach((loops) =>
        [...loops]
            .sort((a, b) => loopSpan(a) - loopSpan(b) || a.key.localeCompare(b.key))
            .forEach((end, order) => loopBends.set(end.key, Math.min(maxLoopBend, firstLoopBend + order * loopBendStep))),
    );

    return ends.map((end) => {
        const start = portOf(end.from, end.fromSide, end.key, end.fromRect);
        const finish = portOf(end.to, end.toSide, end.key, end.toRect);
        const bend = loopBends.get(end.key) ?? Math.max(40, Math.abs(finish.fanX - start.fanX) / 2);
        const segments = [
            `M ${round(start.x)} ${round(start.y)}`,
            start.fanX !== start.x ? `L ${round(start.fanX)} ${round(start.y)}` : null,
            `C ${round(start.fanX + start.outward * bend)} ${round(start.y)}, ${round(finish.fanX + finish.outward * bend)} ${round(finish.y)}, ${round(finish.fanX)} ${round(finish.y)}`,
            finish.fanX !== finish.x ? `L ${round(finish.x)} ${round(finish.y)}` : null,
        ];
        return {
            key: end.key,
            from: end.from,
            to: end.to,
            navigation: end.navigation,
            direction: end.direction,
            backward: end.direction === "back" || (end.direction === "sideways" && end.toRect.y < end.fromRect.y),
            path: segments.filter((segment) => segment != null).join(" "),
        };
    });
}

function centerY(rect: FlowRect) {
    return rect.y + rect.height / 2;
}

function round(value: number) {
    return Math.round(value * 10) / 10;
}

function clampFlowZoom(zoom: number) {
    return Math.min(maxFlowZoom, Math.max(minFlowZoom, zoom));
}

/** The next of the usual zoom levels, e.g. 50%, 67%, 75%, so that the buttons land on round values again after a pinch. */
export function stepFlowZoom(zoom: number, direction: 1 | -1) {
    const tolerance = 0.001;
    const next = direction > 0 ? zoomSteps.find((step) => step > zoom + tolerance) : [...zoomSteps].reverse().find((step) => step < zoom - tolerance);
    return next ?? clampFlowZoom(zoom);
}

/** Zooms so that the point under the pointer, in viewport coordinates, stays where it is. */
export function zoomFlowViewAt(view: FlowView, zoom: number, point: { x: number; y: number }): FlowView {
    const nextZoom = clampFlowZoom(zoom);
    const scale = nextZoom / view.zoom;
    return { zoom: nextZoom, x: point.x - (point.x - view.x) * scale, y: point.y - (point.y - view.y) * scale };
}

type FlowPoint = { x: number; y: number };

/**
 * Follows a two-finger pinch: zooms by how much the fingers moved apart and keeps the map point that was between them at the start
 * between them, so that the map also moves with the fingers. Points are in viewport coordinates.
 */
export function pinchFlowView(startView: FlowView, startPoints: [FlowPoint, FlowPoint], points: [FlowPoint, FlowPoint]): FlowView {
    const distance = ([a, b]: [FlowPoint, FlowPoint]) => Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
    const midpoint = ([a, b]: [FlowPoint, FlowPoint]) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    const zoom = clampFlowZoom((startView.zoom * distance(points)) / distance(startPoints));
    const startMidpoint = midpoint(startPoints);
    const currentMidpoint = midpoint(points);
    const mapX = (startMidpoint.x - startView.x) / startView.zoom;
    const mapY = (startMidpoint.y - startView.y) / startView.zoom;
    return { zoom, x: currentMidpoint.x - mapX * zoom, y: currentMidpoint.y - mapY * zoom };
}

/**
 * Shows the whole map in the middle of the viewport, never larger than at 100%. `reservedBottom` keeps room at the bottom free, e.g.
 * for controls that float over the map.
 */
export function fitFlowView(
    content: { width: number; height: number },
    viewport: { width: number; height: number },
    { margin = 24, reservedBottom = 0 }: { margin?: number; reservedBottom?: number } = {},
): FlowView {
    const availableHeight = viewport.height - reservedBottom;
    const zoom = clampFlowZoom(
        Math.min(1, (viewport.width - margin * 2) / Math.max(1, content.width), (availableHeight - margin * 2) / Math.max(1, content.height)),
    );
    return { zoom, x: (viewport.width - content.width * zoom) / 2, y: (availableHeight - content.height * zoom) / 2 };
}

/** Moves the map as little as needed to show the whole card, e.g. one focused with the keyboard; the same view when it is in sight. */
export function revealFlowRect(view: FlowView, rect: FlowRect, viewport: { width: number; height: number }, margin = 24): FlowView {
    const revealedOffset = (offset: number, start: number, size: number, viewportSize: number) => {
        const screenStart = offset + start * view.zoom;
        const screenEnd = offset + (start + size) * view.zoom;
        if (screenStart < margin || screenEnd - screenStart > viewportSize - margin * 2) {
            return margin - start * view.zoom;
        }
        if (screenEnd > viewportSize - margin) {
            return viewportSize - margin - (start + size) * view.zoom;
        }
        return offset;
    };
    const x = revealedOffset(view.x, rect.x, rect.width, viewport.width);
    const y = revealedOffset(view.y, rect.y, rect.height, viewport.height);
    return x === view.x && y === view.y ? view : { zoom: view.zoom, x, y };
}

/**
 * The factor a wheel event with Ctrl or Cmd zooms by. A trackpad pinch sends many events with small deltas, a mouse wheel few with large
 * ones, which are capped so that one notch doesn't jump too far.
 */
export function wheelZoomFactor(deltaY: number, deltaMode: number) {
    const linesToPixels = 16;
    const pixels = deltaMode === 1 ? deltaY * linesToPixels : deltaY;
    const capped = Math.max(-50, Math.min(50, pixels));
    return Math.exp(-capped * 0.005);
}
