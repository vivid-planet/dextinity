"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { StandaloneMediaBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";

import { MediaBlock } from "./MediaBlock";

export const StandaloneMediaBlock = withPreview(
    ({ data: { media, aspectRatio } }: PropsWithData<StandaloneMediaBlockData>) => {
        return (
            <PageLayout>
                <AnimateBoxInOnScroll direction="bottom">
                    <MediaBlock data={media} aspectRatio={aspectRatio} />
                </AnimateBoxInOnScroll>
            </PageLayout>
        );
    },
    { label: "Media" },
);
