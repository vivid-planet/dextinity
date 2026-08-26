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
                    { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "TipTap rich text" }] },
                    {
                        type: "paragraph",
                        content: [
                            { type: "text", text: "This content is built with " },
                            { type: "text", marks: [{ type: "bold" }], text: "type-safe" },
                            { type: "text", text: " fixture code." },
                        ],
                    },
                ],
            },
        };
    }
}
