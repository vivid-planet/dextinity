"use client";
import {
    hasTipTapRichTextContent,
    PreviewSkeleton,
    type PropsWithData,
    renderTipTapRichText,
    type TipTapMarkHandler,
    type TipTapNode,
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

const textStyleToVariant: Record<string, TypographyVariant> = {
    paragraph300: "paragraph300",
    paragraph200: "paragraph200",
    eyebrow500: "eyebrow500",
    eyebrow450: "eyebrow450",
};

const variantOf = (node?: TipTapNode): TypographyVariant =>
    textStyleToVariant[node?.attrs?.textStyle as string] ?? textBlockToVariant[node?.attrs?.textBlock as string];

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
    // A style picked for the text block wins over the text block's own typography. Inside a list the
    // item carries the typography, so the text block only contributes its content.
    textBlock: ({ node, parent, children }) =>
        parent?.type === "listItem" ? (
            children
        ) : (
            <Typography variant={variantOf(node)} bottomSpacing className={styles.text}>
                {children}
            </Typography>
        ),
    // The list owns the style of its items, and a nested list carries its own.
    listItem: ({ parent, children }) => (
        <Typography as="li" variant={variantOf(parent)} className={styles.text}>
            {children}
        </Typography>
    ),
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
