"use client";
import { hasRichTextBlockContent, PreviewSkeleton, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { LinkBlockData, RichTextBlockData } from "@src/blocks.generated";
import clsx from "clsx";
import redraft, { type Renderers, type TextBlockRenderFn } from "redraft";

import { Typography, type TypographyProps } from "../components/Typography";
import { isValidLink } from "../helpers/HiddenIfInvalidLink";
import { LinkBlock } from "./LinkBlock";
import styles from "./RichTextBlock.module.scss";

export const createTextBlockRenderFn =
    (props: TypographyProps<keyof HTMLElementTagNameMap>): TextBlockRenderFn =>
    (children, { keys }) =>
        children.map((child, index) => (
            <Typography key={keys[index]} {...props} className={clsx(styles.text, props.className)}>
                {child}
            </Typography>
        ));

export const defaultRichTextInlineStyleMap: Renderers["inline"] = {
    // The key passed here is just an index based on rendering order inside a block
    BOLD: (children, { key }) => <strong key={key}>{children}</strong>,
    ITALIC: (children, { key }) => <em key={key}>{children}</em>,
    SUB: (children, { key }) => <sub key={key}>{children}</sub>,
    SUP: (children, { key }) => <sup key={key}>{children}</sup>,
    STRIKETHROUGH: (children, { key }) => <s key={key}>{children}</s>,
};

/**
 * Define the renderers
 */
const defaultRichTextRenderers: Renderers = {
    /**
     * Those callbacks will be called recursively to render a nested structure
     */
    inline: defaultRichTextInlineStyleMap,
    /**
     * Blocks receive children and depth
     * Note that children are an array of blocks with same styling,
     */
    blocks: {
        unstyled: createTextBlockRenderFn({ bottomSpacing: true }),
        "paragraph-standard": createTextBlockRenderFn({ bottomSpacing: true }),
        "paragraph-small": createTextBlockRenderFn({ variant: "paragraph200", bottomSpacing: true }),
        "header-one": createTextBlockRenderFn({ variant: "headline600", bottomSpacing: true }),
        "header-two": createTextBlockRenderFn({ variant: "headline550", bottomSpacing: true }),
        "header-three": createTextBlockRenderFn({ variant: "headline500", bottomSpacing: true }),
        "header-four": createTextBlockRenderFn({ variant: "headline450", bottomSpacing: true }),
        "header-five": createTextBlockRenderFn({ variant: "headline400", bottomSpacing: true }),
        "header-six": createTextBlockRenderFn({ variant: "headline350", bottomSpacing: true }),
        // List
        // or depth for nested lists
        "unordered-list-item": (children, { depth, keys }) => (
            <ul key={keys[keys.length - 1]}>
                {children.map((child, index) => (
                    <Typography as="li" key={keys[index]} className={styles.text}>
                        {child}
                    </Typography>
                ))}
            </ul>
        ),
        "ordered-list-item": (children, { depth, keys }) => (
            <ol
                key={keys.join("|")}
                className={depth % 3 === 0 ? styles.orderedListLevel0 : depth % 3 === 1 ? styles.orderedListLevel1 : styles.orderedListLevel2}
            >
                {children.map((child, index) => (
                    <Typography as="li" key={keys[index]} className={styles.text}>
                        {child}
                    </Typography>
                ))}
            </ol>
        ),
    },
    /**
     * Entities receive children and the entity data
     */
    entities: {
        // key is the entity key value from raw
        LINK: (children, data: LinkBlockData, { key }) =>
            isValidLink(data) ? (
                <LinkBlock key={key} data={data} className={styles.inlineLink}>
                    {children}
                </LinkBlock>
            ) : (
                <span>{children}</span>
            ),
    },
};

interface RichTextBlockProps extends PropsWithData<RichTextBlockData> {
    renderers?: Renderers;
    disableLastBottomSpacing?: boolean;
}

export const RichTextBlock = withPreview(
    ({ data, renderers = defaultRichTextRenderers, disableLastBottomSpacing }: RichTextBlockProps) => {
        const rendered = redraft(data.draftContent, renderers);

        return (
            <PreviewSkeleton title="RichText" type="rows" hasContent={hasRichTextBlockContent(data)}>
                {disableLastBottomSpacing ? <div className={styles.disableLastBottomSpacing}>{rendered}</div> : rendered}
            </PreviewSkeleton>
        );
    },
    { label: "Rich Text" },
);
