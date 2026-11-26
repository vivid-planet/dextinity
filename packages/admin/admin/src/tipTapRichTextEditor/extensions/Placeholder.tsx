import { Chip } from "@mui/material";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, type ReactNodeViewProps, ReactNodeViewRenderer } from "@tiptap/react";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        placeholder: {
            insertPlaceholder: (name: string) => ReturnType;
        };
    }
}

const PlaceholderView = ({ node }: ReactNodeViewProps) => (
    <NodeViewWrapper as="span" style={{ display: "inline-block", verticalAlign: "baseline" }}>
        <Chip label={`{{${node.attrs.name}}}`} size="small" sx={{ height: "auto", fontSize: "inherit", lineHeight: "inherit", cursor: "default" }} />
    </NodeViewWrapper>
);

export const Placeholder = Node.create({
    name: "placeholder",
    group: "inline",
    inline: true,
    selectable: true,
    atom: true,

    addAttributes() {
        return {
            name: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute("data-name"),
                renderHTML: (attributes: { name: string }) => ({ "data-name": attributes.name }),
            },
        };
    },

    parseHTML() {
        return [{ tag: "span[data-type='placeholder']" }];
    },

    renderHTML({ HTMLAttributes }) {
        const name = HTMLAttributes["data-name"] ?? "";
        return ["span", mergeAttributes(HTMLAttributes, { "data-type": "placeholder" }), `{{${name}}}`];
    },

    addNodeView() {
        return ReactNodeViewRenderer(PlaceholderView);
    },

    addCommands() {
        return {
            insertPlaceholder:
                (name: string) =>
                ({ commands }) =>
                    commands.insertContent({ type: this.name, attrs: { name } }),
        };
    },
});
