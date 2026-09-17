import Paragraph from "@tiptap/extension-paragraph";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { textBlockAttribute, textBlockStyleAttribute } from "./textBlockAttributes";
import { TextBlockNodeView } from "./TextBlockNodeView";

/**
 * Adds the `textBlock` attribute (which of the configured text blocks the node is) and, when text
 * block styles are configured, the `textBlockStyle` attribute. The attributes must match the API's
 * paragraph extension, otherwise the API rejects content the editor produces.
 *
 * A `styled` paragraph renders through a node view, so the editor previews its text block style or
 * its text block's own `element`.
 */
export function createTextBlockParagraph({ hasTextBlockStyles, styled }: { hasTextBlockStyles: boolean; styled: boolean }) {
    return Paragraph.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
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
