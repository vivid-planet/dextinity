import { Extension } from "@tiptap/core";

import { getActiveTextBlock, getActiveTextBlockStyle, setTextBlock, toggleList } from "../textBlockCommands";
import type { TipTapResolvedList, TipTapResolvedTextBlock } from "../textBlocks";

/**
 * Binds `Mod-Alt-0` to the first paragraph text block and `Mod-Alt-1` … `Mod-Alt-6` to the first
 * text block with the matching heading level. Replaces the paragraph/heading extensions' own
 * shortcuts, which set the node type without the text block it belongs to, and the list
 * extensions' shortcuts, which don't apply the styles of the list they toggle.
 */
export function createTextBlockShortcuts({
    textBlocks,
    orderedList,
    unorderedList,
}: {
    textBlocks: TipTapResolvedTextBlock[];
    orderedList: false | TipTapResolvedList;
    unorderedList: false | TipTapResolvedList;
}) {
    return Extension.create({
        name: "textBlockShortcuts",

        // Must beat the paragraph/heading/list extensions, whose shortcuts use the same keys.
        priority: 1100,

        addKeyboardShortcuts() {
            const shortcuts: Record<string, () => boolean> = {};

            for (const textBlock of textBlocks) {
                const shortcut = `Mod-Alt-${textBlock.level ?? 0}`;
                if (shortcuts[shortcut] === undefined) {
                    shortcuts[shortcut] = () => setTextBlock(this.editor, textBlock, getActiveTextBlockStyle(this.editor));
                }
            }

            for (const list of [orderedList, unorderedList]) {
                if (list) {
                    shortcuts[list.tag === "ol" ? "Mod-Shift-7" : "Mod-Shift-8"] = () => {
                        toggleList(this.editor, {
                            list,
                            textBlock: getActiveTextBlock(this.editor, textBlocks),
                            activeStyle: getActiveTextBlockStyle(this.editor),
                        });
                        return true;
                    };
                }
            }

            return shortcuts;
        },
    });
}
