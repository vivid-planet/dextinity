import { RteNonBreakingSpace } from "@dextinity/admin-icons";
import { mergeAttributes, Node } from "@tiptap/core";
import type { Mark } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";

import { getMarksAtSelection } from "./getMarksAtSelection";

const nonBreakingSpaceCharacter = "\u00a0";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        nonBreakingSpace: {
            insertNonBreakingSpace: () => ReturnType;
        };
    }
}

const NonBreakingSpaceView = () => (
    <NodeViewWrapper as="span" style={{ position: "relative", letterSpacing: "0.9em" }}>
        <RteNonBreakingSpace
            style={{ position: "absolute", top: "0.12em", left: "0.08em", fontSize: "inherit", color: "currentcolor", opacity: 0.5 }}
        />
        {nonBreakingSpaceCharacter}
    </NodeViewWrapper>
);

export const NonBreakingSpace = Node.create({
    name: "nonBreakingSpace",
    group: "inline",
    inline: true,
    selectable: false,
    atom: true,

    parseHTML() {
        return [{ tag: "span[data-type='non-breaking-space']" }];
    },

    renderHTML({ HTMLAttributes }) {
        // Without a class, ProseMirror turns the span into a regular space when it is pasted in Chrome.
        return [
            "span",
            mergeAttributes(HTMLAttributes, { "data-type": "non-breaking-space", class: "non-breaking-space" }),
            nonBreakingSpaceCharacter,
        ];
    },

    renderText() {
        return nonBreakingSpaceCharacter;
    },

    addNodeView() {
        return ReactNodeViewRenderer(NonBreakingSpaceView);
    },

    addProseMirrorPlugins() {
        const nonBreakingSpaceType = this.type;

        return [
            new Plugin({
                key: new PluginKey("nonBreakingSpaceCharacter"),

                // A typed or pasted character would be invisible in the editor, unlike the node the toolbar button inserts.
                appendTransaction(transactions, _, newState) {
                    if (!transactions.some((transaction) => transaction.docChanged)) {
                        return null;
                    }

                    const characters: Array<{ pos: number; marks: readonly Mark[] }> = [];
                    newState.doc.descendants((node, pos, parent) => {
                        if (!node.isText || !node.text || !parent?.type.contentMatch.matchType(nonBreakingSpaceType)) {
                            return;
                        }

                        for (const match of node.text.matchAll(new RegExp(nonBreakingSpaceCharacter, "g"))) {
                            characters.push({ pos: pos + match.index, marks: node.marks });
                        }
                    });

                    if (characters.length === 0) {
                        return null;
                    }

                    const transaction = newState.tr;
                    for (const { pos, marks } of characters) {
                        transaction.replaceWith(pos, pos + 1, nonBreakingSpaceType.create(null, null, marks));
                    }
                    return transaction;
                },
            }),
        ];
    },

    addCommands() {
        return {
            insertNonBreakingSpace:
                () =>
                ({ state, commands }) =>
                    commands.insertContent({ type: this.name, marks: getMarksAtSelection(state) }),
        };
    },
});
