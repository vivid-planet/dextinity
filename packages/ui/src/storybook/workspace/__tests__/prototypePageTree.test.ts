import { describe, expect, it } from "vitest";

import { buildPageTree } from "../prototypePageTree";
import type { PageAncestor } from "../prototypes";

const labels: Record<string, string> = {
    dashboard: "Overview",
    news: "News",
    "news/spring": "Spring release",
    "assets/photo": "photo.jpg",
    assets: "Assets",
};

const ancestors: Record<string, PageAncestor[]> = {
    news: [{ id: "menu:structured-data", label: "Structured data" }],
    "news/spring": [
        { id: "menu:structured-data", label: "Structured data" },
        { id: "news", label: "News", pageId: "news" },
    ],
    "assets/photo": [
        { id: "assets", label: "Assets", pageId: "assets" },
        { id: "asset-folder:demo", label: "Demo" },
    ],
};

const tree = buildPageTree({
    storyId: "cms",
    pageIds: ["dashboard", "news", "news/spring", "assets/photo"],
    getPageLabel: (pageId) => labels[pageId],
    getPageAncestors: (pageId) => ancestors[pageId] ?? [],
});

describe("buildPageTree", () => {
    it("nests the pages below their menu groups, section pages, and folders, and adds the steps that aren't listed", () => {
        expect(tree.nodes).toEqual([
            { id: "cms#dashboard", label: "Overview", type: "page" },
            {
                id: "cms>menu:structured-data",
                label: "Structured data",
                type: "folder",
                children: [
                    {
                        id: "cms#news",
                        label: "News",
                        type: "page",
                        children: [{ id: "cms#news/spring", label: "Spring release", type: "page" }],
                    },
                ],
            },
            {
                id: "cms#assets",
                label: "Assets",
                type: "page",
                children: [
                    {
                        id: "cms>asset-folder:demo",
                        label: "Demo",
                        type: "folder",
                        children: [{ id: "cms#assets/photo", label: "photo.jpg", type: "page" }],
                    },
                ],
            },
        ]);
    });

    it("finds the nodes above a page", () => {
        expect(tree.getAncestorIds("cms#news/spring")).toEqual(["cms>menu:structured-data", "cms#news"]);
        expect(tree.groupIds).toEqual(["cms>menu:structured-data", "cms>asset-folder:demo"]);
    });
});
