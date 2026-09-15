import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, type Transaction } from "@tiptap/pm/state";

import type { TipTapTextBlockStyleTargetType } from "./createTipTapRichTextBlock";

function getTextBlockStyleTargetType(nodeTypeName: string, level: number | undefined): TipTapTextBlockStyleTargetType | undefined {
    if (nodeTypeName === "paragraph") {
        return "paragraph";
    }
    if (nodeTypeName === "heading" && level) {
        return `heading-${level}` as TipTapTextBlockStyleTargetType;
    }
    return undefined;
}

// Backfills textBlockStyle on any heading/paragraph whose tag has a configured default but no style set, so
// the "no style" state the toolbar no longer offers for that tag (see `defaultTextBlockStyles`) can't persist
// — covers the toolbar's type/style selects, markdown input rules, keyboard shortcuts, and pasted content alike.
export const createDefaultTextBlockStyleExtension = (defaultTextBlockStyles: Partial<Record<TipTapTextBlockStyleTargetType, string>>) =>
    Extension.create({
        name: "defaultTextBlockStyle",
        addProseMirrorPlugins() {
            return [
                new Plugin({
                    key: new PluginKey("defaultTextBlockStyle"),
                    appendTransaction(transactions, _oldState, newState) {
                        if (!transactions.some((transaction) => transaction.docChanged)) {
                            return null;
                        }

                        let tr: Transaction | null = null;
                        newState.doc.descendants((node, pos) => {
                            if (node.attrs.textBlockStyle) {
                                return;
                            }
                            const targetType = getTextBlockStyleTargetType(node.type.name, node.attrs.level as number | undefined);
                            if (!targetType) {
                                return;
                            }
                            const defaultStyleName = defaultTextBlockStyles[targetType];
                            if (!defaultStyleName) {
                                return;
                            }
                            tr = (tr ?? newState.tr).setNodeAttribute(pos, "textBlockStyle", defaultStyleName);
                        });
                        return tr;
                    },
                }),
            ];
        },
    });
