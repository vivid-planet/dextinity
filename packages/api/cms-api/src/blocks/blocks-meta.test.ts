import { describe, expect, it } from "vitest";

import { InternalLinkBlock } from "../page-tree/blocks/internal-link.block";
import { BlockData, type BlockDataInterface, BlockInput, blockInputToData, createBlock } from "./block";
import { getBlocksMeta } from "./blocks-meta";
import { ExternalLinkBlock } from "./externalLink/external-link.block";
import { createBlocksBlock } from "./factories/createBlocksBlock";
import { createLinkBlock } from "./factories/createLinkBlock";
import { createListBlock } from "./factories/createListBlock";
import { createOneOfBlock } from "./factories/createOneOfBlock";
import { createOptionalBlock } from "./factories/createOptionalBlock";
import { createTipTapRichTextBlock } from "./tipTap/createTipTapRichTextBlock";

class MetaTestBlockData extends BlockData {}

class MetaTestBlockInput extends BlockInput {
    transformToBlockData(): BlockDataInterface {
        return blockInputToData(MetaTestBlockData, this);
    }
}

describe("getBlocksMeta", () => {
    it("should include the description of a block", () => {
        createBlock(MetaTestBlockData, MetaTestBlockInput, {
            name: "BlocksMetaDescriptionTest",
            description: "A block that exists to be described.",
        });

        const meta = getBlocksMeta().find((block) => block.name === "BlocksMetaDescriptionTest");

        expect(meta?.description).toBe("A block that exists to be described.");
    });

    describe("TipTapRichTextBlock", () => {
        const getTipTapFieldMeta = (blockName: string) => {
            const meta = getBlocksMeta().find((block) => block.name === blockName);
            return {
                field: meta?.fields.find((field) => field.name === "tipTapContent"),
                inputField: meta?.inputFields.find((field) => field.name === "tipTapContent"),
            };
        };

        it("should describe the editor schema of a block with links and lists", () => {
            createTipTapRichTextBlock(
                {
                    textBlocks: [
                        {
                            name: "paragraph",
                            tag: "p",
                            styles: [{ name: "small" }, { name: "standard" }, { name: "large" }],
                            defaultStyle: "standard",
                        },
                        { name: "heading-1", tag: "h1" },
                    ],
                    orderedList: { styles: [{ name: "small" }, { name: "standard" }], defaultStyle: "standard" },
                    inlineStyles: [{ name: "highlight", appliesTo: ["paragraph"] }, { name: "muted" }],
                    placeholders: [{ name: "firstName" }],
                    link: createLinkBlock({ supportedBlocks: { external: ExternalLinkBlock } }, "BlocksMetaTipTapLink"),
                    maxTextBlocks: 10,
                    listLevelMax: 2,
                },
                "BlocksMetaTipTapWithLinksAndLists",
            );

            const { field, inputField } = getTipTapFieldMeta("BlocksMetaTipTapWithLinksAndLists");

            expect(field).toEqual(inputField);
            expect(field).toMatchObject({
                kind: "TipTapRichTextBlock",
                childBlocks: {},
                tipTap: {
                    textBlocks: [
                        { name: "paragraph", tag: "p", styles: ["small", "standard", "large"], defaultStyle: "standard" },
                        { name: "heading-1", tag: "h1", styles: [], defaultStyle: null },
                    ],
                    defaultTextBlock: "paragraph",
                    orderedList: { styles: ["small", "standard"], defaultStyle: "standard" },
                    unorderedList: { styles: [], defaultStyle: null },
                    inlineStyles: [
                        { name: "highlight", appliesTo: ["paragraph"] },
                        { name: "muted", appliesTo: null },
                    ],
                    placeholders: ["firstName"],
                    link: "BlocksMetaTipTapLink",
                    maxTextBlocks: 10,
                    listLevelMax: 2,
                },
            });
            const tipTap = field?.kind === "TipTapRichTextBlock" ? field.tipTap : undefined;
            expect(tipTap?.nodes).toEqual(
                expect.arrayContaining(["doc", "text", "textBlock", "orderedList", "bulletList", "listItem", "placeholder"]),
            );
            expect(tipTap?.marks).toEqual(expect.arrayContaining(["bold", "italic", "link", "inlineStyle"]));
        });

        it("should describe the editor schema of a block without links and lists", () => {
            createTipTapRichTextBlock({ orderedList: false, unorderedList: false }, "BlocksMetaTipTapWithoutLinksAndLists");

            const { field } = getTipTapFieldMeta("BlocksMetaTipTapWithoutLinksAndLists");
            const tipTap = field?.kind === "TipTapRichTextBlock" ? field.tipTap : undefined;

            expect(tipTap).toMatchObject({
                defaultTextBlock: "paragraph",
                orderedList: null,
                unorderedList: null,
                inlineStyles: [],
                placeholders: [],
                link: null,
                maxTextBlocks: null,
                listLevelMax: null,
            });
            expect(tipTap?.nodes).not.toContain("bulletList");
            expect(tipTap?.nodes).not.toContain("orderedList");
            expect(tipTap?.marks).not.toContain("link");
        });
    });

    describe("default descriptions of block factories", () => {
        const supportedBlocks = { internal: InternalLinkBlock, external: ExternalLinkBlock };

        function getDescription(name: string) {
            return getBlocksMeta().find((block) => block.name === name)?.description;
        }

        it("should describe an empty one-of block if empty is allowed", () => {
            createOneOfBlock({ supportedBlocks }, "OneOfDescriptionTest");

            expect(getDescription("OneOfDescriptionTest")).toContain("an entry with that `type` must be in the list");
            expect(getDescription("OneOfDescriptionTest")).toContain("`activeType` `null` means the block is empty");
        });

        it("should describe a link block that can't be empty", () => {
            createLinkBlock({ supportedBlocks }, "LinkDescriptionTest");

            expect(getDescription("LinkDescriptionTest")).toMatch(/^A link to one of several targets\./);
            expect(getDescription("LinkDescriptionTest")).toContain("`activeType` must be set");
        });

        it("should describe list, blocks and optional blocks", () => {
            createListBlock({ block: ExternalLinkBlock }, "ListDescriptionTest");
            createBlocksBlock({ supportedBlocks }, "BlocksDescriptionTest");
            createOptionalBlock(ExternalLinkBlock, "OptionalDescriptionTest");

            expect(getDescription("ListDescriptionTest")).toContain("unique `key`");
            expect(getDescription("BlocksDescriptionTest")).toContain("unique `key`");
            expect(getDescription("OptionalDescriptionTest")).toContain('`{"visible":false}`');
        });

        it("should prefer the description passed as options", () => {
            createOneOfBlock({ supportedBlocks }, { name: "OneOfOwnDescriptionTest", description: "A project's own description." });
            createLinkBlock({ supportedBlocks }, { name: "LinkOwnDescriptionTest", description: "A project's own description." });
            createListBlock({ block: ExternalLinkBlock }, { name: "ListOwnDescriptionTest", description: "A project's own description." });

            expect(getDescription("OneOfOwnDescriptionTest")).toBe("A project's own description.");
            expect(getDescription("LinkOwnDescriptionTest")).toBe("A project's own description.");
            expect(getDescription("ListOwnDescriptionTest")).toBe("A project's own description.");
        });
    });
});
