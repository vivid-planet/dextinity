import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { useContext } from "react";

import { TextBlockContext } from "../TextBlockContext";
import { findTextBlock, type TipTapResolvedTextBlock } from "../textBlocks";

/**
 * Renders a text block the way it is configured: through the selected text block style, or through
 * the text block's own `element`. A text block with neither is rendered as its plain tag.
 */
export function createTextBlockNodeView(defaultTextBlock: TipTapResolvedTextBlock) {
    return function TextBlockNodeView({ node }: ReactNodeViewProps) {
        const { textBlocks, textBlockStyles } = useContext(TextBlockContext);
        const textBlock = findTextBlock({ name: node.attrs.textBlock, textBlocks }) ?? defaultTextBlock;
        const styleName = node.attrs.textBlockStyle as string | null;
        const style = styleName ? textBlockStyles.find((textBlockStyle) => textBlockStyle.name === styleName) : undefined;
        const element = style?.element ?? textBlock.element;

        if (element) {
            return (
                <NodeViewWrapper>
                    {element({ "data-text-block-style": styleName ?? undefined, children: <NodeViewContent<"span"> as="span" /> }, textBlock.tag)}
                </NodeViewWrapper>
            );
        }

        return (
            <NodeViewWrapper as={textBlock.tag}>
                <NodeViewContent<"span"> as="span" />
            </NodeViewWrapper>
        );
    };
}
