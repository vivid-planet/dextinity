import type { TipTapNodeHandler } from "@dextinity/site-nextjs";

/**
 * Renders the text block's content without an element of its own, for a single-paragraph rich text placed in a surrounding `Typography`.
 */
export const inlineRichTextNodeMapping: Record<string, TipTapNodeHandler> = {
    textBlock: ({ children }) => <>{children}</>,
};
