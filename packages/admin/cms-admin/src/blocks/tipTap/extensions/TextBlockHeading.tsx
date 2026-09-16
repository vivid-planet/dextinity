import Heading from "@tiptap/extension-heading";
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps, ReactNodeViewRenderer } from "@tiptap/react";
import { useContext } from "react";

import { TextBlockStyleContext } from "../TextBlockStyleContext";

function TextBlockStyleHeadingView({ node }: ReactNodeViewProps) {
    const textBlockStyles = useContext(TextBlockStyleContext);
    const styleName = node.attrs.textBlockStyle as string | null;
    const textBlockName = node.attrs.textBlockName as string | null;
    const config = styleName ? textBlockStyles.find((s) => s.name === styleName) : undefined;
    const tag = `h${node.attrs.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

    if (config) {
        const Element = config.element;
        return (
            <NodeViewWrapper>
                <Element data-text-block-name={textBlockName} data-text-block-style={styleName}>
                    <NodeViewContent<"span"> as="span" />
                </Element>
            </NodeViewWrapper>
        );
    }

    // `data-text-block-name` is exposed here too, so a project can style a `textBlocks` entry purely
    // by name (e.g. a "display" heading-1 variant) via CSS, without needing a `textBlockStyles` entry.
    return (
        <NodeViewWrapper as={tag} data-text-block-name={textBlockName}>
            <NodeViewContent<"span"> as="span" />
        </NodeViewWrapper>
    );
}

export const TextBlockHeading = Heading.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            textBlockName: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute("data-text-block-name"),
                renderHTML: (attributes: { textBlockName: string | null }) => {
                    if (!attributes.textBlockName) {
                        return {};
                    }
                    return { "data-text-block-name": attributes.textBlockName };
                },
            },
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
