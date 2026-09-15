import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { TipTapRichTextBlock } from "@src/common/blocks/tip-tap-rich-text.block";

@Injectable()
export class TipTapRichTextBlockFixtureService {
    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof TipTapRichTextBlock>> {
        return {
            tipTapContent: {
                type: "doc",
                content: [
                    { type: "heading", attrs: { textBlock: "heading-1", level: 1 }, content: [{ type: "text", text: "TipTap rich text" }] },
                    {
                        type: "paragraph",
                        attrs: { textBlock: "eyebrow", textBlockStyle: "eyebrow500" },
                        content: [{ type: "text", text: "Eyebrow above the copy" }],
                    },
                    {
                        type: "paragraph",
                        attrs: { textBlock: "paragraph", textBlockStyle: "paragraph300" },
                        content: [
                            { type: "text", text: "This content is built with " },
                            { type: "text", marks: [{ type: "bold" }], text: "type-safe" },
                            { type: "text", text: " fixture code." },
                        ],
                    },
                    {
                        type: "bulletList",
                        content: [
                            {
                                type: "listItem",
                                content: [
                                    {
                                        type: "paragraph",
                                        attrs: { textBlock: "paragraph", textBlockStyle: "list300" },
                                        content: [{ type: "text", text: "A styled list item" }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        };
    }
}
