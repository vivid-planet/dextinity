import { InputRule, mergeAttributes, Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { liftOutOfList } from "../liftOutOfList";
import {
    findTextBlockPerTag,
    isInsideListItem,
    isTextBlockAllowedInListItem,
    parseTextBlock,
    type TipTapResolvedTextBlock,
    type TipTapTextBlockTag,
} from "../textBlocks";
import { findListTextStyleInDecorations } from "./ListTextStyle";
import { textBlockAttribute, textStyleAttribute } from "./textBlockAttributes";
import { createTextBlockNodeView } from "./TextBlockNodeView";

/**
 * The single node every paragraph and heading is stored as. Which of the configured text blocks it
 * is decides how it renders, so the content carries the text block's name instead of a tag and a
 * heading level - the tag belongs to the configuration, not to the content.
 *
 * The node must match the API's, otherwise the API rejects content the editor produces.
 */
export function createTextBlock({
    textBlocks,
    defaultTextBlock,
    hasStyles,
    hasCustomElements,
}: {
    textBlocks: TipTapResolvedTextBlock[];
    defaultTextBlock: TipTapResolvedTextBlock;
    /**
     * Whether a text block offers styles, which decides whether the node carries the `textStyle`
     * attribute. Must match the API's schema, otherwise the API rejects content the editor produces.
     */
    hasStyles: boolean;
    /**
     * Whether a text block or one of the styles that can apply to it renders its own element, which
     * the node view is there for.
     */
    hasCustomElements: boolean;
}) {
    const tagOf = (name: unknown): TipTapTextBlockTag => (textBlocks.find((textBlock) => textBlock.name === name) ?? defaultTextBlock).tag;

    return Node.create({
        name: "textBlock",
        group: "block",
        content: "inline*",
        defining: true,

        addAttributes() {
            return {
                ...textBlockAttribute(defaultTextBlock.name),
                ...(hasStyles ? textStyleAttribute : {}),
            };
        },

        parseHTML() {
            // One rule per tag in use, so pasted HTML and the content translation's round trip land on
            // the text block the tag belongs to unless the name is spelled out.
            return [...new Set(textBlocks.map((textBlock) => textBlock.tag))].map((tag) => ({
                tag,
                getAttrs: (element: HTMLElement) => ({
                    textBlock: parseTextBlock({ name: element.getAttribute("data-text-block"), tag, textBlocks })?.name ?? defaultTextBlock.name,
                }),
            }));
        },

        renderHTML({ node, HTMLAttributes }) {
            return [tagOf(node.attrs.textBlock), mergeAttributes(HTMLAttributes), 0];
        },

        addKeyboardShortcuts() {
            const shortcut = (textBlock: TipTapResolvedTextBlock) => ({
                [`Mod-Alt-${textBlock.level ?? 0}`]: () => {
                    if (!isTextBlockAllowedInListItem(textBlock)) {
                        liftOutOfList(this.editor);
                    }
                    return this.editor.commands.updateAttributes(this.name, { textBlock: textBlock.name });
                },
            });

            return Object.assign({}, ...findTextBlockPerTag(textBlocks).map(shortcut));
        },

        addInputRules() {
            return findTextBlockPerTag(textBlocks)
                .filter((textBlock) => textBlock.level !== undefined)
                .map(
                    (textBlock) =>
                        new InputRule({
                            find: new RegExp(`^#{${textBlock.level}}\\s$`),
                            handler: ({ state, range }) => {
                                if (this.editor.isActive("listItem")) {
                                    return;
                                }
                                const { tr } = state;
                                tr.delete(range.from, range.to);
                                tr.setNodeAttribute(tr.selection.$from.before(), "textBlock", textBlock.name);
                            },
                        }),
                );
        },

        addProseMirrorPlugins() {
            const paragraph = textBlocks.find(isTextBlockAllowedInListItem);
            if (!paragraph) {
                return [];
            }

            // Turning a heading into a list wraps it in a list item and carries its text block and
            // style along, and so does pasting one. Repairing it here covers every way into a list
            // item, which guarding the toolbar and the shortcuts would not.
            return [
                new Plugin({
                    key: new PluginKey("textBlockInListItem"),
                    appendTransaction: (_transactions, _oldState, newState) => {
                        const { tr } = newState;
                        let repaired = false;

                        newState.doc.descendants((node, pos) => {
                            if (node.type.name !== this.name) {
                                return;
                            }

                            if (!isInsideListItem(newState.doc.resolve(pos))) {
                                return;
                            }

                            const textBlock = textBlocks.find((candidate) => candidate.name === node.attrs.textBlock);
                            if (textBlock && !isTextBlockAllowedInListItem(textBlock)) {
                                tr.setNodeAttribute(pos, "textBlock", paragraph.name);
                                repaired = true;
                            }

                            // The list owns the style of its items, so an item's own one would compete with it.
                            if (hasStyles && node.attrs.textStyle != null) {
                                tr.setNodeAttribute(pos, "textStyle", null);
                                repaired = true;
                            }
                        });

                        return repaired ? tr : null;
                    },
                }),
            ];
        },

        ...(hasCustomElements
            ? {
                  addNodeView() {
                      return ReactNodeViewRenderer(createTextBlockNodeView({ textBlocks, defaultTextBlock }), {
                          // The node view renders the style its list hands it as a decoration, so
                          // only a change to that decoration is worth a re-render beyond the node's own.
                          update: ({ oldNode, newNode, oldDecorations, newDecorations, updateProps }) => {
                              if (
                                  oldNode !== newNode ||
                                  findListTextStyleInDecorations(oldDecorations) !== findListTextStyleInDecorations(newDecorations)
                              ) {
                                  updateProps();
                              }
                              return true;
                          },
                      });
                  },
              }
            : {}),
    });
}
