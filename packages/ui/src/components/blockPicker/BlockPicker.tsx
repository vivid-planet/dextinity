import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode, useId, useRef } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { FilterChip } from "../filterChip/FilterChip";
import { Icon } from "../icon/Icon";
import styles from "./BlockPicker.module.scss";

/** A block type offered in the `BlockPicker`. */
export interface BlockPickerItem {
    /** Identifies the block type; `onSelect` and `recent` use it. */
    value: string;
    /** The block type's name, e.g. "Teaser grid". */
    label: string;
    /** What the block is for, in a few words, e.g. "Three to six teasers side by side". */
    description?: string;
    /** The block type's icon, e.g. `<Icon name="image" />`. */
    icon?: ReactNode;
    /** The `value` of the category the block type belongs to. */
    category?: string;
    /** Further words the search finds the block type by, e.g. "hero" for "Stage". */
    keywords?: string[];
}

/** A category of block types in the `BlockPicker`. */
export interface BlockPickerCategory {
    /** Identifies the category; `BlockPickerItem.category` refers to it. */
    value: string;
    /** The category's name, e.g. "Media". */
    label: string;
}

export interface BlockPickerLabels {
    /** The accessible name and placeholder of the search field. */
    search: string;
    /** The accessible name of the category filter. */
    categories: string;
    /** The filter chip that shows all categories. */
    all: string;
    /** The heading of the recently used block types. */
    recent: string;
    /** The heading of the block types without a category. */
    other: string;
    /** Shown when no block type matches the search. */
    empty: string;
}

export const defaultBlockPickerLabels: BlockPickerLabels = {
    search: "Search blocks",
    categories: "Categories",
    all: "All",
    recent: "Recently used",
    other: "Other",
    empty: "No block matches your search.",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type BlockPickerOwnerState = {
    /** A search or a category narrows the block types. */
    filtered: boolean;
    empty: boolean;
};

export interface BlockPickerSlotProps {
    /** Props for the `search` slot, the search field. */
    search?: SlotPropsValue<BlockPickerOwnerState, "input">;
    /** Props for the `categories` slot, the row of category filters. */
    categories?: SlotPropsValue<BlockPickerOwnerState, "div">;
    /** Props for the `results` slot, which holds the sections of block types. */
    results?: SlotPropsValue<BlockPickerOwnerState, "div">;
    /** Props for each `item` slot, the button of a block type. */
    item?: SlotPropsValue<BlockPickerOwnerState, "button">;
}

export interface BlockPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onSelect"> {
    /** Shown between the search field and the block types, e.g. a `Checkbox` "Edit after adding" and where the block will be inserted. */
    children?: ReactNode;
    /** The block types that can be added here. */
    items: BlockPickerItem[];
    /** Called with the `value` of the chosen block type. */
    onSelect: (value: string) => void;
    /** The search text. */
    query: string;
    /** Called with the new search text. */
    onQueryChange: (query: string) => void;
    /** The categories, in their order. Without them, the block types show in one list without filters. */
    categories?: BlockPickerCategory[];
    /** The `value` of the category shown, or `null` for all. */
    category?: string | null;
    /** Called with the chosen category, or `null` for all. */
    onCategoryChange?: (category: string | null) => void;
    /** The `value`s of the block types used last, most recent first, shown above the others while nothing is filtered. */
    recent?: string[];
    /** Texts for translation; missing keys fall back to `defaultBlockPickerLabels`. */
    labels?: Partial<BlockPickerLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: BlockPickerSlotProps;
}

interface BlockPickerSection {
    key: string;
    title?: string;
    items: BlockPickerItem[];
}

function matches(item: BlockPickerItem, query: string) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const text = [item.label, item.description, ...(item.keywords ?? [])].join(" ").toLowerCase();
    return words.every((word) => text.includes(word));
}

/**
 * Chooses the type of a new block: search by name, filter by category, or take one of the recently used. Show it in a `Drawer` or
 * `Popover` opened from the add buttons of a `BlockList`. Enter in the search field adds the first match.
 */
