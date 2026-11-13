import { styled } from "@mui/material/styles";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, type ReactNodeViewProps, ReactNodeViewRenderer } from "@tiptap/react";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        placeholder: {
            insertPlaceholder: (name: string) => ReturnType;
        };
    }
}

const PlaceholderView = ({ node, selected }: ReactNodeViewProps) => (
    <NodeViewWrapper as="span">
        <PlaceholderChip data-selected={selected ? "" : undefined}>{`{{${node.attrs.name}}}`}</PlaceholderChip>
    </NodeViewWrapper>
);

const PlaceholderChip = styled("span")`
    display: inline-block;
    padding-inline: 6px;
    border-radius: var(--dextinity-radius-pill);
    background: var(--dextinity-color-accent-soft);
    color: var(--dextinity-color-accent-text);
    font-family: var(--dextinity-font-family-mono);
    font-size: 0.9em;
    cursor: default;

    &[data-selected] {
        box-shadow: 0 0 0 2px var(--dextinity-color-focus);
    }
`;

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
