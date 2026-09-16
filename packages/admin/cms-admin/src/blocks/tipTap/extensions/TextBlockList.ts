import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/react";

import { findTextBlock, resolveStyle, type TipTapResolvedList, type TipTapResolvedStyledNode, type TipTapResolvedTextBlock } from "../textBlocks";

/**
 * Toggles a list and applies the style of whatever now holds the cursor's paragraph: the list's
 * styles replace the text block's while the paragraph sits in a list, and the other way round when
 * the list is toggled off.
 */
export function toggleTextBlockList(
    editor: Editor,
    { list, textBlock, activeStyle }: { list: TipTapResolvedList; textBlock?: TipTapResolvedStyledNode; activeStyle: string | null },
): void {
    const wasActive = editor.isActive(list.tag === "ol" ? "orderedList" : "bulletList");
    const chain = editor.chain().focus();
    (list.tag === "ol" ? chain.toggleOrderedList() : chain.toggleBulletList()).run();

    const styledNode = wasActive ? textBlock : list;
    if (styledNode) {
        editor
            .chain()
            .updateAttributes("paragraph", { textBlockStyle: resolveStyle(styledNode, activeStyle) })
            .run();
    }
}

/**
 * Replaces the list extensions' own keyboard shortcuts, which toggle the list without applying the
 * styles of what ends up holding the paragraph, so `Mod-Shift-7`/`Mod-Shift-8` behave like the
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
                        const attributes = this.editor.isActive("heading")
                            ? this.editor.getAttributes("heading")
                            : this.editor.getAttributes("paragraph");
                        toggleTextBlockList(this.editor, {
                            list,
                            textBlock: findTextBlock({ name: attributes.textBlock as string | null, tag: "p", textBlocks }),
                            activeStyle: (attributes.textBlockStyle as string | null) ?? null,
                        });
                        return true;
                    };
                }
            }

            return shortcuts;
        },
    });
}
