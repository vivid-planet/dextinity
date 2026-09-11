import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { BillboardTeaserBlockData } from "@src/blocks.generated";
import { CallToActionListBlock } from "@src/common/blocks/CallToActionListBlock";
import { HeadingBlock } from "@src/common/blocks/HeadingBlock";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import { AnimateGroup } from "@src/util/animations/AnimateGroup";

import styles from "./BillboardTeaserBlock.module.scss";

export const BillboardTeaserBlock = withPreview(
    ({ data: { media, heading, text, overlay, callToActionList } }: PropsWithData<BillboardTeaserBlockData>) => (
        <AnimateGroup>
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
                        <AnimateBoxInOnScroll direction="bottom">
                            <HeadingBlock data={heading} />
                        </AnimateBoxInOnScroll>
                        <AnimateBoxInOnScroll direction="bottom" delay={100}>
                            <RichTextBlock data={text} />
                        </AnimateBoxInOnScroll>
                        <AnimateBoxInOnScroll direction="bottom" delay={200}>
                            <CallToActionListBlock data={callToActionList} />
                        </AnimateBoxInOnScroll>
                    </div>
                </PageLayout>
            </div>
        </AnimateGroup>
    ),
    { label: "Billboard Teaser" },
);
