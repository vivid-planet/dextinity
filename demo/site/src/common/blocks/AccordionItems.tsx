"use client";

import { usePreview } from "@dextinity/site-nextjs";
import type { AccordionItemBlockData } from "@src/blocks.generated";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { AccordionItemBlock } from "./AccordionItemBlock";

export interface AccordionItem {
    key: string;
    adminRoute?: string;
    data: Omit<AccordionItemBlockData, "content">;
    content: ReactNode;
}

export function AccordionItems({ items }: { items: AccordionItem[] }) {
    const openByDefaultItemKeys = useMemo(() => items.filter((item) => item.data.openByDefault).map((item) => item.key), [items]);

    const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set(openByDefaultItemKeys));

    const { previewType, isSelected, isHovered } = usePreview();

    useEffect(() => {
        if (previewType === "BlockPreview") {
            const focusedItem = items.find(
                ({ adminRoute }) => adminRoute && (isSelected(adminRoute, { exactMatch: false }) || isHovered(adminRoute, { exactMatch: false })),
            );

            const expandedItemsInPreview = new Set<string>(openByDefaultItemKeys);

            if (focusedItem) {
                expandedItemsInPreview.add(focusedItem.key);
            }

            setExpandedItems(expandedItemsInPreview);
        }
    }, [previewType, items, isSelected, isHovered, openByDefaultItemKeys]);

    const handleChange = (itemKey: string) => {
        const newExpandedItems = new Set(expandedItems);

        if (newExpandedItems.has(itemKey)) {
            newExpandedItems.delete(itemKey);
        } else {
            newExpandedItems.add(itemKey);
        }

        setExpandedItems(newExpandedItems);
    };

    return items.map((item) => (
        <AccordionItemBlock
            key={item.key}
            data={item.data}
            content={item.content}
            onChange={() => handleChange(item.key)}
            isExpanded={expandedItems.has(item.key)}
        />
    ));
}
