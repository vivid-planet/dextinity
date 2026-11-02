import { type RefObject, useEffect, useState } from "react";

import { getElementOuterWidth } from "../../utils/getElementOuterWidth";
import { useObservedWidth } from "../../utils/useObservedWidth";
import type { Breadcrumb } from "./Breadcrumbs";

type MeasuredWidths = { itemWidths: number[]; ellipsisWidth: number };

type BreadcrumbsOverflow = {
    leadingItem?: Breadcrumb;
    hiddenItems: Breadcrumb[];
    trailingItems: Breadcrumb[];
};

const getOverflow = ({
    items,
    measuredWidths,
    containerWidth,
}: {
    items: Breadcrumb[];
    measuredWidths?: MeasuredWidths;
    containerWidth: number;
}): BreadcrumbsOverflow => {
    const lastIndex = items.length - 1;

    if (lastIndex < 1) {
        return { hiddenItems: [], trailingItems: items };
    }

    const allItemsVisible = { leadingItem: items[0], hiddenItems: [], trailingItems: items.slice(1) };

    if (!measuredWidths || measuredWidths.itemWidths.length !== items.length) {
        return allItemsVisible;
    }

    const { itemWidths, ellipsisWidth } = measuredWidths;

    if (itemWidths.reduce((sum, width) => sum + width, 0) <= containerWidth) {
        return allItemsVisible;
    }

    const isRootVisible = itemWidths[0] + ellipsisWidth + itemWidths[lastIndex] <= containerWidth;
    const firstCollapsibleIndex = isRootVisible ? 1 : 0;
    const availableWidth = containerWidth - ellipsisWidth - (isRootVisible ? itemWidths[0] : 0);

    let usedWidth = itemWidths[lastIndex];
    let firstTrailingIndex = lastIndex;

    for (let index = lastIndex - 1; index >= firstCollapsibleIndex; index--) {
        if (usedWidth + itemWidths[index] > availableWidth) {
            break;
        }
        usedWidth += itemWidths[index];
        firstTrailingIndex = index;
    }

    return {
        leadingItem: isRootVisible ? items[0] : undefined,
        hiddenItems: items.slice(firstCollapsibleIndex, firstTrailingIndex),
        trailingItems: items.slice(firstTrailingIndex),
    };
};

/**
 * Distributes the breadcrumb items over the leading item, the overflow menu and the trailing items, based on the
 * available width.
 *
 * The widths are measured in a hidden layer instead of on the visible items, because the current item shrinks and
 * truncates as soon as the items overflow. Measuring the visible items would report that already-shrunk width and
 * therefore never detect the overflow it is supposed to resolve.
 */
export const useBreadcrumbsOverflow = ({
    items,
    containerRef,
    measureRef,
}: {
    items: Breadcrumb[];
    containerRef: RefObject<HTMLElement | null>;
    measureRef: RefObject<HTMLElement | null>;
}): BreadcrumbsOverflow => {
    const containerWidth = useObservedWidth(containerRef);
    const [measuredWidths, setMeasuredWidths] = useState<MeasuredWidths>();
    const itemsKey = items.map((item) => item.url).join("|");

    useEffect(() => {
        const children = measureRef.current?.children;

        if (!children?.length) {
            setMeasuredWidths(undefined);
            return;
        }

        const widths = Array.from(children).map(getElementOuterWidth);

        setMeasuredWidths({ itemWidths: widths.slice(0, -1), ellipsisWidth: widths[widths.length - 1] });
    }, [itemsKey, measureRef]);

    return getOverflow({ items, measuredWidths, containerWidth });
};
