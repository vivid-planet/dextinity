import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { useContext } from "react";

import { TextBlockContext } from "../TextBlockContext";
import { findTextBlock, getTextBlockTag } from "../textBlocks";

/**
 * Renders a paragraph/heading the way its text block does: through the selected text block style, or
 * through the text block's own `element`. A text block with neither is rendered as its plain tag.
 */
export function TextBlockNodeView({ node }: ReactNodeViewProps) {
    const { textBlocks, textBlockStyles } = useContext(TextBlockContext);
    const tag = getTextBlockTag(node);
    const styleName = node.attrs.textBlockStyle as string | null;
    const style = styleName ? textBlockStyles.find((textBlockStyle) => textBlockStyle.name === styleName) : undefined;
    const element = style?.element ?? findTextBlock({ name: node.attrs.textBlock, tag, textBlocks })?.element;

    if (element) {
        return (
            <NodeViewWrapper>
                {element({ "data-text-block-style": styleName ?? undefined, children: <NodeViewContent<"span"> as="span" /> }, tag)}
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper as={tag}>
            <NodeViewContent<"span"> as="span" />
        </NodeViewWrapper>
    );
}
