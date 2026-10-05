import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

import { findListNodeType } from "../findListNodeType";
import { findTextBlock, hasStyle, type TipTapResolvedList, type TipTapResolvedTextBlock } from "../textBlocks";

/**
 * Keeps every text block's style one that it may carry: fills in the `defaultStyle` of the text
 * block (or of the list it sits in) where there is none, and replaces a style neither of them
 * offers - which the API rejects.
 *
 * The editor changes text blocks in several ways that don't go through the toolbar - pressing Enter
 * at the end of a text block, the `Mod-Alt-<level>` shortcuts, the `#` input rules, pasting - and
 * none of them touch the style. Correcting it here keeps them all consistent without reimplementing
 * each of those.
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
                        let hasChanged = false;

                        newState.doc.descendants((node, pos) => {
                            if (node.type.name !== "textBlock") {
                                return;
                            }

                            // A list wins over the text block inside its items, so a list item's
                            // content takes the list's default style.
                            const listNodeType = findListNodeType(newState.doc.resolve(pos));
                            const list = listNodeType === "orderedList" ? orderedList : listNodeType === "bulletList" ? unorderedList : false;
                            const textBlock = findTextBlock({ name: node.attrs.textBlock, textBlocks });
                            const styledNode = list || textBlock;
                            if (!styledNode) {
                                return;
                            }

                            const style = node.attrs.textBlockStyle as string | null;
                            // Inside a list item the text block's own styles count too, since a
                            // styled text block keeps its style when it is turned into one.
                            const isStyleOffered =
                                style !== null && (hasStyle(styledNode, style) || (textBlock !== undefined && hasStyle(textBlock, style)));
                            if (isStyleOffered) {
                                return;
                            }

                            if (styledNode.defaultStyle !== style) {
                                transaction.setNodeAttribute(pos, "textBlockStyle", styledNode.defaultStyle);
                                hasChanged = true;
                            }
                        });

                        return hasChanged ? transaction : null;
                    },
                }),
            ];
        },
    });
}
