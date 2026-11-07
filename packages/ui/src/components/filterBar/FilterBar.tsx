import { clsx } from "clsx";
import { type ChangeEvent, forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode, useRef } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { useKeyboardShortcut } from "../keyboardShortcut/useKeyboardShortcut";
import styles from "./FilterBar.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FilterBarOwnerState = {
    searching: boolean;
};

export interface FilterBarLabels {
    /** The accessible name of the search field. */
    search: string;
    /** Placeholder of the search field. */
    searchPlaceholder: string;
    /** The accessible name of the group of filters. */
    filters: string;
    /** The number of results, e.g. "7 results". */
    resultCount: (count: number) => string;
}

const defaultLabels: FilterBarLabels = {
    search: "Search",
    searchPlaceholder: "Search",
    filters: "Filters",
    resultCount: (count) => (count === 1 ? "1 result" : `${count} results`),
};

export interface FilterBarSlotProps {
    /** Props for the `search` slot, the box around the search input. */
    search?: SlotPropsValue<FilterBarOwnerState, "label">;
    /** Props for the `input` slot, the search input. */
    input?: SlotPropsValue<FilterBarOwnerState, "input">;
    /** Props for the `filters` slot, the group around `children`. */
    filters?: SlotPropsValue<FilterBarOwnerState, "div">;
    /** Props for the `count` slot. */
    count?: SlotPropsValue<FilterBarOwnerState, "span">;
    /** Props for the `actions` slot. */
    actions?: SlotPropsValue<FilterBarOwnerState, "div">;
}

export interface FilterBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The search text; filters as it is typed. */
    searchValue: string;
    /** Called with the new search text; with `""` when Escape clears it. */
    onSearchChange: (value: string) => void;
    /** The filters, usually a `FilterChip` per status, a "More filters" menu, and a chip per active filter. */
    children?: ReactNode;
    /** Shows the number of results after the filters, announced to screen readers as it changes. */
    resultCount?: number;
    /** Actions at the end, e.g. "Export". */
    actions?: ReactNode;
    /**
     * The shortcut that moves focus into the search, or `false` for none.
     *
     * @defaultValue `"/"`
     */
    searchShortcut?: string | false;
    /** Texts; English defaults. */
    labels?: Partial<FilterBarLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: FilterBarSlotProps;
}

/**
 * Narrows a list: a search field, filters that apply right away, and the number of results. `/` jumps into the search, Escape
 * clears it.
 */
export const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(function FilterBar(
    { searchValue, onSearchChange, children, resultCount, actions, searchShortcut = "/", labels: labelsProp, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: FilterBarOwnerState = { searching: searchValue !== "" };
    const labels = { ...defaultLabels, ...labelsProp };
    const inputRef = useRef<HTMLInputElement>(null);

    useKeyboardShortcut(searchShortcut === false ? "" : searchShortcut, () => inputRef.current?.focus(), { enabled: searchShortcut !== false });

    const searchProps = resolveSlotProps<FilterBarOwnerState, "label", "label">({
        ownProps: { className: styles.search },
        slotProps: slotProps?.search,
        ownerState,
    });
    const inputProps = resolveSlotProps<FilterBarOwnerState, "input", "input">({
        ownProps: {
            ref: inputRef,
            className: styles.input,
            type: "search",
            autoComplete: "off",
            "aria-label": labels.search,
            placeholder: labels.searchPlaceholder,
            value: searchValue,
            onChange: (event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value),
            onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Escape" && searchValue !== "") {
                    event.preventDefault();
                    onSearchChange("");
                }
            },
        },
        slotProps: slotProps?.input,
        ownerState,
    });
    const filtersProps = resolveSlotProps<FilterBarOwnerState, "div", "div">({
        ownProps: { className: styles.filters, role: "group", "aria-label": labels.filters },
        slotProps: slotProps?.filters,
        ownerState,
    });
    const countProps = resolveSlotProps<FilterBarOwnerState, "span", "span">({
        ownProps: { className: styles.count, role: "status" },
        slotProps: slotProps?.count,
        ownerState,
    });
    const actionsProps = resolveSlotProps<FilterBarOwnerState, "div", "div">({
        ownProps: { className: styles.actions },
        slotProps: slotProps?.actions,
        ownerState,
    });

    return (
        <div role="search" {...restProps} ref={ref} data-searching={ownerState.searching ? "" : undefined} className={clsx(styles.root, className)}>
            <label {...searchProps}>
                <Icon name="search" />
                <input {...inputProps} />
            </label>
            {children != null && <div {...filtersProps}>{children}</div>}
            {resultCount != null && <span {...countProps}>{labels.resultCount(resultCount)}</span>}
            {actions != null && <div {...actionsProps}>{actions}</div>}
        </div>
    );
});
