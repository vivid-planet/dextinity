import { InputRule, mergeAttributes, Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

import { liftOutOfList } from "../liftOutOfList";
import {
    findTextBlockPerTag,
    isTextBlockAllowedInListItem,
    parseTextBlock,
    type TipTapResolvedTextBlock,
    type TipTapTextBlockTag,
} from "../textBlocks";
import { textBlockAttribute } from "./textBlockAttributes";

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
}: {
    textBlocks: TipTapResolvedTextBlock[];
    defaultTextBlock: TipTapResolvedTextBlock;
}) {
    const tagOf = (name: unknown): TipTapTextBlockTag => (textBlocks.find((textBlock) => textBlock.name === name) ?? defaultTextBlock).tag;

    return Node.create({
        name: "textBlock",
        group: "block",
        content: "inline*",
        defining: true,

        addAttributes() {
            return textBlockAttribute(defaultTextBlock.name);
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

            // Turning a heading into a list wraps it in a list item and carries its text block along,
            // and so does pasting one. Repairing it here covers every way into a list item, which
            // guarding the toolbar and the shortcuts would not.
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

                            const textBlock = textBlocks.find((candidate) => candidate.name === node.attrs.textBlock);
                            if (!textBlock || isTextBlockAllowedInListItem(textBlock)) {
                                return;
                            }

                            const resolved = newState.doc.resolve(pos);
                            for (let depth = resolved.depth; depth > 0; depth--) {
                                if (resolved.node(depth).type.name === "listItem") {
                                    tr.setNodeAttribute(pos, "textBlock", paragraph.name);
                                    repaired = true;
                                    break;
                                }
                            }
                        });

                        return repaired ? tr : null;
                    },
                }),
            ];
        },
    });
}
