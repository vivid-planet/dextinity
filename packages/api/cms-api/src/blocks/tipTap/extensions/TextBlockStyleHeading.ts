import type { Node } from "@tiptap/core";
import Heading, { type HeadingOptions } from "@tiptap/extension-heading";

export const TextBlockStyleHeading: Node<HeadingOptions> = Heading.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            textBlockStyle: {
                default: null,
            },
        };
    },
});
