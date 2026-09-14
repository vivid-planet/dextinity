"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { StandaloneRichTextBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";

import { RichTextBlock } from "./RichTextBlock";
import styles from "./StandaloneRichTextBlock.module.scss";

type StandaloneRichTextBlockProps = PropsWithData<StandaloneRichTextBlockData>;

export const StandaloneRichTextBlock = withPreview(
    ({ data: { richText, textAlignment } }: StandaloneRichTextBlockProps) => {
        return (
            <div className={styles[textAlignment]}>
                <RichTextBlock data={richText} disableLastBottomSpacing />
            </div>
        );
    },
    { label: "RichText" },
);

export const PageContentStandaloneRichTextBlock = (props: StandaloneRichTextBlockProps) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <StandaloneRichTextBlock {...props} />
        </div>
    </PageLayout>
);
