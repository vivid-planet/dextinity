import { describe, expect, it } from "vitest";

import { createSeoBlock } from "./createSeoBlock";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import type { BlockInterface } from "./types";

interface ImageBlockState {
    altText?: string;
}

const ImageBlock: BlockInterface<ImageBlockState, ImageBlockState, ImageBlockState> = {
    ...createBlockSkeleton(),
    name: "Image",
    displayName: "Image",
    defaultValues: () => ({ altText: undefined }),
    extractTextContents: (state) => (state.altText ? [state.altText] : []),
};

const SeoBlock = createSeoBlock({ image: ImageBlock });

describe("createSeoBlock", () => {
    it("should extract the text contents of the SEO fields and the open graph image", () => {
        const state = {
            ...SeoBlock.defaultValues(),
            htmlTitle: "HTML Title",
            metaDescription: "Meta Description",
            openGraphTitle: "Open Graph Title",
            openGraphDescription: "Open Graph Description",
            openGraphImage: { visible: true, block: { altText: "Open Graph Image Alt Text" } },
        };

        expect(SeoBlock.extractTextContents?.(state, { includeInvisibleContent: false })).toEqual([
            "HTML Title",
            "Meta Description",
            "Open Graph Title",
            "Open Graph Description",
            "Open Graph Image Alt Text",
        ]);
    });

    it("should not extract text contents for empty SEO fields", () => {
        expect(SeoBlock.extractTextContents?.(SeoBlock.defaultValues(), { includeInvisibleContent: false })).toEqual([]);
    });
});
