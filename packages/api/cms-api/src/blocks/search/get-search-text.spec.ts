import { describe, expect, it } from "vitest";

import { getSearchTextFromBlock } from "./get-search-text";
import { ABlock } from "./test/blocks/A/ABlock";
import { ABlock as InvisibleChildrenBlock } from "./test/blocks/InvisibleChildren/ABlock";
import { ABlock as NestedInvisibleChildren } from "./test/blocks/NestedInvisibleChildren/ABlock";

describe("Search", () => {
    it("gets SearchData", () => {
        const testBlock = ABlock.blockInputFactory({
            titleA: "a",
            b: { titleB: "b", c1: { titleC: "c1 in b" }, c2: { titleC: "c2 in b" } },
            c: { titleC: "c" },
        }).transformToBlockData();

        const searchText = getSearchTextFromBlock(testBlock);

        expect(searchText[0].text).toBe("a");
        expect(searchText[1].text).toBe("b");
        expect(searchText[2].text).toBe("c1 in b");
        expect(searchText[3].text).toBe("c2 in b");
        expect(searchText[4].text).toBe("c");
    });

    it("gets SearchData and respects invisible blocks", () => {
        // c1 in b is invisible in this test

        const testBlock = InvisibleChildrenBlock.blockInputFactory({
            titleA: "a",
            b: { titleB: "b", c1: { titleC: "c1 in b" }, c2: { titleC: "c2 in b" }, visibilityC1: false },
            c: { titleC: "c" },
        }).transformToBlockData();

        const searchText = getSearchTextFromBlock(testBlock);

        expect(searchText.length).toBe(4);
        expect(searchText[0].text).toBe("a");
        expect(searchText[1].text).toBe("b");
        expect(searchText[2].text).toBe("c2 in b");
        expect(searchText[3].text).toBe("c");
        expect(searchText[4]).toBe(undefined);
    });

    it("gets SearchData and respects nested invisible blocks", () => {
        // When Block B is inisible, all block children and grandchildren must be invisble

        // in 1st block, titleB is and c.titleC must not be added to search index
        const testBlock = NestedInvisibleChildren.blockInputFactory({
            blocks: [
                {
                    key: "1",
                    type: "b",
                    visible: false,
                    props: { titleB: "titleB invisible", c: { titleC: "titleC invisible" } },
                },
                {
                    key: "2",
                    type: "b",
                    visible: true,
                    props: { titleB: "titleB visible", c: { titleC: "titleC visible" } },
                },
            ],
        }).transformToBlockData();

        const searchText = getSearchTextFromBlock(testBlock);

        expect(searchText.length).toBe(2);

        expect(searchText[0].text).toBe("titleB visible");
        expect(searchText[1].text).toBe("titleC visible");
        expect(searchText[2]).toBe(undefined);
    });
});
