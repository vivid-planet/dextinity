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
                        marks: [{ type: "link", attrs: { data: { block: { type: "phone", props: { phone: "+431234567" } } } } }],
                        text: "support hotline",
                    },
                    { type: "text", text: " for help or check the " },
                    {
                        type: "text",
                        marks: [
                            {
                                type: "link",
                                attrs: {
                                    data: { block: { type: "external", props: { targetUrl: "https://example.com/faq", openInNewWindow: false } } },
                                },
                            },
                        ],
                        text: "FAQ",
                    },
                    { type: "text", text: "." },
                ],
            },
        ],
    },
};
