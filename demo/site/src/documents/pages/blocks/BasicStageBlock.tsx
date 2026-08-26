"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { BasicStageBlockData } from "@src/blocks.generated";
import { CallToActionListBlock } from "@src/common/blocks/CallToActionListBlock";
import { HeadingBlock } from "@src/common/blocks/HeadingBlock";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { PageLayout } from "@src/layout/PageLayout";

import styles from "./BasicStageBlock.module.scss";

export const BasicStageBlock = withPreview(
    ({ data: { media, heading, text, overlay, alignment, callToActionList } }: PropsWithData<BasicStageBlockData>) => (
        <div className={styles.root}>
            <div className={styles.mediaPhone}>
                <MediaBlock data={media} aspectRatio="1x2" fill />
            </div>
            <div className={styles.mediaTablet}>
                <MediaBlock data={media} aspectRatio="1x1" fill />
            </div>
            <div className={styles.mediaTabletLandscape}>
                <MediaBlock data={media} aspectRatio="3x2" fill />
            </div>
            <div className={styles.mediaDesktop}>
                <MediaBlock data={media} aspectRatio="16x9" fill />
            </div>
            <div className={styles.imageOverlay} style={{ opacity: `${overlay}%` }} />
            <PageLayout className={styles.absoluteGridRoot} grid>
                <div className={styles.content} style={{ alignItems: alignment }}>
                    <HeadingBlock data={heading} />
                    <RichTextBlock data={text} />
                    <CallToActionListBlock data={callToActionList} />
                </div>
            </PageLayout>
        </div>
    ),
    { label: "Stage" },
);
