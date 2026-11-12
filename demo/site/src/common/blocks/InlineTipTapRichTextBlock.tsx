import { type PropsWithData, renderTipTapRichText, type TipTapNodeHandler } from "@dextinity/site-nextjs";
import type { InlineTipTapRichTextBlockData } from "@src/blocks.generated";

// The surrounding component provides the element and its typography, so the paragraph renders its content only.
const nodeMapping: Record<string, TipTapNodeHandler> = {
    textBlock: ({ children }) => <>{children}</>,
};

export const InlineTipTapRichTextBlock = ({ data }: PropsWithData<InlineTipTapRichTextBlockData>) =>
    renderTipTapRichText({ content: data.tipTapContent, nodeMapping });
