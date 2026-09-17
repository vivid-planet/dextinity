"use client";
import {
    hasTipTapRichTextContent,
    PreviewSkeleton,
    type PropsWithData,
    renderTipTapRichText,
    type TipTapMarkHandler,
    type TipTapNodeHandler,
    withPreview,
} from "@dextinity/site-nextjs";
import type { LinkBlockData, ProductPriceBlockData, ProductTeaserBlockData, TipTapRichTextBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { ProductPriceBlock } from "@src/products/blocks/ProductPriceBlock";
import { ProductTeaserBlock } from "@src/products/blocks/ProductTeaserBlock";
import type { LoadedData as ProductTeaserLoadedData } from "@src/products/blocks/ProductTeaserBlock.loader";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";

import { Typography, type TypographyProps } from "../components/Typography";
import { isValidLink } from "../helpers/HiddenIfInvalidLink";
import { LinkBlock } from "./LinkBlock";
import styles from "./RichTextBlock.module.scss";

type TypographyVariant = TypographyProps<"p">["variant"];

const textBlockToVariant: Record<string, TypographyVariant> = {
    display: "headline600",
    "heading-1": "headline550",
    "heading-2": "headline500",
    "heading-3": "headline450",
    "heading-4": "headline400",
    "heading-5": "headline350",
};

// Content written before the text block was stored with the node only carries its level.
const headingLevelToVariant: Record<1 | 2 | 3 | 4 | 5 | 6, TypographyVariant> = {
    1: "headline600",
    2: "headline550",
    3: "headline500",
    4: "headline450",
    5: "headline400",
    6: "headline350",
};

const renderCmsBlock: TipTapNodeHandler = ({ node }) => {
    if (node.attrs?.blockType === "productPrice") {
        return <ProductPriceBlock data={node.attrs?.data as ProductPriceBlockData} />;
    }
    if (node.attrs?.blockType === "productTeaser") {
        return <ProductTeaserBlock data={node.attrs?.data as ProductTeaserBlockData & { loaded: ProductTeaserLoadedData }} />;
    }
    return null;
};

const nodeMapping: Record<string, TipTapNodeHandler> = {
    paragraph: ({ node, children }) => (
        <Typography variant={(node.attrs?.textBlockStyle as TypographyVariant | null) ?? undefined} bottomSpacing className={styles.text}>
            {children}
        </Typography>
    ),
    heading: ({ node, children }) => {
        const level = (node.attrs?.level as 1 | 2 | 3 | 4 | 5 | 6) ?? 1;
        const textBlock = node.attrs?.textBlock as string | null | undefined;
        const variant = (textBlock ? textBlockToVariant[textBlock] : undefined) ?? headingLevelToVariant[level];
        return (
            <Typography variant={variant} bottomSpacing className={styles.text}>
                {children}
            </Typography>
        );
    },
    listItem: ({ node, children }) => {
        const firstParagraph = node.content?.find((child) => child.type === "paragraph");
        const textBlockStyle = (firstParagraph?.attrs?.textBlockStyle as TypographyVariant | null) ?? undefined;
        return (
            <Typography as="li" variant={textBlockStyle} className={styles.text}>
                {children}
            </Typography>
        );
    },
    cmsBlock: renderCmsBlock,
    cmsInlineBlock: renderCmsBlock,
};

const markMapping: Record<string, TipTapMarkHandler> = {
    link: ({ mark, children }) => {
        const linkData = mark.attrs?.data as LinkBlockData | undefined;
        if (!linkData || !isValidLink(linkData)) {
            return <>{children}</>;
        }
        return (
            <LinkBlock data={linkData} className={styles.inlineLink}>
                {children}
            </LinkBlock>
        );
    },
};

interface TipTapRichTextBlockProps extends PropsWithData<TipTapRichTextBlockData> {
    disableLastBottomSpacing?: boolean;
}

export const TipTapRichTextBlock = withPreview(
    ({ data, disableLastBottomSpacing }: TipTapRichTextBlockProps) => {
        const content = data.tipTapContent;
        const rendered = renderTipTapRichText({ content, nodeMapping, markMapping });

        return (
            <PreviewSkeleton title="RichText" type="rows" hasContent={hasTipTapRichTextContent(content)}>
                {disableLastBottomSpacing ? <div className={styles.disableLastBottomSpacing}>{rendered}</div> : rendered}
            </PreviewSkeleton>
        );
    },
    { label: "TipTap Rich Text" },
);

export const PageContentTipTapRichTextBlock = (props: PropsWithData<TipTapRichTextBlockData>) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <AnimateBoxInOnScroll direction="bottom" offset={300}>
                <TipTapRichTextBlock {...props} />
            </AnimateBoxInOnScroll>
        </div>
    </PageLayout>
);
