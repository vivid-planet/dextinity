import type { JSONContent } from "@tiptap/core";

import { resolveTipTapOptions, type TipTapResolvedOptions, type TipTapRichTextEditorOptions } from "./options";

export const buildEmptyContent = ({ defaultTextBlock }: Pick<TipTapResolvedOptions, "defaultTextBlock">): JSONContent => {
    const attrs: JSONContent["attrs"] = { textBlock: defaultTextBlock.name };
    if (defaultTextBlock.defaultStyle !== null) {
        attrs.textBlockStyle = defaultTextBlock.defaultStyle;
    }

    return { type: "doc", content: [{ type: "textBlock", attrs }] };
};

/**
 * The content of an empty editor: a single text block of the default text block type.
 */
export function createEmptyTipTapRichTextContent(options: TipTapRichTextEditorOptions = {}): JSONContent {
    return buildEmptyContent(resolveTipTapOptions(options));
}

const containerNodeTypes = ["doc", "orderedList", "bulletList", "listItem"];

// Any node that is neither a text block nor a container, e.g. a custom node, counts as content.
const hasContent = (content: JSONContent): boolean =>
    content.type === "textBlock"
        ? (content.content?.length ?? 0) > 0
        : content.type === undefined || containerNodeTypes.includes(content.type)
          ? (content.content ?? []).some(hasContent)
          : true;

export function isTipTapRichTextEmpty(content: JSONContent): boolean {
    return !hasContent(content);
}
