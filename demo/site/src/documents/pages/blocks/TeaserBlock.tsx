import { ListBlock, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TeaserBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import { AnimateGroup } from "@src/util/animations/AnimateGroup";

import styles from "./TeaserBlock.module.scss";
import { TeaserItemBlock } from "./TeaserItemBlock";

export const TeaserBlock = withPreview(
    ({ data }: PropsWithData<TeaserBlockData>) => (
        <AnimateGroup>
            <PageLayout grid>
                <div className={styles.pageLayoutContent}>
                    <div className={styles.itemWrapper}>
                        <ListBlock
                            data={data}
                            block={(block, index) => (
                                <AnimateBoxInOnScroll direction="left" delay={100 * index}>
                                    <TeaserItemBlock data={block} />
                                </AnimateBoxInOnScroll>
                            )}
                        />
                    </div>
                </div>
            </PageLayout>
        </AnimateGroup>
    ),
    { label: "Teaser" },
);
