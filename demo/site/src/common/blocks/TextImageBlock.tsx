"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TextImageBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { createImageSizes } from "@src/util/createImageSizes";
import clsx from "clsx";

import { DamImageBlock } from "./DamImageBlock";
import { RichTextBlock } from "./RichTextBlock";
import styles from "./TextImageBlock.module.scss";

export const TextImageBlock = withPreview(
    ({ data: { text, image, imageAspectRatio, imagePosition } }: PropsWithData<TextImageBlockData>) => {
        return (
            <div className={clsx(styles.root, imagePosition === "left" && styles["root--imageLeft"])}>
                <div className={styles.imageContainer}>
                    <DamImageBlock data={image} aspectRatio={imageAspectRatio} sizes={createImageSizes({ default: "100vw", md: "30vw" })} />
                </div>
                <div className={styles.textContainer}>
                    <RichTextBlock data={text} />
                </div>
            </div>
        );
    },
    { label: "Text/Image" },
);

export const PageContentTextImageBlock = (props: PropsWithData<TextImageBlockData>) => (
    <PageLayout>
        <TextImageBlock {...props} />
    </PageLayout>
);
