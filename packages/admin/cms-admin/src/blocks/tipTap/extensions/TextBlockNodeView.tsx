import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps, useEditorState } from "@tiptap/react";
import { useContext } from "react";

import { findListNodeType } from "../findListNodeType";
import { TextBlockContext } from "../TextBlockContext";
import { findTextBlock, type TipTapResolvedStyledNode, type TipTapResolvedTextBlock } from "../textBlocks";
import type { TipTapTextAlign } from "./textBlockAttributes";

/**
 * Renders a text block the way it is configured: through the selected text block style, or through
 * the text block's own `element`. Inside a list item, the list's style and `element` come first. A
 * text block with neither is rendered as its plain tag.
 */
export function createTextBlockNodeView(defaultTextBlock: TipTapResolvedTextBlock) {
    return function TextBlockNodeView({ node, editor, getPos }: ReactNodeViewProps) {
        const { textBlocks, orderedList, unorderedList } = useContext(TextBlockContext);
        const listNodeType = useEditorState({
            editor,
            selector: ({ editor }) => {
                const pos = getPos();
                // A node view can outlive the node it renders, leaving a position the new document
                // no longer has.
                return pos === undefined || pos > editor.state.doc.content.size ? undefined : findListNodeType(editor.state.doc.resolve(pos));
            },
        });

        const textBlock = findTextBlock({ name: node.attrs.textBlock, textBlocks }) ?? defaultTextBlock;
        const list = listNodeType === "orderedList" ? orderedList : listNodeType === "bulletList" ? unorderedList : false;
        const styleName = node.attrs.textBlockStyle as string | null;
        // A list wins over the text block inside its items, the same way the toolbar offers a list's
        // own styles there - with its own element as well. The text block's own styles still apply,
        // since a styled text block keeps its style when it is turned into a list item.
        const findStyle = (styledNode: TipTapResolvedStyledNode) => styledNode.styles.find((style) => style.name === styleName);
        const listElement = list ? (findStyle(list)?.element ?? list.element) : undefined;
        const element = listElement ?? findStyle(textBlock)?.element ?? textBlock.element;
        const textAlign = node.attrs.textAlign as TipTapTextAlign | null | undefined;
        const wrapperStyle = textAlign ? { textAlign } : undefined;

        if (element) {
            return (
                <NodeViewWrapper style={wrapperStyle}>
                    {element({ "data-text-block-style": styleName ?? undefined, children: <NodeViewContent<"span"> as="span" /> }, textBlock.tag)}
                </NodeViewWrapper>
            );
        }

        return (
            <NodeViewWrapper as={textBlock.tag} style={wrapperStyle}>
                <NodeViewContent<"span"> as="span" />
            </NodeViewWrapper>
        );
    };
}
