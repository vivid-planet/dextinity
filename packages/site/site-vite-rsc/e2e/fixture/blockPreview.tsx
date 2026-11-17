"use client";

import { createBlockPreview, defineBlockPreview } from "@dextinity/site-vite-rsc";

type TextBlockData = { text: string; loadedAs?: string };

export const BlockPreview = createBlockPreview({
    previews: {
        text: defineBlockPreview({
            blockType: "Text",
            render: (data: TextBlockData) => <p>{`Preview: ${data.text} (${data.loadedAs})`}</p>,
        }),
        "wrapped-text": defineBlockPreview({
            blockType: "WrappedText",
            getBlock: (state: { content: TextBlockData }) => state.content,
            render: (data: TextBlockData) => <p>{`Wrapped preview: ${data.text} (${data.loadedAs})`}</p>,
        }),
    },
    loadBlockData: async ({ blockType, block }) => {
        if ((block as TextBlockData).text === "Failing") {
            throw new Error("Loading the block data failed");
        }
        return { ...(block as TextBlockData), loadedAs: blockType };
    },
});
