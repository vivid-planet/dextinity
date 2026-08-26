import { describe, expect, it, vi } from "vitest";

import { type BlockLoader, recursivelyLoadBlockData } from "./blockLoader";

const dependencies = {
    graphQLFetch: vi.fn(),
    fetch: vi.fn(),
};

describe("recursivelyLoadBlockData: rich text child blocks", () => {
    const blocksMeta = [
        {
            name: "TipTapRichText",
            fields: [{ name: "tipTapContent", kind: "TipTapRichTextBlock", nullable: false, childBlocks: { productTeaser: "ProductTeaser" } }],
            inputFields: [{ name: "tipTapContent", kind: "TipTapRichTextBlock", nullable: false, childBlocks: { productTeaser: "ProductTeaser" } }],
        },
        {
            name: "ProductTeaser",
            fields: [{ name: "productId", kind: "String", nullable: true }],
            inputFields: [{ name: "productId", kind: "String", nullable: true }],
        },
    ];

    it("runs the loader for child blocks embedded as cmsBlock/cmsInlineBlock nodes", async () => {
        const productTeaserLoader: BlockLoader = vi.fn(async ({ blockData }) => ({ title: `Product ${blockData.productId}` }));

        const blockData = {
            tipTapContent: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Intro" }] },
                    { type: "cmsBlock", attrs: { blockType: "productTeaser", data: { productId: "block-1" } } },
                    {
                        type: "paragraph",
                        content: [{ type: "cmsInlineBlock", attrs: { blockType: "productTeaser", data: { productId: "inline-1" } } }],
                    },
                ],
            },
        };

        const result = await recursivelyLoadBlockData({
            blockType: "TipTapRichText",
            blockData,
            blocksMeta,
            loaders: { ProductTeaser: productTeaserLoader },
            ...dependencies,
        });

        expect(productTeaserLoader).toHaveBeenCalledTimes(2);
        expect(result.tipTapContent.content[1].attrs.data.loaded).toEqual({ title: "Product block-1" });
        expect(result.tipTapContent.content[2].content[0].attrs.data.loaded).toEqual({ title: "Product inline-1" });
    });

    it("leaves rich text content untouched when no loader matches", async () => {
        const blockData = {
            tipTapContent: {
                type: "doc",
                content: [{ type: "cmsBlock", attrs: { blockType: "productTeaser", data: { productId: "block-1" } } }],
            },
        };

        const result = await recursivelyLoadBlockData({
            blockType: "TipTapRichText",
            blockData,
            blocksMeta,
            loaders: {},
            ...dependencies,
        });

        expect(result.tipTapContent.content[0].attrs.data).toEqual({ productId: "block-1" });
        expect(result.tipTapContent.content[0].attrs.data.loaded).toBeUndefined();
    });

    it("does not process embedded blocks in a plain Json field", async () => {
        const productTeaserLoader: BlockLoader = vi.fn(async () => ({ title: "loaded" }));

        const blocksMetaWithJsonField = [
            {
                name: "TipTapRichText",
                fields: [{ name: "tipTapContent", kind: "Json", nullable: false }],
                inputFields: [{ name: "tipTapContent", kind: "Json", nullable: false }],
            },
            ...blocksMeta.slice(1),
        ];

        const blockData = {
            tipTapContent: {
                type: "doc",
                content: [{ type: "cmsBlock", attrs: { blockType: "productTeaser", data: { productId: "block-1" } } }],
            },
        };

        const result = await recursivelyLoadBlockData({
            blockType: "TipTapRichText",
            blockData,
            blocksMeta: blocksMetaWithJsonField,
            loaders: { ProductTeaser: productTeaserLoader },
            ...dependencies,
        });

        expect(productTeaserLoader).not.toHaveBeenCalled();
        expect(result.tipTapContent.content[0].attrs.data).toEqual({ productId: "block-1" });
    });
});
