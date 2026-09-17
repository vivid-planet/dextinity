import Paragraph from "@tiptap/extension-paragraph";
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps, ReactNodeViewRenderer } from "@tiptap/react";
import { useContext } from "react";

import { TextBlockStyleContext } from "../TextBlockStyleContext";

function TextBlockStyleParagraphView({ node }: ReactNodeViewProps) {
    const textBlockStyles = useContext(TextBlockStyleContext);
    const styleName = node.attrs.textBlockStyle as string | null;
    const config = styleName ? textBlockStyles.find((s) => s.name === styleName) : undefined;

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
        <NodeViewWrapper as="p">
            <NodeViewContent<"span"> as="span" />
        </NodeViewWrapper>
    );
}

export const TextBlockStyleParagraph = Paragraph.extend({
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
        return ReactNodeViewRenderer(TextBlockStyleParagraphView);
    },
});
