import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps, useEditorState } from "@tiptap/react";
import { useContext } from "react";

import { findListNodeType } from "../findListNodeType";
import { TextBlockContext } from "../TextBlockContext";
import { findTextBlock, type TipTapResolvedTextBlock, type TipTapTextBlockStyle } from "../textBlocks";

/**
 * Renders a text block the way it is configured: through the selected text block style, or through
 * the text block's own `element`. A text block with neither is rendered as its plain tag.
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
        // own styles there. The text block's own styles still apply, since a styled text block keeps
        // its style when it is turned into a list item.
        const findStyle = (styles: TipTapTextBlockStyle[]) => styles.find((style) => style.name === styleName);
        const style = styleName ? ((list ? findStyle(list.styles) : undefined) ?? findStyle(textBlock.styles)) : undefined;
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
