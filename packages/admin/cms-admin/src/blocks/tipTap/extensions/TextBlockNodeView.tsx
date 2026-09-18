import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { useContext } from "react";

import { findTextBlock, type TipTapResolvedTextBlock } from "../textBlocks";
import { TextBlockStyleContext } from "../TextBlockStyleContext";

/**
 * Renders a text block as the tag it is configured with, and with its text block style applied so
 * the editor previews the style.
 */
export function createTextBlockNodeView(textBlocks: TipTapResolvedTextBlock[]) {
    return function TextBlockNodeView({ node }: ReactNodeViewProps) {
        const textBlockStyles = useContext(TextBlockStyleContext);
        const styleName = node.attrs.textBlockStyle as string | null;
        const style = styleName ? textBlockStyles.find((textBlockStyle) => textBlockStyle.name === styleName) : undefined;

        if (style) {
            const Element = style.element;
            return (
                <NodeViewWrapper>
                    <Element data-text-block-style={styleName}>
                        <NodeViewContent<"span"> as="span" />
                    </Element>
                </NodeViewWrapper>
            );
        }

        return (
            <NodeViewWrapper as={findTextBlock({ name: node.attrs.textBlock, textBlocks })?.tag}>
                <NodeViewContent<"span"> as="span" />
            </NodeViewWrapper>
        );
    };
}
