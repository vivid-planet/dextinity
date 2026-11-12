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
import { ProductPriceBlock } from "@src/products/blocks/ProductPriceBlock";
import { ProductTeaserBlock } from "@src/products/blocks/ProductTeaserBlock";
import type { LoadedData as ProductTeaserLoadedData } from "@src/products/blocks/ProductTeaserBlock.loader";

import { Typography, type TypographyProps } from "../components/Typography";
import { isValidLink } from "../helpers/isValidLink";
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
    textBlock: ({ node, children }) => {
        // A paragraph picks its typography from the style the editor applied, a heading from the text block itself.
        const variant = textBlockToVariant[node.attrs?.textBlock as string] ?? (node.attrs?.textBlockStyle as TypographyVariant | null) ?? undefined;
        return (
            <Typography variant={variant} bottomSpacing className={styles.text}>
                {children}
            </Typography>
        );
    },
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
