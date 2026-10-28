"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { StandaloneHeadingBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import clsx from "clsx";

import { HeadingBlock } from "./HeadingBlock";
import styles from "./StandaloneHeadingBlock.module.scss";

type StandaloneHeadingBlockProps = PropsWithData<StandaloneHeadingBlockData>;

export const StandaloneHeadingBlock = withPreview(
    ({ data: { heading, textAlignment } }: StandaloneHeadingBlockProps) => {
        return (
            <AnimateBoxInOnScroll direction="bottom">
                <div className={clsx(styles.root, textAlignment === "center" && styles.rootCenter)}>
                    <HeadingBlock data={heading} />
                </div>
            </AnimateBoxInOnScroll>
        );
    },
    { label: "Heading" },
);

export const PageContentStandaloneHeadingBlock = (props: StandaloneHeadingBlockProps) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <StandaloneHeadingBlock {...props} />
        </div>
    </PageLayout>
);
