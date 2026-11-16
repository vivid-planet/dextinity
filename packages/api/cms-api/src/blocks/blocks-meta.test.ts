import { describe, expect, it } from "vitest";

import { InternalLinkBlock } from "../page-tree/blocks/internal-link.block.js";
import { type Block, BlockData, type BlockDataInterface, BlockInput, blockInputToData, createBlock } from "./block.js";
import { getBlocksMeta } from "./blocks-meta.js";
import { ExternalLinkBlock } from "./externalLink/external-link.block.js";
import { createBlocksBlock } from "./factories/createBlocksBlock.js";
import { createLinkBlock } from "./factories/createLinkBlock.js";
import { createListBlock } from "./factories/createListBlock.js";
import { createOneOfBlock } from "./factories/createOneOfBlock.js";
import { createOptionalBlock } from "./factories/createOptionalBlock.js";
import { createTipTapRichTextBlock } from "./tipTap/createTipTapRichTextBlock.js";

class MetaTestBlockData extends BlockData {}

class MetaTestBlockInput extends BlockInput {
    transformToBlockData(): BlockDataInterface {
        return blockInputToData(MetaTestBlockData, this);
    }
}

describe("getBlocksMeta", () => {
    it("should include the description of a block", () => {
        const block = createBlock(MetaTestBlockData, MetaTestBlockInput, {
            name: "BlocksMetaDescriptionTest",
            description: "A block that exists to be described.",
        });

        const meta = getBlocksMeta([block]).find((block) => block.name === "BlocksMetaDescriptionTest");

        expect(meta?.description).toBe("A block that exists to be described.");
    });

    describe("TipTapRichTextBlock", () => {
        const getTipTapFieldMeta = (block: Block) => {
            const meta = getBlocksMeta([block]).find(({ name }) => name === block.name);
            return {
                field: meta?.fields.find((field) => field.name === "tipTapContent"),
                inputField: meta?.inputFields.find((field) => field.name === "tipTapContent"),
            };
        };

        it("should describe the editor schema of a block with links and lists", () => {
            const block = createTipTapRichTextBlock(
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

            const { field, inputField } = getTipTapFieldMeta(block);

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
            const block = createTipTapRichTextBlock({ orderedList: false, unorderedList: false }, "BlocksMetaTipTapWithoutLinksAndLists");

            const { field } = getTipTapFieldMeta(block);
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

        function getDescription(block: Block) {
            return getBlocksMeta([block]).find(({ name }) => name === block.name)?.description;
        }

        it("should describe an empty one-of block if empty is allowed", () => {
            const oneOfBlock = createOneOfBlock({ supportedBlocks }, "OneOfDescriptionTest");

            expect(getDescription(oneOfBlock)).toContain("an entry with that `type` must be in the list");
            expect(getDescription(oneOfBlock)).toContain("`activeType` `null` means the block is empty");
        });

        it("should describe a link block that can't be empty", () => {
            const linkBlock = createLinkBlock({ supportedBlocks }, "LinkDescriptionTest");

            expect(getDescription(linkBlock)).toMatch(/^A link to one of several targets\./);
            expect(getDescription(linkBlock)).toContain("`activeType` must be set");
        });

        it("should describe list, blocks and optional blocks", () => {
            const listBlock = createListBlock({ block: ExternalLinkBlock }, "ListDescriptionTest");
            const blocksBlock = createBlocksBlock({ supportedBlocks }, "BlocksDescriptionTest");
            const optionalBlock = createOptionalBlock(ExternalLinkBlock, "OptionalDescriptionTest");

            expect(getDescription(listBlock)).toContain("unique `key`");
            expect(getDescription(blocksBlock)).toContain("unique `key`");
            expect(getDescription(optionalBlock)).toContain('`{"visible":false}`');
        });

        it("should prefer the description passed as options", () => {
            const oneOfBlock = createOneOfBlock(
                { supportedBlocks },
                { name: "OneOfOwnDescriptionTest", description: "A project's own description." },
            );
            const linkBlock = createLinkBlock({ supportedBlocks }, { name: "LinkOwnDescriptionTest", description: "A project's own description." });
            const listBlock = createListBlock(
                { block: ExternalLinkBlock },
                { name: "ListOwnDescriptionTest", description: "A project's own description." },
            );

            expect(getDescription(oneOfBlock)).toBe("A project's own description.");
            expect(getDescription(linkBlock)).toBe("A project's own description.");
            expect(getDescription(listBlock)).toBe("A project's own description.");
        });
    });
});
