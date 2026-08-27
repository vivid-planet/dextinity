import { ListBlock, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { KeyFactsBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";

import { KeyFactItemBlock } from "./KeyFactItemBlock";
import styles from "./KeyFactsBlock.module.scss";

export const KeyFactsBlock = withPreview(
    ({ data }: PropsWithData<KeyFactsBlockData>) => (
        <PageLayout grid>
            <div className={styles.pageLayoutContent}>
                <div className={styles.itemWrapper} style={{ "--list-item-count": data.blocks.length }}>
                    <ListBlock data={data} block={(block) => <KeyFactItemBlock data={block} />} />
                </div>
            </div>
        </PageLayout>
    ),
    { label: "Key facts" },
);
