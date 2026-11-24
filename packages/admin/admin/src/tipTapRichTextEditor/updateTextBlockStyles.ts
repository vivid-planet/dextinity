import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/react";

import { resolveStyle, type TipTapResolvedStyledNode } from "./textBlocks";

/**
 * Applies to every text block in the selection the style it should carry, resolved from the style
 * that text block has. A selection may span text blocks with styles of their own, and `updateAttributes`
 * would write one value - read off whichever node it finds first - onto all of them.
 */
export function updateTextBlockStyles(
    editor: Editor,
    styledNodeAt: (node: ProseMirrorNode, pos: number) => TipTapResolvedStyledNode | undefined,
): void {
    const { state } = editor;
    const transaction = state.tr;

    for (const range of state.selection.ranges) {
        state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
            if (node.type.name !== "textBlock") {
                return;
            }

            const styledNode = styledNodeAt(node, pos);
            if (styledNode) {
                transaction.setNodeAttribute(pos, "textBlockStyle", resolveStyle(styledNode, (node.attrs.textBlockStyle as string | null) ?? null));
            }
        });
    }

    if (transaction.docChanged) {
        editor.view.dispatch(transaction);
    }
}
