import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/react";

import { findListNodeType } from "../findListNodeType";
import { findTextBlock, resolveStyle, type TipTapResolvedList, type TipTapResolvedStyledNode, type TipTapResolvedTextBlock } from "../textBlocks";

/**
 * Toggles a list and applies the style of whatever now holds the cursor's text block: the list's
 * styles replace the text block's while it sits in a list, and the other way round when the list is
 * toggled off.
 */
export function toggleTextBlockList(
    editor: Editor,
    {
        list,
        textBlock,
        activeStyle,
        orderedList,
        unorderedList,
    }: {
        list: TipTapResolvedList;
        textBlock?: TipTapResolvedStyledNode;
        activeStyle: string | null;
        orderedList: false | TipTapResolvedList;
        unorderedList: false | TipTapResolvedList;
    },
): void {
    const chain = editor.chain().focus();
    (list.tag === "ol" ? chain.toggleOrderedList() : chain.toggleBulletList()).run();

    // Which list the text block ended up in is only clear after the toggle: nested lists may mix
    // types, so toggling can convert the innermost list instead of lifting the text block out of
    // every list.
    const listNodeType = findListNodeType(editor.state.selection.$from);
    const activeList = listNodeType === "orderedList" ? orderedList : listNodeType === "bulletList" ? unorderedList : false;

    const styledNode = activeList || textBlock;
    if (styledNode) {
        editor
            .chain()
            .updateAttributes("textBlock", { textBlockStyle: resolveStyle(styledNode, activeStyle) })
            .run();
    }
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
                        const attributes = this.editor.getAttributes("textBlock");
                        toggleTextBlockList(this.editor, {
                            list,
                            textBlock: findTextBlock({ name: attributes.textBlock as string | null, textBlocks }),
                            activeStyle: (attributes.textBlockStyle as string | null) ?? null,
                            orderedList,
                            unorderedList,
                        });
                        return true;
                    };
                }
            }

            return shortcuts;
        },
    });
}
