import { clsx } from "clsx";
import {
    type ForwardedRef,
    forwardRef,
    type HTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    type RefAttributes,
    useId,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { BulkActionBar, type BulkActionBarAction, type BulkActionBarLabels } from "../bulkActionBar/BulkActionBar";
import { Checkbox } from "../checkbox/Checkbox";
import { Icon } from "../icon/Icon";
import { Pagination, type PaginationProps } from "../pagination/Pagination";
import styles from "./DataGrid.module.scss";

export interface DataGridColumn<Row> {
    /** Identifies the column, also in `sort`. */
    key: string;
    /** The column title. */
    header: string;
    /**
     * The cell content.
     *
     * @defaultValue `row[key]`
     */
    render?: (row: Row) => ReactNode;
    /**
     * Sorts by this column on a click on its header.
     *
     * @defaultValue `false`
     */
    sortable?: boolean;
    /**
     * `end` for numbers.
     *
     * @defaultValue `"start"`
     */
    align?: "start" | "end";
    /**
     * `low` columns are hidden first when the grid gets narrow.
     *
     * @defaultValue `"high"`
     */
    priority?: "high" | "low";
    /** A fixed width, e.g. `120` or `"30%"`. */
    width?: number | string;
}

export interface DataGridSort {
    /** The `key` of the sorted column. */
    key: string;
    /** `asc` sorts from A to Z and from small to large numbers. */
    direction: "asc" | "desc";
}

/**
 * `surface` sits on its own panel; `plain` has no background, for a grid that already is inside a `Panel` or `Card`.
 */
export type DataGridVariant = "surface" | "plain";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type DataGridOwnerState = {
    variant: DataGridVariant;
    selectable: boolean;
    loading: boolean;
    empty: boolean;
    stickyheader: boolean;
    clickable: boolean;
};

export interface DataGridLabels {
    /** The accessible name of the "select all" checkbox in the header. */
    selectAll: string;
    /** Prefixes a row's first cell as the accessible name of its checkbox, e.g. "Select Frontend Developer". */
    selectRow: string;
    /** The accessible name of the row actions column. */
    actions: string;
}

export const defaultDataGridLabels: DataGridLabels = {
    selectAll: "Select all",
    selectRow: "Select",
    actions: "Actions",
};

export interface DataGridSlotProps {
    /** Props for the `scroller` slot, the scroll container around the table. Give it a height to scroll with a sticky header. */
    scroller?: SlotPropsValue<DataGridOwnerState, "div">;
    /** Props for the `table` slot. */
    table?: SlotPropsValue<DataGridOwnerState, "table">;
    /** Props for the `footer` slot, the row below the table with `footer` and the pagination. */
    footer?: SlotPropsValue<DataGridOwnerState, "div">;
}

export interface DataGridProps<Row> extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The columns, from left to right. */
    columns: DataGridColumn<Row>[];
    /** The rows of the current page, or all rows when paging on the client. */
    rows: Row[];
    /** A stable id per row, used for selection. */
    getRowId: (row: Row) => string;
    /** The accessible name of the table. */
    "aria-label": string;
    /**
     * Shows a checkbox column for multiple selection.
     *
     * @defaultValue `false`
     */
    selectable?: boolean;
    /**
     * The ids of the selected rows; may include rows of other pages.
     *
     * @defaultValue `[]`
     */
    selectedIds?: string[];
    /** Called with the new selection. */
    onSelectionChange?: (ids: string[]) => void;
    /** The active sorting. */
    sort?: DataGridSort;
    /** Called with the new sorting when a sortable header is clicked. */
    onSortChange?: (sort: DataGridSort) => void;
    /** Called on a click on a row, or Enter on a focused row; usually opens the edit view. Makes the rows focusable. */
    onRowClick?: (row: Row) => void;
    /**
     * Actions at the end of a row, shown on hover and focus, e.g. a `Menu` with an `IconButton` trigger. Every action must also
     * be reachable by keyboard.
     */
    rowActions?: (row: Row) => ReactNode;
    /** Actions for the selected rows, shown in a `BulkActionBar` while the selection isn't empty. */
    bulkActions?: BulkActionBarAction[];
    /** Texts of the `BulkActionBar`. */
    bulkActionLabels?: Partial<BulkActionBarLabels>;
    /** Paging below the table. */
    pagination?: PaginationProps;
    /** Content at the start of the footer, e.g. "Sorted by title". */
    footer?: ReactNode;
    /**
     * Shows placeholder rows instead of `rows` and marks the table as busy.
     *
     * @defaultValue `false`
     */
    loading?: boolean;
    /**
     * The number of placeholder rows while loading.
     *
     * @defaultValue `5`
     */
    loadingRowCount?: number;
    /** Shown instead of the rows when there are none, usually an `EmptyState` with a way back, e.g. "Reset filters". */
    emptyState?: ReactNode;
    /**
     * Keeps the header visible while the `scroller` slot scrolls; give the grid or the `scroller` slot a height.
     *
     * @defaultValue `false`
     */
    stickyHeader?: boolean;
    /**
     * `surface` puts the grid on a panel of its own; use `plain` when it already is inside a `Panel` or `Card`.
     *
     * @defaultValue `"surface"`
     */
    variant?: DataGridVariant;
    /** Texts for translation; missing keys fall back to `defaultDataGridLabels`. */
    labels?: Partial<DataGridLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: DataGridSlotProps;
}

