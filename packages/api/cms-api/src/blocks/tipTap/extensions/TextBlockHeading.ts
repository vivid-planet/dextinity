import Heading, { type Level as HeadingLevel } from "@tiptap/extension-heading";

/**
 * Adds the `textBlock` attribute (which of the configured text blocks the node is) and, when text
 * block styles are configured, the `textBlockStyle` attribute, and sets the level new headings get.
 * The attributes must match the Admin's heading extension, otherwise the API rejects content the
 * editor produces.
 */
export function createTextBlockHeading({ defaultLevel, hasTextBlockStyles }: { defaultLevel: HeadingLevel; hasTextBlockStyles: boolean }) {
    return Heading.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                // `rendered: false` keeps TipTap from adding a `level` HTML attribute, the level is the tag name.
                level: { default: defaultLevel, rendered: false },
                textBlock: { default: null },
                ...(hasTextBlockStyles ? { textBlockStyle: { default: null } } : {}),
            };
        },
    });
}
