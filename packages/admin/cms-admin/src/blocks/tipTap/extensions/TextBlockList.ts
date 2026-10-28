import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/react";

import { findListNodeType } from "../findListNodeType";
import { findTextBlock, type TipTapResolvedList, type TipTapResolvedTextBlock } from "../textBlocks";
import { updateTextBlockStyles } from "../updateTextBlockStyles";

/**
 * Toggles a list and applies to every text block the selection holds the style of whatever now
 * holds it: the list's styles replace the text block's while it sits in a list, and the other way
 * round when the list is toggled off.
 */
export function toggleTextBlockList(
    editor: Editor,
    {
        list,
        textBlocks,
        orderedList,
        unorderedList,
    }: {
        list: TipTapResolvedList;
        textBlocks: TipTapResolvedTextBlock[];
        orderedList: false | TipTapResolvedList;
        unorderedList: false | TipTapResolvedList;
    },
): void {
    const chain = editor.chain().focus();
    (list.tag === "ol" ? chain.toggleOrderedList() : chain.toggleBulletList()).run();

    // Which list a text block ended up in is only clear after the toggle: nested lists may mix
    // types, so toggling can convert the innermost list instead of lifting it out of every list.
    updateTextBlockStyles(editor, (node, pos) => {
        const listNodeType = findListNodeType(editor.state.doc.resolve(pos));
        const activeList = listNodeType === "orderedList" ? orderedList : listNodeType === "bulletList" ? unorderedList : false;
        return activeList || findTextBlock({ name: node.attrs.textBlock, textBlocks });
    });
}

/**
 * Replaces the list extensions' own keyboard shortcuts, which toggle the list without applying the
 * styles of what ends up holding the text block, so `Mod-Shift-7`/`Mod-Shift-8` behave like the
 * toolbar's list buttons.
 */
export function createTextBlockList({
    textBlocks,
    orderedList,
    unorderedList,
}: {
    textBlocks: TipTapResolvedTextBlock[];
    orderedList: false | TipTapResolvedList;
    unorderedList: false | TipTapResolvedList;
}) {
    return Extension.create({
        name: "textBlockList",

        // Must beat the list extensions, whose shortcuts use the same keys.
        priority: 1100,

        addKeyboardShortcuts() {
            const shortcuts: Record<string, () => boolean> = {};

            for (const list of [orderedList, unorderedList]) {
                if (list) {
                    shortcuts[list.tag === "ol" ? "Mod-Shift-7" : "Mod-Shift-8"] = () => {
                        toggleTextBlockList(this.editor, { list, textBlocks, orderedList, unorderedList });
                        return true;
                    };
                }
            }

            return shortcuts;
        },
    });
}