function stopPropagation(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
}

function defaultCellContent<Row>(row: Row, key: string): ReactNode {
    const value = (row as Record<string, unknown>)[key];
    return value == null ? null : String(value);
}

function nextSort(sort: DataGridSort | undefined, key: string): DataGridSort {
    if (sort?.key === key) {
        return { key, direction: sort.direction === "asc" ? "desc" : "asc" };
    }
    return { key, direction: "asc" };
}

/**
 * A table with selection, sorting, row actions, and paging.
 */
export const DataGrid = forwardRef(function DataGrid<Row>(
    {
        columns,
        rows,
        getRowId,
        "aria-label": ariaLabel,
        selectable = false,
        selectedIds = [],
        onSelectionChange,
        sort,
        onSortChange,
        onRowClick,
        rowActions,
        bulkActions,
        bulkActionLabels,
        pagination,
        footer,
        loading = false,
        loadingRowCount = 5,
        emptyState,
        stickyHeader = false,
        variant = "surface",
        labels: labelsProp,
        className,
        slotProps,
        onKeyDown,
        ...restProps
    }: DataGridProps<Row>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const labels = { ...defaultDataGridLabels, ...labelsProp };
    const ownerState: DataGridOwnerState = {
        variant,
        selectable,
        loading,
        empty: !loading && rows.length === 0,
        stickyheader: stickyHeader,
        clickable: onRowClick != null,
    };
    const id = useId();
    const selectRowLabelId = `${id}-select-row`;

    const selected = new Set(selectedIds);
    const pageIds = rows.map(getRowId);
    const selectedOnPage = pageIds.filter((rowId) => selected.has(rowId)).length;
    const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;

    const setRowSelected = (rowId: string, isSelected: boolean) => {
        onSelectionChange?.(isSelected ? [...selectedIds, rowId] : selectedIds.filter((selectedId) => selectedId !== rowId));
    };
    const setAllSelected = (isSelected: boolean) => {
        const pageIdSet = new Set(pageIds);
        const others = selectedIds.filter((selectedId) => !pageIdSet.has(selectedId));
        onSelectionChange?.(isSelected ? [...others, ...pageIds] : others);
    };

    const columnCount = columns.length + (selectable ? 1 : 0) + (rowActions != null ? 1 : 0);

    const scrollerProps = resolveSlotProps<DataGridOwnerState, "div", "div">({
        ownProps: { className: styles.scroller },
        slotProps: slotProps?.scroller,
        ownerState,
    });
    const tableProps = resolveSlotProps<DataGridOwnerState, "table", "table">({
        ownProps: { className: styles.table, "aria-label": ariaLabel, "aria-busy": loading || undefined },
        slotProps: slotProps?.table,
        ownerState,
    });
    const footerProps = resolveSlotProps<DataGridOwnerState, "div", "div">({
        ownProps: { className: styles.footer },
        slotProps: slotProps?.footer,
        ownerState,
    });

    const renderBody = () => {
        if (loading) {
            const placeholderIds = Array.from({ length: loadingRowCount }, (_, index) => `placeholder-${index}`);
            return placeholderIds.map((placeholderId) => (
                <tr key={placeholderId} className={styles.row} aria-hidden>
                    {selectable && <td className={styles.checkboxCell} />}
                    {columns.map((column) => (
                        <td key={column.key} className={styles.cell} data-align={column.align ?? "start"} data-priority={column.priority ?? "high"}>
                            <span className={styles.placeholder} />
                        </td>
                    ))}
                    {rowActions != null && <td className={styles.actionsCell} />}
                </tr>
            ));
        }
        if (rows.length === 0) {
            return emptyState != null ? (
                <tr>
                    <td className={styles.emptyCell} colSpan={columnCount}>
                        {emptyState}
                    </td>
                </tr>
            ) : null;
        }
        return rows.map((row, rowIndex) => {
            const rowId = pageIds[rowIndex];
            const isSelected = selected.has(rowId);
            const firstCellId = `${id}-row-${rowIndex}`;
            return (
                <tr
                    key={rowId}
                    className={styles.row}
                    data-selected={isSelected ? "" : undefined}
                    tabIndex={onRowClick != null ? 0 : undefined}
                    onClick={onRowClick != null ? () => onRowClick(row) : undefined}
                    onKeyDown={
                        onRowClick != null
                            ? (event) => {
                                  if (event.key === "Enter" && event.target === event.currentTarget) {
                                      event.preventDefault();
                                      onRowClick(row);
                                  }
                              }
                            : undefined
                    }
                >
                    {selectable && (
                        <td className={styles.checkboxCell} onClick={stopPropagation}>
                            <Checkbox
                                checked={isSelected}
                                onChange={(checked) => setRowSelected(rowId, checked)}
                                slotProps={{ control: { "aria-labelledby": `${selectRowLabelId} ${firstCellId}` } }}
                            />
                        </td>
                    )}
                    {columns.map((column, columnIndex) => (
                        <td
                            key={column.key}
                            id={columnIndex === 0 ? firstCellId : undefined}
                            className={styles.cell}
                            data-align={column.align ?? "start"}
                            data-priority={column.priority ?? "high"}
                        >
                            {column.render != null ? column.render(row) : defaultCellContent(row, column.key)}
                        </td>
                    ))}
                    {rowActions != null && (
                        <td className={styles.actionsCell} onClick={stopPropagation} onKeyDown={stopPropagation}>
                            <div className={styles.actions}>{rowActions(row)}</div>
                        </td>
                    )}
                </tr>
            );
        });
    };

    return (
        <div
            {...restProps}
            ref={ref}
            data-variant={ownerState.variant}
            data-selectable={ownerState.selectable ? "" : undefined}
            data-loading={ownerState.loading ? "" : undefined}
            data-empty={ownerState.empty ? "" : undefined}
            data-stickyheader={ownerState.stickyheader ? "" : undefined}
            data-clickable={ownerState.clickable ? "" : undefined}
            className={clsx(styles.root, className)}
            onKeyDown={(event) => {
                onKeyDown?.(event);
                if (event.key === "Escape" && !event.defaultPrevented && selectable && selectedIds.length > 0) {
                    event.preventDefault();
                    onSelectionChange?.([]);
                }
            }}
        >
            <div {...scrollerProps}>
                <table {...tableProps}>
                    <thead>
                        <tr>
                            {selectable && (
                                <th className={styles.checkboxCell}>
                                    <span id={selectRowLabelId} hidden>
                                        {labels.selectRow}
                                    </span>
                                    <Checkbox
                                        aria-label={labels.selectAll}
                                        checked={allSelected}
                                        indeterminate={selectedOnPage > 0 && !allSelected}
                                        disabled={loading || rows.length === 0}
                                        onChange={setAllSelected}
                                    />
                                </th>
                            )}
                            {columns.map((column) => {
                                const sortDirection = sort?.key === column.key ? sort.direction : undefined;
                                return (
                                    <th
                                        key={column.key}
                                        scope="col"
                                        className={styles.header}
                                        data-align={column.align ?? "start"}
                                        data-priority={column.priority ?? "high"}
                                        aria-sort={sortDirection == null ? undefined : sortDirection === "asc" ? "ascending" : "descending"}
                                        style={column.width != null ? { width: column.width } : undefined}
                                    >
                                        {column.sortable ? (
                                            <button
                                                type="button"
                                                className={styles.sortButton}
                                                onClick={() => onSortChange?.(nextSort(sort, column.key))}
                                            >
                                                {column.header}
                                                <Icon name={sortDirection === "asc" ? "arrow-up" : "arrow-down"} />
                                            </button>
                                        ) : (
                                            column.header
                                        )}
                                    </th>
                                );
                            })}
                            {rowActions != null && (
                                <th className={styles.actionsCell}>
                                    <span className={styles.visuallyHidden}>{labels.actions}</span>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>{renderBody()}</tbody>
                </table>
            </div>
            {(footer != null || pagination != null) && (
                <div {...footerProps}>
                    {footer != null && <div className={styles.footerStart}>{footer}</div>}
                    {pagination != null && <Pagination {...pagination} className={clsx(styles.pagination, pagination.className)} />}
                </div>
            )}
            {selectable && bulkActions != null && (
                <div className={styles.bulkActionBarAnchor}>
                    <BulkActionBar
                        className={styles.bulkActionBar}
                        count={selectedIds.length}
                        actions={bulkActions}
                        onClear={() => onSelectionChange?.([])}
                        labels={bulkActionLabels}
                    />
                </div>
            )}
        </div>
    );
}) as <Row>(props: DataGridProps<Row> & RefAttributes<HTMLDivElement>) => ReactNode;
