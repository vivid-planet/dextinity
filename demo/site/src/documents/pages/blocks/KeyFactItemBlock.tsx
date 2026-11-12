import { hasTipTapRichTextContent, type PropsWithData, SvgImageBlock, withPreview } from "@dextinity/site-nextjs";
import type { KeyFactsItemBlockData } from "@src/blocks.generated";
import { InlineRichTextBlock } from "@src/common/blocks/InlineRichTextBlock";
import { Typography } from "@src/common/components/Typography";

import styles from "./KeyFactItemBlock.module.scss";

export const KeyFactItemBlock = withPreview(
    ({ data: { icon, fact, label, description } }: PropsWithData<KeyFactsItemBlockData>) => (
        <div className={styles.root}>
            {icon.damFile && <SvgImageBlock data={icon} width={48} height={48} className={styles.icon} />}
            <Typography variant="headline500" className={styles.fact}>
                {fact}
            </Typography>
            <Typography variant="headline350">{label}</Typography>
            {hasTipTapRichTextContent(description.tipTapContent) && (
                <Typography variant="paragraph200" className={styles.description}>
                    <InlineRichTextBlock data={description} />
                </Typography>
            )}
        </div>
    ),
    { label: "Key fact" },
);
