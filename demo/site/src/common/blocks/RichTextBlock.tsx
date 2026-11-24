import {
    hasTipTapRichTextContent,
    PreviewSkeleton,
    type PropsWithData,
    renderTipTapRichText,
    type TipTapMarkHandler,
    type TipTapNodeHandler,
    withPreview,
} from "@dextinity/site-nextjs";
import type { LinkBlockData, ProductPriceBlockData, ProductTeaserBlockData, RichTextBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { ProductPriceBlock } from "@src/products/blocks/ProductPriceBlock";
import { ProductTeaserBlock } from "@src/products/blocks/ProductTeaserBlock";
import type { LoadedData as ProductTeaserLoadedData } from "@src/products/blocks/ProductTeaserBlock.loader";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";

import { Typography, type TypographyVariant } from "../components/Typography";
import { isValidLink } from "../helpers/isValidLink";
import { LinkBlock } from "./LinkBlock";
import styles from "./RichTextBlock.module.scss";
import { textAlignClassName } from "./textAlignClassName";

const typographyPropsByTextBlock: Record<string, { as: keyof HTMLElementTagNameMap; variant?: TypographyVariant }> = {
    paragraph: { as: "p" },
    display: { as: "h1", variant: "headline600" },
    "heading-1": { as: "h1", variant: "headline550" },
    "heading-2": { as: "h2", variant: "headline500" },
    "heading-3": { as: "h3", variant: "headline450" },
    "heading-4": { as: "h4", variant: "headline400" },
    "heading-5": { as: "h5", variant: "headline350" },
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
    textBlock: ({ node, parent, children }) => {
        if (parent?.type === "listItem") {
            return <span className={textAlignClassName(node.attrs?.textAlign, styles.listItemText)}>{children}</span>;
        }
        const typographyProps = typographyPropsByTextBlock[node.attrs?.textBlock as string] ?? typographyPropsByTextBlock.paragraph;
        // A paragraph picks its typography from the style the editor applied, a heading from the text block itself.
        const variant = typographyProps.variant ?? (node.attrs?.textBlockStyle as TypographyVariant | null) ?? undefined;
        return (
            <Typography {...typographyProps} variant={variant} bottomSpacing className={textAlignClassName(node.attrs?.textAlign, styles.text)}>
                {children}
            </Typography>
        );
    },
    orderedList: ({ children }) => <ol className={styles.orderedList}>{children}</ol>,
    listItem: ({ node, children }) => {
        const firstTextBlock = node.content?.find((child) => child.type === "textBlock");
        const textBlockStyle = (firstTextBlock?.attrs?.textBlockStyle as TypographyVariant | null) ?? undefined;
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

interface RichTextBlockProps extends PropsWithData<RichTextBlockData> {
    disableLastBottomSpacing?: boolean;
}

export const RichTextBlock = withPreview(
    ({ data, disableLastBottomSpacing }: RichTextBlockProps) => {
        const content = data.tipTapContent;
        const rendered = renderTipTapRichText({ content, nodeMapping, markMapping });

        return (
            <PreviewSkeleton title="RichText" type="rows" hasContent={hasTipTapRichTextContent(content)}>
                {disableLastBottomSpacing ? <div className={styles.disableLastBottomSpacing}>{rendered}</div> : rendered}
            </PreviewSkeleton>
        );
    },
    { label: "Rich Text" },
);

export const PageContentRichTextBlock = ({ data }: PropsWithData<RichTextBlockData>) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <AnimateBoxInOnScroll direction="bottom" offset={300}>
                <RichTextBlock data={data} disableLastBottomSpacing />
            </AnimateBoxInOnScroll>
        </div>
    </PageLayout>
);
