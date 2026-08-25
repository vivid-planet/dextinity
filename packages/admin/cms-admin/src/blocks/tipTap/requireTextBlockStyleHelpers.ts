import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, type Transaction } from "@tiptap/pm/state";

import type { TipTapTextBlockStyle, TipTapTextBlockType } from "./createTipTapRichTextBlock";

function getTextBlockTypeForNode(nodeTypeName: string, level: number | undefined): TipTapTextBlockType | undefined {
    if (nodeTypeName === "paragraph") {
        return "paragraph";
    }
    if (nodeTypeName === "heading" && level) {
        return `heading-${level}` as TipTapTextBlockType;
    }
    return undefined;
}

export function getDefaultTextBlockStyleName(textBlockType: TipTapTextBlockType, textBlockStyles: TipTapTextBlockStyle[]): string | null {
    const applicableStyle = textBlockStyles.find((style) => !style.appliesTo || style.appliesTo.includes(textBlockType));
    return applicableStyle?.name ?? null;
}

// Backfills textBlockStyle on any heading/paragraph that has an applicable style but none set, so a
// "no style" state (which the toolbar no longer offers when requireTextBlockStyle is enabled) can't
// persist — covers the toolbar, markdown input rules, keyboard shortcuts, and pasted content alike.
export const createRequireTextBlockStyleExtension = (textBlockStyles: TipTapTextBlockStyle[]) =>
    Extension.create({
        name: "requireTextBlockStyle",
        addProseMirrorPlugins() {
            return [
                new Plugin({
                    key: new PluginKey("requireTextBlockStyle"),
                    appendTransaction(transactions, _oldState, newState) {
                        if (!transactions.some((transaction) => transaction.docChanged)) {
                            return null;
                        }

                        let tr: Transaction | null = null;
                        newState.doc.descendants((node, pos) => {
                            if (node.attrs.textBlockStyle) {
                                return;
                            }
                            const textBlockType = getTextBlockTypeForNode(node.type.name, node.attrs.level as number | undefined);
                            if (!textBlockType) {
                                return;
                            }
                            const defaultStyleName = getDefaultTextBlockStyleName(textBlockType, textBlockStyles);
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
