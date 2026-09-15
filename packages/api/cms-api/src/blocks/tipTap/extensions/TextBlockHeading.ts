import Heading, { type Level as HeadingLevel } from "@tiptap/extension-heading";

/**
 * Adds the `textBlock` (which of the configured text blocks the node is) and `textBlockStyle`
 * attributes to the heading node and sets the level new headings get. The attributes must match
 * the Admin's heading extension, otherwise the API rejects content the editor produces.
 */
export function createTextBlockHeading({ defaultLevel }: { defaultLevel: HeadingLevel }) {
    return Heading.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                // `rendered: false` keeps TipTap from adding a `level` HTML attribute, the level is the tag name.
                level: { default: defaultLevel, rendered: false },
                textBlock: { default: null },
                textBlockStyle: { default: null },
            };
        },
    });
}
