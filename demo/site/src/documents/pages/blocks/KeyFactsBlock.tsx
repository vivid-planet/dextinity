import { ListBlock, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { KeyFactsBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import { AnimateGroup } from "@src/util/animations/AnimateGroup";

import { KeyFactItemBlock } from "./KeyFactItemBlock";
import styles from "./KeyFactsBlock.module.scss";

export const KeyFactsBlock = withPreview(
    ({ data }: PropsWithData<KeyFactsBlockData>) => (
        <AnimateGroup disabledBreakpoints={["xs", "sm"]}>
            <PageLayout grid>
                <div className={styles.pageLayoutContent}>
                    <div className={styles.itemWrapper} style={{ "--list-item-count": data.blocks.length }}>
                        <ListBlock
                            data={data}
                            block={(block, index) => (
                                <AnimateBoxInOnScroll direction="bottom" delay={200 * index} offset={300}>
                                    <KeyFactItemBlock data={block} />
                                </AnimateBoxInOnScroll>
                            )}
                        />
                    </div>
                </div>
            </PageLayout>
        </AnimateGroup>
    ),
    { label: "Key facts" },
);
