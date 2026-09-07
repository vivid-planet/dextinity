"use client";
import { OptionalBlock, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { FullWidthImageBlockData } from "@src/blocks.generated";
import { DamImageBlock } from "@src/common/blocks/DamImageBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import { animateGroup } from "@src/util/animations/AnimateGroup";
import clsx from "clsx";

import styles from "./FullWidthImageBlock.module.scss";

export const FullWidthImageBlock = withPreview(
    ({ data: { image, content } }: PropsWithData<FullWidthImageBlockData>) => {
        return (
            <div className={clsx(styles.root, animateGroup())}>
                <AnimateBoxInOnScroll direction="bottom">
                    <DamImageBlock data={image} sizes="100vw" aspectRatio="16x9" />
                </AnimateBoxInOnScroll>
                <OptionalBlock
                    block={(props) => (
                        <AnimateBoxInOnScroll direction="bottom" delay={200} className={styles.content}>
                            <RichTextBlock data={props} />
                        </AnimateBoxInOnScroll>
                    )}
                    data={content}
                />
            </div>
        );
    },
    { label: "Full Width Image" },
);
