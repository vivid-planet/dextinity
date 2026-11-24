import {
    hasTipTapRichTextContent,
    PreviewSkeleton,
    type PropsWithData,
    renderTipTapRichText,
    type TipTapNodeHandler,
    withPreview,
} from "@dextinity/site-nextjs";
import type { HeadingBlockData } from "@src/blocks.generated";
import { Typography, type TypographyVariant } from "@src/common/components/Typography";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";

import styles from "./RichTextBlock.module.scss";
import { textAlignClassName } from "./textAlignClassName";

const tagByTextBlock: Record<string, keyof HTMLElementTagNameMap> = {
    "heading-1": "h1",
    "heading-2": "h2",
    "heading-3": "h3",
    "heading-4": "h4",
    "heading-5": "h5",
    "heading-6": "h6",
};

// The headline's styles are named after the typography variant they're rendered with.
const headlineNodeMapping: Record<string, TipTapNodeHandler> = {
    textBlock: ({ node, children }) => (
        <Typography
            as={tagByTextBlock[node.attrs?.textBlock as string] ?? "h2"}
            variant={(node.attrs?.textBlockStyle as TypographyVariant | null) ?? "headline600"}
            bottomSpacing
            className={textAlignClassName(node.attrs?.textAlign)}
        >
            {children}
        </Typography>
    ),
};

const eyebrowNodeMapping: Record<string, TipTapNodeHandler> = {
    textBlock: ({ node, children }) => (
        <Typography variant="headline400" as="p" bottomSpacing className={textAlignClassName(node.attrs?.textAlign)}>
            {children}
        </Typography>
    ),
};

type HeadingBlockProps = PropsWithData<HeadingBlockData>;

export const HeadingBlock = withPreview(
    ({ data: { eyebrow, headline } }: HeadingBlockProps) => (
        <>
            {hasTipTapRichTextContent(eyebrow.tipTapContent) &&
                renderTipTapRichText({ content: eyebrow.tipTapContent, nodeMapping: eyebrowNodeMapping })}
            <PreviewSkeleton
                hasContent={hasTipTapRichTextContent(headline.tipTapContent)}
                title={
                    <Typography variant="headline550" as="span">
                        Headline
                    </Typography>
                }
            >
                {renderTipTapRichText({ content: headline.tipTapContent, nodeMapping: headlineNodeMapping })}
            </PreviewSkeleton>
        </>
    ),
    { label: "Heading" },
);

export const AnimatedHeadingBlock = (props: HeadingBlockProps) => (
    <AnimateBoxInOnScroll direction="bottom">
        <HeadingBlock {...props} />
    </AnimateBoxInOnScroll>
);

export const PageContentHeadingBlock = (props: HeadingBlockProps) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <AnimatedHeadingBlock {...props} />
        </div>
    </PageLayout>
);
