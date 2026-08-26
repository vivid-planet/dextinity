import { RteSoftHyphen } from "@dextinity/admin-icons";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        softHyphen: {
            insertSoftHyphen: () => ReturnType;
        };
    }
}

const SoftHyphenView = () => (
    <NodeViewWrapper as="span">
        <RteSoftHyphen style={{ fontSize: "inherit", color: "currentcolor", opacity: 0.5, paddingTop: "0.2em" }} />
    </NodeViewWrapper>
);

export const SoftHyphen = Node.create({
    name: "softHyphen",
    group: "inline",
    inline: true,
    selectable: false,
    atom: true,

    parseHTML() {
        return [{ tag: "span[data-type='soft-hyphen']" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["span", mergeAttributes(HTMLAttributes, { "data-type": "soft-hyphen" }), "\u00ad"];
    },

    addCommands() {
        return {
            insertSoftHyphen:
                () =>
                ({ commands }) =>
                    commands.insertContent({ type: this.name }),
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(SoftHyphenView);
    },
});
