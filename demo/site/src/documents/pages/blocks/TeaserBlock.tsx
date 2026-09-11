import { ListBlock, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TeaserBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";

import styles from "./TeaserBlock.module.scss";
import { TeaserItemBlock } from "./TeaserItemBlock";

export const TeaserBlock = withPreview(
    ({ data }: PropsWithData<TeaserBlockData>) => (
        <PageLayout grid>
            <div className={styles.pageLayoutContent}>
                <div className={styles.itemWrapper}>
                    <ListBlock data={data} block={(block) => <TeaserItemBlock data={block} />} />
                </div>
            </div>
        </PageLayout>
    ),
    { label: "Teaser" },
);
