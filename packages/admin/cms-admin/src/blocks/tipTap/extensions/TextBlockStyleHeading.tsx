import Heading from "@tiptap/extension-heading";
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps, ReactNodeViewRenderer } from "@tiptap/react";
import { useContext } from "react";

import { TextBlockStyleContext } from "../TextBlockStyleContext";

function TextBlockStyleHeadingView({ node }: ReactNodeViewProps) {
    const textBlockStyles = useContext(TextBlockStyleContext);
    const styleName = node.attrs.textBlockStyle as string | null;
    const config = styleName ? textBlockStyles.find((s) => s.name === styleName) : undefined;
    const tag = `h${node.attrs.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

    if (config) {
        const Element = config.element;
        return (
            <NodeViewWrapper>
                <Element data-text-block-style={styleName}>
                    <NodeViewContent<"span"> as="span" />
                </Element>
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper as={tag}>
            <NodeViewContent<"span"> as="span" />
        </NodeViewWrapper>
    );
}

export const TextBlockStyleHeading = Heading.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            textBlockStyle: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute("data-text-block-style"),
                renderHTML: (attributes: { textBlockStyle: string | null }) => {
                    if (!attributes.textBlockStyle) {
                        return {};
                    }
                    return { "data-text-block-style": attributes.textBlockStyle };
                },
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(TextBlockStyleHeadingView);
    },
});
