import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TeaserItemBlockData } from "@src/blocks.generated";
import { LinkBlock } from "@src/common/blocks/LinkBlock";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { defaultRichTextInlineStyleMap, RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { Typography } from "@src/common/components/Typography";
import { isValidLink } from "@src/common/helpers/HiddenIfInvalidLink";
import { SvgUse } from "@src/common/helpers/SvgUse";
import type { Renderers } from "redraft";

import styles from "./TeaserItemBlock.module.scss";

const descriptionRenderers: Renderers = {
    inline: defaultRichTextInlineStyleMap,
};

export const TeaserItemBlock = withPreview(
    ({ data: { media, title, description, link, titleHtmlTag } }: PropsWithData<TeaserItemBlockData>) => (
        <LinkBlock className={styles.link} data={link.link}>
            <div className={styles.mediaMobile}>
                <MediaBlock data={media} aspectRatio="1x1" sizes="20vw" />
            </div>
            <div className={styles.mediaDesktop}>
                <MediaBlock data={media} aspectRatio="16x9" sizes="20vw" />
            </div>
            <div className={styles.contentContainer}>
                <Typography className={styles.title} variant="headline350" as={titleHtmlTag}>
                    {title}
                </Typography>
                <Typography variant="paragraph200">
                    <RichTextBlock data={description} renderers={descriptionRenderers} />
                </Typography>
                {link.text && isValidLink(link.link) && (
                    <div className={styles.textLinkContainer}>
                        <SvgUse href="/assets/icons/arrow-right.svg#root" width={16} height={16} />
                        <Typography as="span" className={styles.linkText}>
                            {link.text}
                        </Typography>
                    </div>
                )}
            </div>
        </LinkBlock>
    ),
    { label: "Teaser Item" },
);
