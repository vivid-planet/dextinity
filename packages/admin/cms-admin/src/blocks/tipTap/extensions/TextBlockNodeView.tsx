import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";

import { findTextBlock, type TipTapResolvedTextBlock } from "../textBlocks";
import { findStyle } from "../textStyles";
import { findListTextStyleInDecorations } from "./ListTextStyle";

/**
 * Renders a text block as the tag it is configured with, and with the style applied to it so the
 * editor previews what the site will show.
 */
export function createTextBlockNodeView({
    textBlocks,
    defaultTextBlock,
}: {
    textBlocks: TipTapResolvedTextBlock[];
    defaultTextBlock: TipTapResolvedTextBlock;
}) {
    return function TextBlockNodeView({ node, decorations }: ReactNodeViewProps) {
        const textBlock = findTextBlock({ name: node.attrs.textBlock, textBlocks }) ?? defaultTextBlock;
        // A list owns the style of its items and hands it down as a decoration, so a list item's
        // text block takes that over its own - which the editor keeps empty inside a list.
        const style = findListTextStyleInDecorations(decorations) ?? findStyle(textBlock.styles, node.attrs.textStyle);
        const element = style?.element ?? textBlock.element;

        if (!element) {
            return (
                <NodeViewWrapper as={textBlock.tag} data-text-style={style?.name}>
                    <NodeViewContent<"span"> as="span" />
                </NodeViewWrapper>
            );
        }

        return (
            <NodeViewWrapper>
                {element({ "data-text-style": style?.name, children: <NodeViewContent<"span"> as="span" /> }, textBlock.tag)}
            </NodeViewWrapper>
        );
    };
}
