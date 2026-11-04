import { type ReactNode, useEffect, useState } from "react";

import type { BreadcrumbItem } from "../Stack";
import { BreadcrumbsEntry } from "./BreadcrumbsEntry";
import { BreadcrumbsOverflow } from "./BreadcrumbsOverflow";
import type { StackBreadcrumbsProps } from "./StackBreadcrumbs";

export const getElementOuterWidth = (element: Element): number =>
    element.clientWidth + parseFloat(getComputedStyle(element).marginLeft) + parseFloat(getComputedStyle(element).marginRight);

const NUMBER_OF_ITEMS_BEFORE_OVERFLOW_MENU = 1;

const useNumberOfItemsToBeHidden = (
    items: BreadcrumbItem[],
    containerWidth: number,
    showBackButton: boolean,
    itemWidths: number[] | undefined,
): number | undefined => {
    const [numberOfItemsToBeHidden, setNumberOfItemsToBeHidden] = useState<number | undefined>();

    useEffect(() => {
        let allVisibleItemsFitIntoContainer = false;
        let newNumberOfItemsToBeHidden = 0;

        const minimumNumberOfVisibleItems = 3; // First item, overflow menu & last item
        const maximumNumberOfHiddenItems = items.length - minimumNumberOfVisibleItems + 1;

        while (!allVisibleItemsFitIntoContainer && newNumberOfItemsToBeHidden < maximumNumberOfHiddenItems) {
            let totalWidthOfVisibleItems = 0;

            itemWidths?.forEach((itemWidth, index) => {
                const isOverflowMenu = index === NUMBER_OF_ITEMS_BEFORE_OVERFLOW_MENU;
                const overflowMenuWillBeShown = newNumberOfItemsToBeHidden > 0;
                const linkItemWillBeShown =
                    index === 0 || // Always show first item
                    index === itemWidths.length - 1 || // Alawys show last item
                    index > newNumberOfItemsToBeHidden + minimumNumberOfVisibleItems - 2;

                if ((isOverflowMenu && overflowMenuWillBeShown) || (!isOverflowMenu && linkItemWillBeShown)) {
                    totalWidthOfVisibleItems += itemWidth;
                }
            });

            if (totalWidthOfVisibleItems > containerWidth) {
                newNumberOfItemsToBeHidden++;
            } else {
                allVisibleItemsFitIntoContainer = true;
            }
        }

        setNumberOfItemsToBeHidden(newNumberOfItemsToBeHidden);
    }, [items, itemWidths, containerWidth, showBackButton]);

    return numberOfItemsToBeHidden;
};

export const useItemsToRender = (
    items: BreadcrumbItem[],
    containerWidth: number,
    itemWidths: number[] | undefined,
    overflowLinkText: ReactNode,
    backButtonUrl: string | undefined,
    slotProps: StackBreadcrumbsProps["slotProps"],
): ReactNode[] => {
    const numberOfItemsToBeHidden = useNumberOfItemsToBeHidden(items, containerWidth, Boolean(backButtonUrl), itemWidths);

    if (!items.length) {
        return [];
    }

    const renderAllItemsToAllowCalculatingWidths = !itemWidths?.length;

    const itemsAfterOverflowMenu = renderAllItemsToAllowCalculatingWidths
        ? items.slice(NUMBER_OF_ITEMS_BEFORE_OVERFLOW_MENU)
        : items.slice(NUMBER_OF_ITEMS_BEFORE_OVERFLOW_MENU, items.length);

    const itemsInsideOverflowMenu = renderAllItemsToAllowCalculatingWidths ? [] : itemsAfterOverflowMenu.splice(0, numberOfItemsToBeHidden);

    const showOverflowMenu = Boolean(renderAllItemsToAllowCalculatingWidths || itemsInsideOverflowMenu.length);

    const firstItemWithBackButton = (
        <BreadcrumbsEntry item={items[0]} isLastItem={items.length === 1} backButtonUrl={backButtonUrl} slotProps={slotProps} />
    );
    const overflowMenu = <BreadcrumbsOverflow items={itemsInsideOverflowMenu} linkText={overflowLinkText} slotProps={slotProps} />;
    const remainingItems = itemsAfterOverflowMenu.map((item, index) => (
        <BreadcrumbsEntry key={item.id} item={item} isLastItem={index === itemsAfterOverflowMenu.length - 1} slotProps={slotProps} />
    ));

    return [firstItemWithBackButton, showOverflowMenu && overflowMenu, ...remainingItems].filter((item) => item !== false);
};
