import { Mark, mergeAttributes } from "@tiptap/core";
import { MarkViewContent, type MarkViewProps, ReactMarkViewRenderer } from "@tiptap/react";
import { useContext } from "react";

import { InlineStyleContext } from "../InlineStyleContext";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        inlineStyle: {
            setInlineStyle: (attrs: { type: string }) => ReturnType;
            unsetInlineStyle: () => ReturnType;
        };
    }
}

function InlineStyleMarkView({ mark }: MarkViewProps) {
    const inlineStyles = useContext(InlineStyleContext);
    const styleName = mark.attrs.type as string | null;
    const config = styleName ? inlineStyles.find((s) => s.name === styleName) : undefined;

    if (config) {
        const Element = config.element;
        return (
            <Element data-inline-style={styleName}>
                <MarkViewContent />
            </Element>
        );
    }

    return <MarkViewContent />;
}

export const InlineStyleMark = Mark.create({
    name: "inlineStyle",

    addAttributes() {
        return {
            type: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute("data-inline-style"),
                renderHTML: (attributes: { type: string | null }) => {
                    if (!attributes.type) {
                        return {};
                    }
                    return { "data-inline-style": attributes.type };
                },
            },
        };
    },

    parseHTML() {
        return [{ tag: "span[data-inline-style]" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["span", mergeAttributes(HTMLAttributes), 0];
    },

    addMarkView() {
        return ReactMarkViewRenderer(InlineStyleMarkView);
    },

    addCommands() {
        return {
            setInlineStyle:
                (attrs) =>
                ({ commands }) =>
                    commands.setMark(this.name, attrs),
            unsetInlineStyle:
                () =>
                ({ commands }) =>
                    commands.unsetMark(this.name),
        };
    },
});
