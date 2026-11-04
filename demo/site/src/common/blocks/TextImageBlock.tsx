"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TextImageBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import { AnimateGroup } from "@src/util/animations/AnimateGroup";
import { createImageSizes } from "@src/util/createImageSizes";
import clsx from "clsx";

import { DamImageBlock } from "./DamImageBlock";
import { RichTextBlock } from "./RichTextBlock";
import styles from "./TextImageBlock.module.scss";

export const TextImageBlock = withPreview(
    ({ data: { text, image, imageAspectRatio, imagePosition } }: PropsWithData<TextImageBlockData>) => {
        return (
            <AnimateGroup>
                <div className={clsx(styles.root, imagePosition === "left" && styles["root--imageLeft"])}>
                    <AnimateBoxInOnScroll direction={imagePosition === "left" ? "left" : "right"} className={styles.imageContainer}>
                        <DamImageBlock data={image} aspectRatio={imageAspectRatio} sizes={createImageSizes({ default: "100vw", md: "30vw" })} />
                    </AnimateBoxInOnScroll>
                    <AnimateBoxInOnScroll direction="bottom" delay={100} offset={300} className={styles.textContainer}>
                        <RichTextBlock data={text} />
                    </AnimateBoxInOnScroll>
                </div>
            </AnimateGroup>
        );
    },
    { label: "Text/Image" },
);

export const PageContentTextImageBlock = (props: PropsWithData<TextImageBlockData>) => (
    <PageLayout>
        <TextImageBlock {...props} />
    </PageLayout>
);
