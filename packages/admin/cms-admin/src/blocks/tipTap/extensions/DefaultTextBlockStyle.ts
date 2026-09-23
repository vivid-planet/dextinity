import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

import { findTextBlock, type TipTapResolvedList, type TipTapResolvedStyledNode, type TipTapResolvedTextBlock } from "../textBlocks";

/**
 * Applies a text block's (or a list's) `defaultStyle` to every text block that carries no style yet.
 * The editor creates such nodes in several ways that don't go through the toolbar - pressing Enter
 * at the end of a text block, the keyboard shortcuts, pasting - so filling the style in here keeps
 * them all consistent without reimplementing each of those.
 *
 * Only runs on an actual document change, so opening content written before a `defaultStyle` was
 * configured leaves it untouched until it is edited.
 */
export function createDefaultTextBlockStyle({
    textBlocks,
    orderedList,
    unorderedList,
}: {
    textBlocks: TipTapResolvedTextBlock[];
    orderedList: false | TipTapResolvedList;
    unorderedList: false | TipTapResolvedList;
}) {
    return Extension.create({
        name: "defaultTextBlockStyle",

        addProseMirrorPlugins() {
            return [
                new Plugin({
                    key: new PluginKey("defaultTextBlockStyle"),

                    appendTransaction(transactions, _, newState) {
                        if (!transactions.some((transaction) => transaction.docChanged)) {
                            return null;
                        }

                        const transaction = newState.tr;
                        let changed = false;

                        newState.doc.descendants((node, pos) => {
                            if (node.type.name !== "textBlock" || node.attrs.textBlockStyle != null) {
                                return;
                            }

                            const styledNode: TipTapResolvedStyledNode | undefined =
                                findEnclosingList(newState.doc.resolve(pos), { orderedList, unorderedList }) ??
                                findTextBlock({ name: node.attrs.textBlock, textBlocks });

                            if (styledNode?.defaultStyle != null) {
                                transaction.setNodeAttribute(pos, "textBlockStyle", styledNode.defaultStyle);
                                changed = true;
                            }
                        });

                        return changed ? transaction : null;
                    },
                }),
            ];
        },
    });
}

/**
 * The list a node sits in, whose styles replace the text block's for a list item's content.
 */
function findEnclosingList(
    $pos: { depth: number; node: (depth: number) => { type: { name: string } } },
    { orderedList, unorderedList }: { orderedList: false | TipTapResolvedList; unorderedList: false | TipTapResolvedList },
): TipTapResolvedList | undefined {
    for (let depth = $pos.depth; depth > 0; depth--) {
        const name = $pos.node(depth).type.name;
        if (name === "orderedList") {
            return orderedList || undefined;
        }
        if (name === "bulletList") {
            return unorderedList || undefined;
        }
    }
    return undefined;
}
