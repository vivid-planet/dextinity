import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import { Menu } from "../menu/Menu";
import { MenuRadioGroup } from "../menu/MenuRadioGroup";
import { MenuRadioItem } from "../menu/MenuRadioItem";
import styles from "./Pagination.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type PaginationOwnerState = {
    page: number;
    pageCount: number;
};

export interface PaginationLabels {
    /** The accessible name of the navigation. */
    navigation: string;
    /** Shown before the page-size picker. */
    pageSize: string;
    /** The visible range of entries, e.g. "1–10 of 47". */
    range: (from: number, to: number, total: number) => string;
    /** The accessible name of the "previous page" button. */
    previous: string;
    /** The accessible name of the "next page" button. */
    next: string;
    /** The accessible name of a page button. */
    page: (page: number) => string;
}

export const defaultPaginationLabels: PaginationLabels = {
    navigation: "Pagination",
    pageSize: "Per page",
    range: (from, to, total) => `${from}–${to} of ${total}`,
    previous: "Previous page",
    next: "Next page",
    page: (page) => `Page ${page}`,
};

export interface PaginationSlotProps {
    /** Props for the `pageSize` slot, the "per page" label and picker. */
    pageSize?: SlotPropsValue<PaginationOwnerState, "div">;
    /** Props for the `range` slot, the visible range of entries. */
    range?: SlotPropsValue<PaginationOwnerState, "span">;
    /** Props for the `pages` slot, the page buttons with previous and next. */
    pages?: SlotPropsValue<PaginationOwnerState, "div">;
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children"> {
    /** The current page, starting at 1. */
    page: number;
    /** Entries per page. */
    pageSize: number;
    /** The number of all entries. */
    total: number;
    /** Called with the new page. */
    onPageChange: (page: number) => void;
    /**
     * Called with the new page size. Shows the "per page" picker; go back to page 1 when it changes, since the current page may no
     * longer exist.
     */
    onPageSizeChange?: (pageSize: number) => void;
    /**
     * The choices of the "per page" picker.
     *
     * @defaultValue `[10, 25, 50, 100]`
     */
    pageSizeOptions?: number[];
    /** Texts for translation; missing keys fall back to `defaultPaginationLabels`. */
    labels?: Partial<PaginationLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: PaginationSlotProps;
}

type PageItem = number | "gap-start" | "gap-end";

function getPageItems(page: number, pageCount: number): PageItem[] {
    const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((item) => item >= 1 && item <= pageCount));
    // Fill a gap of one page instead of showing an ellipsis for it
    if (pages.has(3) && !pages.has(2)) {
        pages.add(2);
    }
    if (pages.has(pageCount - 2) && !pages.has(pageCount - 1)) {
        pages.add(pageCount - 1);
    }
    const sorted = [...pages].sort((a, b) => a - b);
    const items: PageItem[] = [];
    let previous: number | undefined;
    for (const item of sorted) {
        if (previous != null && item - previous > 1) {
            items.push(item < page ? "gap-start" : "gap-end");
        }
        items.push(item);
        previous = item;
    }
    return items;
}

const ellipsis = "…";
const defaultPageSizeOptions = [10, 25, 50, 100];

/**
 * Pages through a long list, with an adjustable number of entries per page.
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
    {
        page,
        pageSize,
        total,
        onPageChange,
        onPageSizeChange,
        pageSizeOptions = defaultPageSizeOptions,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultPaginationLabels, ...labelsProp };
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const ownerState: PaginationOwnerState = { page, pageCount };
    const [pageSizeMenuOpen, setPageSizeMenuOpen] = useState(false);

    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    const pageSizeProps = resolveSlotProps<PaginationOwnerState, "div", "div">({
        ownProps: { className: styles.pageSize },
        slotProps: slotProps?.pageSize,
        ownerState,
    });
    const rangeProps = resolveSlotProps<PaginationOwnerState, "span", "span">({
        ownProps: { className: styles.range },
        slotProps: slotProps?.range,
        ownerState,
    });
    const pagesProps = resolveSlotProps<PaginationOwnerState, "div", "div">({
        ownProps: { className: styles.pages },
        slotProps: slotProps?.pages,
        ownerState,
    });

    return (
        <nav
            {...restProps}
            ref={ref}
            aria-label={restProps["aria-label"] ?? labels.navigation}
            data-page={ownerState.page}
            data-pagecount={ownerState.pageCount}
            className={clsx(styles.root, className)}
        >
            {onPageSizeChange != null && (
                <div {...pageSizeProps}>
                    <span aria-hidden>{labels.pageSize}</span>
                    <Menu
                        open={pageSizeMenuOpen}
                        onOpenChange={setPageSizeMenuOpen}
                        placement="top-start"
                        trigger={
                            <button type="button" className={styles.pageSizeTrigger} aria-label={`${labels.pageSize}: ${pageSize}`}>
                                {pageSize}
                                <Icon name="chevron-down" />
                            </button>
                        }
                    >
                        <MenuRadioGroup value={String(pageSize)} onChange={(value) => onPageSizeChange(Number(value))}>
                            {pageSizeOptions.map((option) => (
                                <MenuRadioItem key={option} value={String(option)} label={String(option)} />
                            ))}
                        </MenuRadioGroup>
                    </Menu>
                </div>
            )}
            <span {...rangeProps}>{labels.range(from, to, total)}</span>
            <div {...pagesProps}>
                <IconButton size="small" aria-label={labels.previous} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                    <Icon name="chevron-left" />
                </IconButton>
                {getPageItems(page, pageCount).map((item) =>
                    typeof item === "number" ? (
                        <button
                            key={item}
                            type="button"
                            className={styles.page}
                            aria-label={labels.page(item)}
                            aria-current={item === page ? "page" : undefined}
                            onClick={item === page ? undefined : () => onPageChange(item)}
                        >
                            {item}
                        </button>
                    ) : (
                        <span key={item} className={styles.gap} aria-hidden>
                            {ellipsis}
                        </span>
                    ),
                )}
                <IconButton size="small" aria-label={labels.next} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
                    <Icon name="chevron-right" />
                </IconButton>
            </div>
        </nav>
    );
});
