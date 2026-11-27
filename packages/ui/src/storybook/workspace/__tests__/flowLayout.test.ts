import { describe, expect, it } from "vitest";

import {
    expandFlowGroups,
    fitFlowView,
    type FlowRect,
    groupUnreachableFlowPages,
    layOutFlow,
    maxFlowZoom,
    minFlowZoom,
    revealFlowRect,
    routeFlowLinks,
    stepFlowZoom,
    wheelZoomFactor,
    zoomFlowViewAt,
} from "../flowLayout";

function linksOf(entries: Record<string, string[]>) {
    return new Map(Object.entries(entries).map(([from, targets]) => [from, new Set(targets)]));
}

function columnsOf(placements: ReturnType<typeof layOutFlow>) {
    const columns: string[][] = [];
    for (const placement of [...placements].sort((a, b) => a.row - b.row)) {
        (columns[placement.column] ??= []).push(placement.id);
    }
    return columns;
}

const byName = (a: string, b: string) => a.localeCompare(b);

describe("layOutFlow", () => {
    it("puts pages in columns by their number of steps from the start page", () => {
        const placements = layOutFlow({
            pageIds: ["start", "list", "detail", "settings", "orphan"],
            startPageId: "start",
            links: linksOf({ start: ["list"], list: ["detail"] }),
            navigationIds: new Set(["settings"]),
            compare: byName,
        });

        expect(columnsOf(placements)).toEqual([["start"], ["list", "settings"], ["detail"], ["orphan"]]);
    });

    it("orders a column by where the cards that link to it are, so that links don't cross", () => {
        const placements = layOutFlow({
            pageIds: ["start", "a", "b", "a-child", "b-child"],
            startPageId: "start",
            // By name, `a-child` would come before `b-child` although `b` links to it
            links: linksOf({ start: ["b", "a"], a: ["b-child"], b: ["a-child"] }),
            navigationIds: new Set(),
            compare: byName,
        });

        expect(columnsOf(placements)).toEqual([["start"], ["a", "b"], ["b-child", "a-child"]]);
    });
});

describe("groupUnreachableFlowPages", () => {
    const parentOf = (id: string) => (id.includes("/") ? { id: id.split("/")[0], label: id.split("/")[0] } : undefined);

    it("groups the pages without a way in that share a parent when there are more than a few", () => {
        const assets = ["assets/a", "assets/b", "assets/c", "assets/d", "assets/e"];

        expect(groupUnreachableFlowPages({ pageIds: [...assets, "news/a", "news/b", "orphan"], getParent: parentOf })).toEqual([
            { id: "group:assets", parentLabel: "assets", pageIds: assets },
        ]);
    });

    it("leaves a few pages with the same parent on their own", () => {
        expect(groupUnreachableFlowPages({ pageIds: ["assets/a", "assets/b"], getParent: parentOf, maxUngrouped: 2 })).toEqual([]);
    });
});

describe("expandFlowGroups", () => {
    it("puts an open group's pages below its card and moves the cards below down", () => {
        const placements = [
            { id: "start", column: 0, row: 0 },
            { id: "group", column: 1, row: 0 },
            { id: "other", column: 1, row: 1 },
        ];

        expect(expandFlowGroups(placements, new Map([["group", ["a", "b"]]]))).toEqual([
            { id: "start", column: 0, row: 0 },
            { id: "group", column: 1, row: 0 },
            { id: "a", column: 1, row: 1 },
            { id: "b", column: 1, row: 2 },
            { id: "other", column: 1, row: 3 },
        ]);
    });
});

