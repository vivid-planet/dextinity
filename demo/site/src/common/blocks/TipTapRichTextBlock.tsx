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

import { Typography, type TypographyProps } from "../components/Typography";
import { isValidLink } from "../helpers/HiddenIfInvalidLink";
import { LinkBlock } from "./LinkBlock";
import styles from "./RichTextBlock.module.scss";

type TypographyVariant = TypographyProps<"p">["variant"];

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
        return (
            <Typography variant={headingLevelToVariant[level]} bottomSpacing className={styles.text}>
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
        const content = data.tipTapContent as TipTapNode;
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
            <TipTapRichTextBlock {...props} />
        </div>
    </PageLayout>
);
