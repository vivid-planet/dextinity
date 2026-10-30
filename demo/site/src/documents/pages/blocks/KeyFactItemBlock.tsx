import { hasRichTextBlockContent, type PropsWithData, SvgImageBlock, withPreview } from "@dextinity/site-nextjs";
import type { KeyFactsItemBlockData } from "@src/blocks.generated";
import { defaultRichTextInlineStyleMap, RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { Typography } from "@src/common/components/Typography";
import type { Renderers } from "redraft";

import styles from "./KeyFactItemBlock.module.scss";

const descriptionRenderers: Renderers = {
    inline: defaultRichTextInlineStyleMap,
};

export const KeyFactItemBlock = withPreview(
    ({ data: { icon, fact, label, description } }: PropsWithData<KeyFactsItemBlockData>) => (
        <div className={styles.root}>
            {icon.damFile && <SvgImageBlock data={icon} width={48} height={48} className={styles.icon} />}
            <Typography variant="headline500" className={styles.fact}>
                {fact}
            </Typography>
            <Typography variant="headline350">{label}</Typography>
            {hasRichTextBlockContent(description) && (
                <Typography variant="paragraph200" className={styles.description}>
                    <RichTextBlock data={description} renderers={descriptionRenderers} />
                </Typography>
            )}
        </div>
    ),
    { label: "Key fact" },
);
