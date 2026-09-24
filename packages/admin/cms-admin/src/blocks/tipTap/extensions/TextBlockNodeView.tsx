import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";

import { findTextBlock, type TipTapResolvedTextBlock, type TipTapTextBlockStyle } from "../textBlocks";

/**
 * Renders a text block through its selected text block style or its own `element`, so the editor
 * previews it, and as the tag it is configured with otherwise.
 */
export function createTextBlockNodeView({
    textBlocks,
    defaultTextBlock,
    textBlockStyles,
}: {
    textBlocks: TipTapResolvedTextBlock[];
    defaultTextBlock: TipTapResolvedTextBlock;
    textBlockStyles: TipTapTextBlockStyle[];
}) {
    return function TextBlockNodeView({ node }: ReactNodeViewProps) {
        const textBlock = findTextBlock({ name: node.attrs.textBlock, textBlocks }) ?? defaultTextBlock;
        const styleName: string | undefined = node.attrs.textBlockStyle ?? undefined;
        const element = textBlockStyles.find((style) => style.name === styleName)?.element ?? textBlock.element;

        if (element) {
            return (
                <NodeViewWrapper>
                    {element({ "data-text-block-style": styleName, children: <NodeViewContent<"span"> as="span" /> }, textBlock.tag)}
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
