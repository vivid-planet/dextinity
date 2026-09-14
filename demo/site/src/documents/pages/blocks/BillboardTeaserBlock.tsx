import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { BillboardTeaserBlockData } from "@src/blocks.generated";
import { CallToActionListBlock } from "@src/common/blocks/CallToActionListBlock";
import { HeadingBlock } from "@src/common/blocks/HeadingBlock";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { PageLayout } from "@src/layout/PageLayout";

import styles from "./BillboardTeaserBlock.module.scss";

export const BillboardTeaserBlock = withPreview(
    ({ data: { media, heading, text, overlay, callToActionList } }: PropsWithData<BillboardTeaserBlockData>) => (
        <div className={styles.root}>
            <div className={styles.imageMobile}>
                <MediaBlock data={media} aspectRatio="1x1" />
            </div>
            <div className={styles.imageTablet}>
                <MediaBlock data={media} aspectRatio="4x3" />
            </div>
            <div className={styles.imageDesktop}>
                <MediaBlock data={media} aspectRatio="16x9" />
            </div>
            <div className={styles.imageLargeDesktop}>
                <MediaBlock data={media} aspectRatio="3x1" />
            </div>
            <div className={styles.imageOverlay} style={{ opacity: `${overlay}%` }} />
            <PageLayout className={styles.absoluteGridRoot} grid>
                <div className={styles.content}>
                    <HeadingBlock data={heading} />
                    <RichTextBlock data={text} />
                    <CallToActionListBlock data={callToActionList} />
                </div>
            </PageLayout>
        </div>
    ),
    { label: "Billboard Teaser" },
);
