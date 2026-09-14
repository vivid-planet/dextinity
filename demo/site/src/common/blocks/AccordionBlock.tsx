import { isWithPreviewPropsData, type PropsWithData, usePreview, withPreview } from "@dextinity/site-nextjs";
import type { AccordionBlockData } from "@src/blocks.generated";
import { AccordionItemBlock } from "@src/common/blocks/AccordionItemBlock";
import { PageLayout } from "@src/layout/PageLayout";
import { useEffect, useMemo, useState } from "react";

import styles from "./AccordionBlock.module.scss";

type AccordionBlockProps = PropsWithData<AccordionBlockData>;

export const AccordionBlock = withPreview(
    ({ data }: AccordionBlockProps) => {
        const openByDefaultBlockKeys = useMemo(
            () => data.blocks.filter((block) => block.props.openByDefault).map((block) => block.key),
            [data.blocks],
        );

        const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
            // Create a Set containing the keys of blocks where openByDefault is set to true
            return new Set(openByDefaultBlockKeys);
        });

        const { previewType, isSelected, isHovered } = usePreview();

        useEffect(() => {
            if (previewType === "BlockPreview") {
                const getFocusedBlockKey = () => {
                    const focusedBlock = data.blocks.find((block) => {
                        if (!isWithPreviewPropsData(block)) {
                            return false;
                        }

                        const url = block.adminMeta?.route;

                        return url && (isSelected(url, { exactMatch: false }) || isHovered(url, { exactMatch: false }));
                    });

                    return focusedBlock?.key;
                };

                const expandedItemsInPreview = new Set<string>(openByDefaultBlockKeys);
                const focusedBlockKey = getFocusedBlockKey();

                if (focusedBlockKey) {
                    expandedItemsInPreview.add(focusedBlockKey);
                }

                setExpandedItems(expandedItemsInPreview);
            }
        }, [previewType, data.blocks, isSelected, isHovered, openByDefaultBlockKeys]);

        const handleChange = (itemKey: string) => {
            const newExpandedItems = new Set(expandedItems);

            if (newExpandedItems.has(itemKey)) {
                newExpandedItems.delete(itemKey);
            } else {
                newExpandedItems.add(itemKey);
            }

            setExpandedItems(newExpandedItems);
        };

        return (
            <div className={styles.root}>
                {data.blocks.map((block) => (
                    <AccordionItemBlock
                        key={block.key}
                        data={block.props}
                        onChange={() => handleChange(block.key)}
                        isExpanded={expandedItems.has(block.key)}
                    />
                ))}
            </div>
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
