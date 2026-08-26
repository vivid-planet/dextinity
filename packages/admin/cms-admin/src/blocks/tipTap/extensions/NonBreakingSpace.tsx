import { RteNonBreakingSpace } from "@dextinity/admin-icons";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";

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
        {"\u00a0"}
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
        return ["span", mergeAttributes(HTMLAttributes, { "data-type": "non-breaking-space" }), "\u00a0"];
    },

    addNodeView() {
        return ReactNodeViewRenderer(NonBreakingSpaceView);
    },

    addCommands() {
        return {
            insertNonBreakingSpace:
                () =>
                ({ commands }) =>
                    commands.insertContent({ type: this.name }),
        };
    },
});
