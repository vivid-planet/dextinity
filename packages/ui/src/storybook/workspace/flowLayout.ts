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
}

/** `back` leads to an earlier column, `sideways` to a card in the same column. */
type FlowDirection = "forward" | "back" | "sideways";

export interface RoutedFlowLink extends FlowLink {
    key: string;
    direction: FlowDirection;
    path: string;
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
 * to a card in the same column loops out on the right. The links on one side of a card are spread along it, ordered by where they lead,
 * so that links in both directions between two cards and the links of a card with many don't lie on top of each other.
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
        return [{ ...link, key: `${link.from}->${link.to}`, direction, fromRect: from, toRect: to, fromSide, toSide }];
    });

    const ports = new Map<string, { linkKey: string; towardY: number }[]>();
    const addPort = (nodeId: string, side: Side, linkKey: string, towardRect: FlowRect) => {
        const portKey = `${nodeId}:${side}`;
        ports.set(portKey, [...(ports.get(portKey) ?? []), { linkKey, towardY: towardRect.y + towardRect.height / 2 }]);
    };
    for (const end of ends) {
        addPort(end.from, end.fromSide, end.key, end.toRect);
        addPort(end.to, end.toSide, end.key, end.fromRect);
    }
    // The same order on both cards, also for the two directions between them, which lead to the same place
    ports.forEach((entries) => entries.sort((a, b) => a.towardY - b.towardY || a.linkKey.localeCompare(b.linkKey)));
    const portY = (nodeId: string, side: Side, linkKey: string, rect: FlowRect) => {
        const entries = ports.get(`${nodeId}:${side}`) ?? [];
        const index = entries.findIndex((entry) => entry.linkKey === linkKey);
        return rect.y + (rect.height * (index + 1)) / (entries.length + 1);
    };

    return ends.map((end) => {
        const x1 = end.fromSide === "right" ? end.fromRect.x + end.fromRect.width : end.fromRect.x;
        const y1 = portY(end.from, end.fromSide, end.key, end.fromRect);
        const x2 = end.toSide === "right" ? end.toRect.x + end.toRect.width : end.toRect.x;
        const y2 = portY(end.to, end.toSide, end.key, end.toRect);
        const outward1 = end.fromSide === "right" ? 1 : -1;
        const outward2 = end.toSide === "right" ? 1 : -1;
        const bend = end.direction === "sideways" ? Math.min(96, 32 + Math.abs(y2 - y1) / 4) : Math.max(40, Math.abs(x2 - x1) / 2);
        return {
            key: end.key,
            from: end.from,
            to: end.to,
            direction: end.direction,
            path: `M ${round(x1)} ${round(y1)} C ${round(x1 + outward1 * bend)} ${round(y1)}, ${round(x2 + outward2 * bend)} ${round(y2)}, ${round(x2)} ${round(y2)}`,
        };
    });
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

/** Shows the whole map in the middle of the viewport, never larger than at 100%. */
export function fitFlowView(content: { width: number; height: number }, viewport: { width: number; height: number }, margin = 24): FlowView {
    const zoom = clampFlowZoom(
        Math.min(1, (viewport.width - margin * 2) / Math.max(1, content.width), (viewport.height - margin * 2) / Math.max(1, content.height)),
    );
    return { zoom, x: (viewport.width - content.width * zoom) / 2, y: (viewport.height - content.height * zoom) / 2 };
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