describe("routeFlowLinks", () => {
    const rect = (x: number, y: number): FlowRect => ({ x, y, width: 100, height: 40 });

    it("runs from the side of a card that faces the target to the target's facing side", () => {
        const rects = new Map([
            ["a", rect(0, 0)],
            ["b", rect(200, 0)],
        ]);

        const [forward, back] = routeFlowLinks(
            [
                { from: "a", to: "b" },
                { from: "b", to: "a" },
            ],
            rects,
        );

        expect(forward.direction).toBe("forward");
        expect(forward.path).toMatch(/^M 100 \S+ C .* 200 \S+$/);
        expect(back.direction).toBe("back");
        expect(back.path).toMatch(/^M 200 \S+ C .* 100 \S+$/);
    });

    it("keeps the two directions between two cards apart", () => {
        const rects = new Map([
            ["a", rect(0, 0)],
            ["b", rect(200, 0)],
        ]);

        const [forward, back] = routeFlowLinks(
            [
                { from: "a", to: "b" },
                { from: "b", to: "a" },
            ],
            rects,
        );

        const startY = (path: string) => Number(path.split(" ")[2]);
        expect(startY(forward.path)).not.toBe(startY(back.path));
    });

    it("loops a link to a card in the same column out on the right", () => {
        const rects = new Map([
            ["a", rect(0, 0)],
            ["b", rect(0, 60)],
        ]);

        const [link] = routeFlowLinks([{ from: "a", to: "b" }], rects);

        expect(link.direction).toBe("sideways");
        expect(link.path).toMatch(/^M 100 \S+ C 1\d\d\.?\d* \S+, 1\d\d\.?\d* \S+, 100 \S+$/);
    });

    it("gives a navigation link and a link on the page their own places on a card's side", () => {
        const rects = new Map([
            ["a", rect(0, 0)],
            ["b", rect(200, 0)],
            ["c", rect(200, 60)],
        ]);

        const [content, navigation] = routeFlowLinks(
            [
                { from: "a", to: "b" },
                { from: "a", to: "c", navigation: true },
            ],
            rects,
        );

        const startY = (path: string) => Number(path.split(" ")[2]);
        expect(navigation.navigation).toBe(true);
        expect(content.navigation).toBeUndefined();
        expect(startY(content.path)).not.toBe(startY(navigation.path));
    });

    it("lets many links leave a card's side together from its middle and fan out after a stub", () => {
        const targets = ["b", "c", "d", "e", "f", "g"];
        const rects = new Map([["a", rect(0, 0)], ...targets.map((id, index): [string, FlowRect] => [id, rect(300, index * 60)])]);

        const routed = routeFlowLinks(
            targets.map((to) => ({ from: "a", to })),
            rects,
        );

        for (const link of routed) {
            expect(link.path).toMatch(/^M 100 20 L 116 20 C /);
        }
    });

    it("loops a longer link farther out than a shorter one in the same column", () => {
        const rects = new Map([
            ["a", rect(0, 0)],
            ["b", rect(0, 60)],
            ["c", rect(0, 120)],
        ]);

        const [short, long] = routeFlowLinks(
            [
                { from: "a", to: "b" },
                { from: "a", to: "c" },
            ],
            rects,
        );

        const firstControlX = (path: string) => Number(path.split(" ")[4]);
        expect(firstControlX(long.path)).toBeGreaterThan(firstControlX(short.path));
    });

    it("marks links to an earlier column and up the same column as backward", () => {
        const rects = new Map([
            ["a", rect(0, 0)],
            ["b", rect(200, 0)],
            ["c", rect(200, 60)],
        ]);

        const [forward, back, up, down] = routeFlowLinks(
            [
                { from: "a", to: "b" },
                { from: "b", to: "a" },
                { from: "c", to: "b" },
                { from: "b", to: "c" },
            ],
            rects,
        );

        expect([forward.backward, back.backward, up.backward, down.backward]).toEqual([false, true, true, false]);
    });

    it("leaves out links to cards that aren't on the map", () => {
        expect(routeFlowLinks([{ from: "a", to: "missing" }], new Map([["a", rect(0, 0)]]))).toEqual([]);
    });
});

describe("zoom", () => {
    it("steps through the usual zoom levels and stops at the limits", () => {
        expect(stepFlowZoom(1, 1)).toBe(1.25);
        expect(stepFlowZoom(1, -1)).toBe(0.9);
        expect(stepFlowZoom(0.8, -1)).toBe(0.75);
        expect(stepFlowZoom(maxFlowZoom, 1)).toBe(maxFlowZoom);
        expect(stepFlowZoom(minFlowZoom, -1)).toBe(minFlowZoom);
    });

    it("keeps the room at the bottom free when fitting the map", () => {
        expect(fitFlowView({ width: 100, height: 100 }, { width: 500, height: 300 }, { reservedBottom: 100 })).toEqual({ zoom: 1, x: 200, y: 50 });
        expect(fitFlowView({ width: 100, height: 300 }, { width: 500, height: 400 }, { margin: 0, reservedBottom: 100 }).zoom).toBe(1);
        expect(fitFlowView({ width: 100, height: 600 }, { width: 500, height: 400 }, { margin: 0, reservedBottom: 100 }).zoom).toBe(0.5);
    });

    it("keeps the point under the pointer in place and clamps the zoom", () => {
        const view = zoomFlowViewAt({ zoom: 1, x: 0, y: 0 }, 2, { x: 100, y: 50 });
        expect(view).toEqual({ zoom: 2, x: -100, y: -50 });

        expect(zoomFlowViewAt({ zoom: 1, x: 0, y: 0 }, 10, { x: 0, y: 0 }).zoom).toBe(maxFlowZoom);
        expect(zoomFlowViewAt({ zoom: 1, x: 0, y: 0 }, 0.01, { x: 0, y: 0 }).zoom).toBe(minFlowZoom);
    });

    it("fits the whole map into the viewport, centered and never larger than 100%", () => {
        expect(fitFlowView({ width: 1000, height: 200 }, { width: 548, height: 400 }, { margin: 24 })).toEqual({ zoom: 0.5, x: 24, y: 150 });
        expect(fitFlowView({ width: 100, height: 100 }, { width: 500, height: 300 }).zoom).toBe(1);
        expect(fitFlowView({ width: 100_000, height: 100 }, { width: 500, height: 300 }).zoom).toBe(minFlowZoom);
    });

    it("moves the map as little as needed to show a card, and not at all when it is in sight", () => {
        const viewport = { width: 500, height: 300 };
        const view = { zoom: 0.5, x: 0, y: 0 };

        expect(revealFlowRect(view, { x: 100, y: 100, width: 200, height: 40 }, viewport)).toBe(view);
        expect(revealFlowRect(view, { x: 1000, y: 100, width: 200, height: 40 }, viewport, 24)).toEqual({ zoom: 0.5, x: -124, y: 0 });
        expect(revealFlowRect({ zoom: 1, x: 0, y: -200 }, { x: 100, y: 100, width: 200, height: 40 }, viewport, 24)).toEqual({
            zoom: 1,
            x: 0,
            y: -76,
        });
    });

    it("zooms in on scrolling up and out on scrolling down, a mouse wheel notch by a bounded step", () => {
        expect(wheelZoomFactor(-10, 0)).toBeGreaterThan(1);
        expect(wheelZoomFactor(10, 0)).toBeLessThan(1);
        expect(wheelZoomFactor(4, 1)).toBe(wheelZoomFactor(500, 0));
    });
});