export const BlockPicker = forwardRef<HTMLDivElement, BlockPickerProps>(function BlockPicker(
    {
        items,
        onSelect,
        query,
        onQueryChange,
        categories,
        category = null,
        onCategoryChange,
        recent,
        labels: labelsProp,
        className,
        slotProps,
        children,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultBlockPickerLabels, ...labelsProp };
    const resultsRef = useRef<HTMLDivElement>(null);
    const headingId = useId();
    const trimmedQuery = query.trim();
    const filtered = trimmedQuery !== "" || category != null;
    const visibleItems = items.filter((item) => (category == null || item.category === category) && matches(item, trimmedQuery));

    const sections: BlockPickerSection[] = [];
    if (!filtered && recent != null && recent.length > 0) {
        const recentItems = recent.flatMap((value) => items.filter((item) => item.value === value));
        if (recentItems.length > 0) {
            sections.push({ key: "recent", title: labels.recent, items: recentItems });
        }
    }
    if (categories != null && categories.length > 0) {
        for (const { value, label } of categories) {
            const categoryItems = visibleItems.filter((item) => item.category === value);
            if (categoryItems.length > 0) {
                sections.push({ key: `category-${value}`, title: label, items: categoryItems });
            }
        }
        const uncategorized = visibleItems.filter((item) => !categories.some(({ value }) => value === item.category));
        if (uncategorized.length > 0) {
            sections.push({ key: "other", title: labels.other, items: uncategorized });
        }
    } else if (visibleItems.length > 0) {
        sections.push({ key: "all", items: visibleItems });
    }
    // The first one shown, which follows the order of the categories rather than of `items`
    const firstMatch = trimmedQuery !== "" ? sections[0]?.items[0] : undefined;
    const ownerState: BlockPickerOwnerState = { filtered, empty: visibleItems.length === 0 };

    const focusItem = (from: HTMLElement | null, offset: number | "first" | "last") => {
        const buttons = Array.from(resultsRef.current?.querySelectorAll<HTMLButtonElement>("button[data-value]") ?? []);
        if (buttons.length === 0) {
            return;
        }
        const index = from != null ? buttons.indexOf(from as HTMLButtonElement) : -1;
        const nextIndex = offset === "first" ? 0 : offset === "last" ? buttons.length - 1 : Math.min(buttons.length - 1, Math.max(0, index + offset));
        buttons[nextIndex]?.focus();
    };

    const searchProps = resolveSlotProps<BlockPickerOwnerState, "input", "input">({
        ownProps: {
            className: styles.search,
            type: "search",
            value: query,
            placeholder: labels.search,
            "aria-label": labels.search,
            autoComplete: "off",
            onChange: (event) => onQueryChange(event.target.value),
            onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "ArrowDown") {
                    event.preventDefault();
                    focusItem(null, "first");
                } else if (event.key === "Enter" && firstMatch != null) {
                    event.preventDefault();
                    onSelect(firstMatch.value);
                }
            },
        },
        slotProps: slotProps?.search,
        ownerState,
    });
    const categoriesProps = resolveSlotProps<BlockPickerOwnerState, "div", "div">({
        ownProps: { className: styles.categories, role: "group", "aria-label": labels.categories },
        slotProps: slotProps?.categories,
        ownerState,
    });
    const resultsProps = resolveSlotProps<BlockPickerOwnerState, "div", "div">({
        ownProps: {
            className: styles.results,
            onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                const target = event.target as HTMLElement;
                const offsets: Record<string, number | "first" | "last"> = { ArrowDown: 1, ArrowUp: -1, Home: "first", End: "last" };
                const offset = offsets[event.key];
                if (offset != null && target.matches("button[data-value]")) {
                    event.preventDefault();
                    focusItem(target, offset);
                }
            },
        },
        slotProps: slotProps?.results,
        ownerState,
    });

    return (
        <div
            {...restProps}
            ref={ref}
            data-filtered={ownerState.filtered ? "" : undefined}
            data-empty={ownerState.empty ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <div className={styles.searchBox}>
                <Icon name="search" className={styles.searchIcon} />
                <input {...searchProps} />
            </div>
            {children}
            {categories != null && categories.length > 0 && onCategoryChange != null && (
                <div {...categoriesProps}>
                    <FilterChip selected={category == null} onClick={() => onCategoryChange(null)}>
                        {labels.all}
                    </FilterChip>
                    {categories.map(({ value, label }) => (
                        <FilterChip key={value} selected={category === value} onClick={() => onCategoryChange(category === value ? null : value)}>
                            {label}
                        </FilterChip>
                    ))}
                </div>
            )}
            <div {...resultsProps} ref={resultsRef}>
                {sections.map((section, sectionIndex) => (
                    <section
                        key={section.key}
                        className={styles.section}
                        aria-labelledby={section.title != null ? `${headingId}-${sectionIndex}` : undefined}
                    >
                        {section.title != null && (
                            <h3 id={`${headingId}-${sectionIndex}`} className={styles.sectionTitle}>
                                {section.title}
                            </h3>
                        )}
                        <ul className={styles.list}>
                            {section.items.map((item) => {
                                const itemProps = resolveSlotProps<BlockPickerOwnerState, "button", "button">({
                                    ownProps: {
                                        className: styles.item,
                                        type: "button",
                                        onClick: () => onSelect(item.value),
                                    },
                                    slotProps: slotProps?.item,
                                    ownerState,
                                });
                                return (
                                    <li key={item.value}>
                                        <button
                                            {...itemProps}
                                            data-value={item.value}
                                            data-highlighted={item === firstMatch && section.key !== "recent" ? "" : undefined}
                                        >
                                            {item.icon != null && <span className={styles.itemIcon}>{item.icon}</span>}
                                            <span className={styles.itemText}>
                                                <span className={styles.itemLabel}>{item.label}</span>
                                                {item.description != null && <span className={styles.itemDescription}>{item.description}</span>}
                                            </span>
                                            <Icon name="plus" className={styles.itemAddIcon} />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                ))}
                <p className={styles.empty} role="status">
                    {ownerState.empty ? labels.empty : null}
                </p>
            </div>
        </div>
    );
});
