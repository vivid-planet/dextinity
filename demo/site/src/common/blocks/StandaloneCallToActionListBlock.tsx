"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { StandaloneCallToActionListBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import clsx from "clsx";

import { CallToActionListBlock } from "./CallToActionListBlock";
import styles from "./StandaloneCallToActionListBlock.module.scss";

type StandaloneCallToActionListBlockProps = PropsWithData<StandaloneCallToActionListBlockData>;

export const StandaloneCallToActionListBlock = withPreview(
    ({ data: { callToActionList, alignment } }: StandaloneCallToActionListBlockProps) => {
        return (
            <div className={clsx(styles.root, styles[`root--${alignment}`])}>
                <CallToActionListBlock data={callToActionList} />
            </div>
        );
    },
    { label: "CallToActionList" },
);

export const PageContentStandaloneCallToActionListBlock = (props: StandaloneCallToActionListBlockProps) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <StandaloneCallToActionListBlock {...props} />
        </div>
    </PageLayout>
);
