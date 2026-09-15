import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { useContext } from "react";

import { TextBlockContext } from "../TextBlockContext";
import { findTextBlock, type TipTapTextBlockTag } from "../textBlocks";

const getTagFromNode = (node: ReactNodeViewProps["node"]): TipTapTextBlockTag =>
    node.type.name === "heading" ? (`h${node.attrs.level}` as TipTapTextBlockTag) : "p";

/**
 * Renders a paragraph/heading with its text block style applied, so the editor previews the style
 * the way the site renders it. A text block without a style is rendered as its plain tag.
 */
export function TextBlockNodeView({ node }: ReactNodeViewProps) {
    const { textBlocks, textBlockStyles } = useContext(TextBlockContext);
    const tag = getTagFromNode(node);
    const styleName = node.attrs.textBlockStyle as string | null;
    const style = styleName ? textBlockStyles.find((textBlockStyle) => textBlockStyle.name === styleName) : undefined;

    if (style) {
        const textBlock = findTextBlock({ name: node.attrs.textBlock, tag, textBlocks });
        return (
            <NodeViewWrapper>
                {style.element(
                    { "data-text-block-style": styleName ?? undefined, children: <NodeViewContent<"span"> as="span" /> },
                    textBlock?.tag ?? tag,
                )}
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper as={tag}>
            <NodeViewContent<"span"> as="span" />
        </NodeViewWrapper>
    );
}
