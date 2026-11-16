import { isWithPreviewPropsData, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { AccordionBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";

import styles from "./AccordionBlock.module.scss";
import { AccordionContentBlock } from "./AccordionContentBlock";
import { AccordionItems } from "./AccordionItems";

type AccordionBlockProps = PropsWithData<AccordionBlockData>;

export const AccordionBlock = withPreview(
    ({ data }: AccordionBlockProps) => {
        return (
            <AnimateBoxInOnScroll direction="bottom">
                <div className={styles.root}>
                    <AccordionItems
                        items={data.blocks.map((block) => {
                            const { content, ...itemData } = block.props;

                            return {
                                key: block.key,
                                adminRoute: isWithPreviewPropsData(block) ? block.adminMeta?.route : undefined,
                                data: itemData,
                                content: <AccordionContentBlock data={content} />,
                            };
                        })}
                    />
                </div>
            </AnimateBoxInOnScroll>
        );
    },
    { label: "Accordion" },
);

export const PageContentAccordionBlock = (props: AccordionBlockProps) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <AccordionBlock {...props} />
        </div>
    </PageLayout>
);
