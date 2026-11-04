import type { RichTextBlockData } from "@src/blocks.generated";

export const exampleSupportInfo: RichTextBlockData = {
    draftContent: {
        blocks: [
            {
                key: "a",
                text: "Call our support hotline for help or check the FAQ.",
                type: "paragraph-standard",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [
                    { offset: 9, length: 15, key: 0 },
                    { offset: 47, length: 3, key: 1 },
                ],
                data: {},
            },
        ],
        entityMap: {
            "0": { type: "LINK", mutability: "MUTABLE", data: { block: { type: "phone", props: { phone: "+431234567" } } } },
            "1": {
                type: "LINK",
                mutability: "MUTABLE",
                data: { block: { type: "external", props: { targetUrl: "https://example.com/faq", openInNewWindow: false } } },
            },
        },
    },
};
