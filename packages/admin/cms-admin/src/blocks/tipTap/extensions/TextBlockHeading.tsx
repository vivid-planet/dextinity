import Heading, { type Level as HeadingLevel } from "@tiptap/extension-heading";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { textBlockAttributes } from "./textBlockAttributes";
import { TextBlockNodeView } from "./TextBlockNodeView";

/**
 * Adds the `textBlock` (which of the configured text blocks the node is) and `textBlockStyle`
 * attributes to the heading node and sets the level new headings get. The attributes must match the
 * API's heading extension, otherwise the API rejects content the editor produces.
 *
 * A `styled` heading renders its text block style through a node view, so the editor previews it.
 */
export function createTextBlockHeading({ defaultLevel, styled }: { defaultLevel: HeadingLevel; styled: boolean }) {
    return Heading.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                // `rendered: false` keeps TipTap from adding a `level` HTML attribute, the level is the tag name.
                level: { default: defaultLevel, rendered: false },
                ...textBlockAttributes,
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
