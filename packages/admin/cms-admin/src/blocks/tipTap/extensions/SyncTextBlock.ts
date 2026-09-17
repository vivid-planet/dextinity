import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

import { findTextBlock, type TipTapResolvedTextBlock, type TipTapTextBlockTag } from "../textBlocks";

/**
 * Re-resolves a node's `textBlock` attribute when it no longer belongs to the tag the node is stored
 * as. The type select sets both, but the `Mod-Alt-<level>` shortcuts change only the tag and carry
 * the previous name along - a paragraph left with `textBlock: "heading-1"` is content the API
 * rejects, since a name has to belong to the node's tag.
 *
 * A node without a name keeps it that way: it is resolved by its tag when read, which is how content
 * written before the attribute existed stays valid.
 */
export function createSyncTextBlock({ textBlocks }: { textBlocks: TipTapResolvedTextBlock[] }) {
    return Extension.create({
        name: "syncTextBlock",

        addProseMirrorPlugins() {
            return [
                new Plugin({
                    key: new PluginKey("syncTextBlock"),

                    appendTransaction(transactions, _, newState) {
                        if (!transactions.some((transaction) => transaction.docChanged)) {
                            return null;
                        }

                        const transaction = newState.tr;
                        let changed = false;

                        newState.doc.descendants((node, pos) => {
                            const isTextBlock = node.type.name === "paragraph" || node.type.name === "heading";
                            if (!isTextBlock || node.attrs.textBlock == null) {
                                return;
                            }

                            const tag: TipTapTextBlockTag = node.type.name === "heading" ? (`h${node.attrs.level}` as TipTapTextBlockTag) : "p";
                            const textBlock = findTextBlock({ name: node.attrs.textBlock, tag, textBlocks });

                            if (textBlock && textBlock.name !== node.attrs.textBlock) {
                                transaction.setNodeAttribute(pos, "textBlock", textBlock.name);
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
