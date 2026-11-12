import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { StandaloneRichTextBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";

import styles from "./StandaloneRichTextBlock.module.scss";
import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

type StandaloneRichTextBlockProps = PropsWithData<StandaloneRichTextBlockData>;

export const StandaloneRichTextBlock = withPreview(
    ({ data: { richText, textAlignment } }: StandaloneRichTextBlockProps) => {
        return (
            <AnimateBoxInOnScroll direction="bottom" offset={300}>
                <div className={styles[textAlignment]}>
                    <TipTapRichTextBlock data={richText} disableLastBottomSpacing />
                </div>
            </AnimateBoxInOnScroll>
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
