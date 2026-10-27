import { describe, expect, it } from "vitest";

import { PageTreeSnapshot } from "./page-tree.snapshot.js";
import type { PageTreeNodeRecord } from "./page-tree.types.js";

function record({
    id,
    parentId = null,
    pos,
    slug,
    visibility = "Published",
    category = "main",
}: Partial<PageTreeNodeRecord> & { id: string; pos: number; slug: string }) {
    return {
        id,
        parentId,
        pos,
        name: slug,
        slug,
        visibility,
        documentType: "Page",
        category,
        hideInMenu: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        scope: { domain: "main" },
    } satisfies PageTreeNodeRecord;
}

const tree = new PageTreeSnapshot([
    record({ id: "products", pos: 2, slug: "products" }),
    record({ id: "home", pos: 1, slug: "home" }),
    record({ id: "news", parentId: "home", pos: 1, slug: "news" }),
    record({ id: "shoes", parentId: "products", pos: 2, slug: "shoes" }),
    record({ id: "shirts", parentId: "products", pos: 1, slug: "shirts" }),
    record({ id: "old", parentId: "products", pos: 3, slug: "old", visibility: "Archived" }),
    record({ id: "imprint", pos: 1, slug: "imprint", category: "footer" }),
]);

describe("PageTreeSnapshot", () => {
    it("calculates paths, with / for the home page and its children below /home", () => {
        expect(tree.node("home")?.path).toBe("/");
        expect(tree.node("news")?.path).toBe("/home/news");
        expect(tree.node("shoes")?.path).toBe("/products/shoes");
    });

    it("lists the nodes in tree order, siblings by position", () => {
        expect(tree.nodes.map(({ id }) => id)).toEqual(["home", "news", "imprint", "products", "shirts", "shoes", "old"]);
    });

    it("filters root nodes by category", () => {
        expect(tree.children(null, "main").map(({ id }) => id)).toEqual(["home", "products"]);
        expect(tree.children(null, "footer").map(({ id }) => id)).toEqual(["imprint"]);
        expect(tree.children("products").map(({ id }) => id)).toEqual(["shirts", "shoes", "old"]);
    });

    it("finds nodes by path, ignoring archived ones and the excluded ones", () => {
        expect(tree.nodeByPath("/products/shoes")?.id).toBe("shoes");
        expect(tree.nodeByPath("/")?.id).toBe("home");
        expect(tree.nodeByPath("/products/old")).toBeUndefined();
        expect(tree.nodeByPath("/products/shoes", { except: ["shoes"] })).toBeUndefined();
    });

    it("calculates the path for a new slug below a parent", () => {
        expect(tree.pathFor(null, "about")).toBe("/about");
        expect(tree.pathFor("home", "about")).toBe("/home/about");
        expect(tree.pathFor("products", "socks")).toBe("/products/socks");
    });

    it("knows ancestors and descendants", () => {
        expect(tree.descendants("products").map(({ id }) => id)).toEqual(["shirts", "shoes", "old"]);
        expect(tree.ancestors("shoes").map(({ id }) => id)).toEqual(["products"]);
        expect(tree.isAncestorOrSelf("products", "shoes")).toBe(true);
        expect(tree.isAncestorOrSelf("shoes", "shoes")).toBe(true);
        expect(tree.isAncestorOrSelf("shoes", "products")).toBe(false);
    });
});
