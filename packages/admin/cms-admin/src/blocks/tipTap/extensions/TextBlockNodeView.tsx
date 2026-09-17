import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { useContext } from "react";

import { getTextBlockTag } from "../textBlocks";
import { TextBlockStyleContext } from "../TextBlockStyleContext";

/**
 * Renders a paragraph/heading with its text block style applied, so the editor previews the style.
 */
export function TextBlockNodeView({ node }: ReactNodeViewProps) {
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

    const tag = getTextBlockTag(node);

    return (
        <NodeViewWrapper as={tag}>
            <NodeViewContent<"span"> as="span" />
        </NodeViewWrapper>
    );
}
