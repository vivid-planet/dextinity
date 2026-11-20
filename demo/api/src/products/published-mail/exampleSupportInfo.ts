import type { RichTextBlockData } from "@src/blocks.generated.js";

export const exampleSupportInfo: RichTextBlockData = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph" },
                content: [
                    { type: "text", text: "Call our " },
                    {
                        type: "text",
                        text: "support hotline",
                        marks: [{ type: "link", attrs: { data: { block: { type: "phone", props: { phone: "+431234567" } } } } }],
                    },
                    { type: "text", text: " for help or check the " },
                    {
                        type: "text",
                        text: "FAQ",
                        marks: [
                            {
                                type: "link",
                                attrs: {
                                    data: { block: { type: "external", props: { targetUrl: "https://example.com/faq", openInNewWindow: false } } },
                                },
                            },
                        ],
                    },
                    { type: "text", text: "." },
                ],
            },
        ],
    },
};
