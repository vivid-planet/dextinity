import {
    hasTipTapRichTextContent,
    PreviewSkeleton,
    type PropsWithData,
    renderTipTapRichText,
    type TipTapNodeHandler,
    withPreview,
} from "@dextinity/site-nextjs";
import type { HeadingBlockData } from "@src/blocks.generated";
import { Typography, type TypographyProps } from "@src/common/components/Typography";

import { InlineTipTapRichTextBlock } from "./InlineTipTapRichTextBlock";

type TypographyVariant = TypographyProps<"p">["variant"];

// The headline's text blocks are named after the typography variant they're rendered with.
const createHeadlineNodeMapping = (htmlTag: HeadingBlockData["htmlTag"]): Record<string, TipTapNodeHandler> => ({
    textBlock: ({ node, children }) => (
        <Typography variant={node.attrs?.textBlock as TypographyVariant} as={htmlTag} bottomSpacing>
            {children}
        </Typography>
    ),
});

type HeadingBlockProps = PropsWithData<HeadingBlockData>;

export const HeadingBlock = withPreview(
    ({ data: { eyebrow, headline, htmlTag } }: HeadingBlockProps) => (
        <>
            {hasTipTapRichTextContent(eyebrow.tipTapContent) && (
                <Typography variant="headline400" as="p" bottomSpacing>
                    <InlineTipTapRichTextBlock data={eyebrow} />
                </Typography>
            )}
            <PreviewSkeleton
                hasContent={hasTipTapRichTextContent(headline.tipTapContent)}
                title={
                    <Typography variant="headline550" as="span">
                        Headline
                    </Typography>
                }
            >
                {renderTipTapRichText({ content: headline.tipTapContent, nodeMapping: createHeadlineNodeMapping(htmlTag) })}
            </PreviewSkeleton>
        </>
    ),
    { label: "Heading" },
);
