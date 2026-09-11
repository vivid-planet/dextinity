"use client";
import { OptionalBlock, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { FullWidthImageBlockData } from "@src/blocks.generated";
import { DamImageBlock } from "@src/common/blocks/DamImageBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";

import styles from "./FullWidthImageBlock.module.scss";

export const FullWidthImageBlock = withPreview(
    ({ data: { image, content } }: PropsWithData<FullWidthImageBlockData>) => {
        return (
            <div className={styles.root}>
                <DamImageBlock data={image} sizes="100vw" aspectRatio="16x9" />
                <OptionalBlock
                    block={(props) => (
                        <div className={styles.content}>
                            <RichTextBlock data={props} />
                        </div>
                    )}
                    data={content}
                />
            </div>
        );
    },
    { label: "Full Width Image" },
);
