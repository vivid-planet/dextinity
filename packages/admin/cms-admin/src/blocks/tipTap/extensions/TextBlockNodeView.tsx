import type { Editor } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps, useEditorState } from "@tiptap/react";
import { useContext } from "react";

import { TextBlockContext } from "../TextBlockContext";
import { findTextBlock, type TipTapResolvedTextBlock, type TipTapTextBlockStyle } from "../textBlocks";

/**
 * The node type of the innermost list the node sits in, which only its position in the document
 * tells - the node itself is the same inside a list item as outside one.
 */
function findListNodeType(editor: Editor, pos?: number): "orderedList" | "bulletList" | undefined {
    if (pos === undefined || pos > editor.state.doc.content.size) {
        return undefined;
    }
    const resolved = editor.state.doc.resolve(pos);
    for (let depth = resolved.depth; depth > 0; depth--) {
        const nodeType = resolved.node(depth).type.name;
        if (nodeType === "orderedList" || nodeType === "bulletList") {
            return nodeType;
        }
    }
    return undefined;
}

/**
 * Renders a text block the way it is configured: through the selected text block style, or through
 * the text block's own `element`. A text block with neither is rendered as its plain tag.
 */
export function createTextBlockNodeView(defaultTextBlock: TipTapResolvedTextBlock) {
    return function TextBlockNodeView({ node, editor, getPos }: ReactNodeViewProps) {
        const { textBlocks, orderedList, unorderedList } = useContext(TextBlockContext);
        const listNodeType = useEditorState({ editor, selector: ({ editor }) => findListNodeType(editor, getPos()) });

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
