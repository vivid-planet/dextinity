import Paragraph from "@tiptap/extension-paragraph";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { textBlockAttributes } from "./textBlockAttributes";
import { TextBlockNodeView } from "./TextBlockNodeView";

/**
 * Adds the `textBlock` (which of the configured text blocks the node is) and `textBlockStyle`
 * attributes to the paragraph node. The attributes must match the API's paragraph extension,
 * otherwise the API rejects content the editor produces.
 *
 * A `styled` paragraph renders its text block style through a node view, so the editor previews it.
 */
export function createTextBlockParagraph({ styled }: { styled: boolean }) {
    return Paragraph.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
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
