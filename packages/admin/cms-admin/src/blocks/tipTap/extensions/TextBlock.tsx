import { InputRule, mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { parseTextBlock, type TipTapResolvedTextBlock, type TipTapTextBlockTag } from "../textBlocks";
import { textBlockAttribute, textBlockStyleAttribute } from "./textBlockAttributes";
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
    styled,
}: {
    textBlocks: TipTapResolvedTextBlock[];
    defaultTextBlock: TipTapResolvedTextBlock;
    styled: boolean;
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
                ...(styled ? textBlockStyleAttribute : {}),
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
            // The text block a shortcut switches to: the first one with that tag, as before, since a
            // shortcut can't tell two text blocks sharing a tag apart.
            const shortcut = (tag: TipTapTextBlockTag) => {
                const textBlock = textBlocks.find((candidate) => candidate.tag === tag);
                return textBlock
                    ? {
                          [`Mod-Alt-${tag === "p" ? 0 : textBlock.level}`]: () =>
                              this.editor.commands.updateAttributes(this.name, { textBlock: textBlock.name }),
                      }
                    : {};
            };

            return Object.assign({}, ...[...new Set(textBlocks.map((textBlock) => textBlock.tag))].map(shortcut));
        },

        addInputRules() {
            return textBlocks
                .filter((textBlock) => textBlock.level !== undefined)
                .map(
                    (textBlock) =>
                        new InputRule({
                            find: new RegExp(`^#{${textBlock.level}}\\s$`),
                            handler: ({ state, range }) => {
                                const { tr } = state;
                                tr.delete(range.from, range.to);
                                tr.setNodeAttribute(tr.selection.$from.before(), "textBlock", textBlock.name);
                            },
                        }),
                );
        },

        ...(styled
            ? {
                  addNodeView() {
                      return ReactNodeViewRenderer(createTextBlockNodeView(textBlocks));
                  },
              }
            : {}),
    });
}
