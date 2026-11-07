import { describe, expect, it } from "vitest";

import type { GQLPageTreePageFragment } from "../../pageTree/usePageTree";
import { createPageTreeStructure } from "../pageTreeStructure";
import { areSubtreesComplete, getPagesToDelete } from "../usePageTreeDetailActions";

function createPage(id: string, parentId: string | null, pos: number) {
    return { id, parentId, pos, name: id, slug: id, visibility: "Published" } as GQLPageTreePageFragment;
}

const structure = createPageTreeStructure([
    createPage("about", null, 1),
    createPage("team", "about", 1),
    createPage("jobs", "about", 2),
    createPage("intern", "jobs", 1),
    createPage("contact", null, 2),
]);

describe("getPagesToDelete", () => {
    it("deletes the subpages before their parents", () => {
        expect(getPagesToDelete(structure, ["about"]).map((page) => page.id)).toEqual(["intern", "jobs", "team", "about"]);
    });

    it("takes checked subpages only once", () => {
        expect(getPagesToDelete(structure, ["jobs", "intern", "contact"]).map((page) => page.id)).toEqual(["contact", "intern", "jobs"]);
    });
});

describe("areSubtreesComplete", () => {
    it("is true when every subpage is checked too", () => {
        expect(areSubtreesComplete(structure, ["jobs", "intern", "contact"])).toBe(true);
    });

    it("is false when a subpage isn't checked", () => {
        expect(areSubtreesComplete(structure, ["about", "team"])).toBe(false);
    });
});
