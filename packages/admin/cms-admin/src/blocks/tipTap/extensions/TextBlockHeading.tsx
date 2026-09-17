import Heading, { type Level as HeadingLevel } from "@tiptap/extension-heading";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { textBlockAttribute, textBlockStyleAttribute } from "./textBlockAttributes";
import { TextBlockNodeView } from "./TextBlockNodeView";

/**
 * Adds the `textBlock` attribute (which of the configured text blocks the node is) and, when text
 * block styles are configured, the `textBlockStyle` attribute, and sets the level new headings get.
 * The attributes must match the API's heading extension, otherwise the API rejects content the
 * editor produces.
 *
 * A `styled` heading renders through a node view, so the editor previews its text block style or its
 * text block's own `element`.
 */
export function createTextBlockHeading({
    defaultLevel,
    hasTextBlockStyles,
    styled,
}: {
    defaultLevel: HeadingLevel;
    hasTextBlockStyles: boolean;
    styled: boolean;
}) {
    return Heading.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                // `rendered: false` keeps TipTap from adding a `level` HTML attribute, the level is the tag name.
                level: { default: defaultLevel, rendered: false },
                ...textBlockAttribute,
                ...(hasTextBlockStyles ? textBlockStyleAttribute : {}),
            };
        },

        ...(styled
            ? {
                  addNodeView() {
                      return ReactNodeViewRenderer(TextBlockNodeView);
                  },
              }
            : {}),
    });
}
