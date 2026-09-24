import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { findListStyle, type ListStylesByType, listTypes } from "../listTextStyles";
import type { TipTapTextBlockStyle } from "../textStyles";
import { textStyleAttribute } from "./textBlockAttributes";

const decorationSpecKey = "tipTapListTextStyle";

/**
 * The style a text block's list hands down to it, put there by the plugin below.
 */
export const findListTextStyleInDecorations = (decorations: readonly Decoration[]): TipTapTextBlockStyle | undefined =>
    decorations.map((decoration) => decoration.spec?.[decorationSpecKey] as TipTapTextBlockStyle | undefined).find(Boolean);

/**
 * Gives the list nodes their `textStyle` attribute and hands the style down to the text block of
 * every item, so the editor previews a list's style the way it previews a text block's.
 *
 * The style sits on the list, not on its items, so changing it leaves the items untouched - and a
 * node view only re-renders for its own node. A decoration is what does reach them.
 *
 * The lists come from StarterKit, so the attribute is added globally instead of by extending them.
 */
export function createListTextStyle(stylesByType: ListStylesByType) {
    const styledTypes = listTypes.filter((type) => stylesByType[type].length > 0);

    return Extension.create({
        name: "listTextStyle",

        addGlobalAttributes() {
            return [{ types: styledTypes, attributes: textStyleAttribute }];
        },

        addProseMirrorPlugins() {
            return [
                new Plugin({
                    key: new PluginKey("listTextStyle"),
                    props: {
                        decorations({ doc }) {
                            const decorations: Decoration[] = [];

                            doc.descendants((node, pos) => {
                                if (node.type.name !== "textBlock") {
                                    return;
                                }
                                const style = findListStyle(doc.resolve(pos), stylesByType);
                                if (style) {
                                    // The node view puts the style on the DOM, so the decoration only carries it there.
                                    decorations.push(Decoration.node(pos, pos + node.nodeSize, {}, { [decorationSpecKey]: style }));
                                }
                            });

                            return DecorationSet.create(doc, decorations);
                        },
                    },
                }),
            ];
        },
    });
}
