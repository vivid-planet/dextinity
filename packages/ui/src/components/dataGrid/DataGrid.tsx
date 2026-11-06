import { clsx } from "clsx";
import {
    type DragEvent,
    type ForwardedRef,
    forwardRef,
    type HTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    type RefAttributes,
    useEffect,
    useId,
    useRef,
    useState,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { BulkActionBar, type BulkActionBarAction, type BulkActionBarLabels } from "../bulkActionBar/BulkActionBar";
import { Checkbox } from "../checkbox/Checkbox";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import { Pagination, type PaginationProps } from "../pagination/Pagination";
import styles from "./DataGrid.module.scss";
import { DataGridCellEditor } from "./DataGridCellEditor";
import { DataGridColumnsMenu } from "./DataGridColumnsMenu";
import { getDataGridCellText, getDataGridCellValue } from "./dataGridValue";

/**
 * The value of a cell as text, number, or boolean, e.g. in an export.
 */
export type DataGridCellValue = string | number | boolean | null;

/**
 * An option of a `select` editor.
 */
export interface DataGridEditorOption {
    /** The value written to the cell. */
    value: string | number;
    /** What the option shows. */
    label: string;
}

/**
 * What a `custom` editor gets to render: the draft value and the callbacks that end editing.
 */
export interface DataGridEditorRenderParams<Row> {
    /** The edited row. */
    row: Row;
    /** The draft value, starting at the cell's value. */
    value: unknown;
    /** The column header, as the editor's accessible name. */
    label: string;
    /** Updates the draft value. */
    onChange: (value: unknown) => void;
    /** Ends editing and saves the value; without an argument, the draft. */
    onCommit: (value?: unknown) => void;
    /** Ends editing and drops the draft. */
    onCancel: () => void;
}

/**
 * The editor of an editable column: `text`, `number`, `select` from options, `checkbox` (switched right in the cell), or a
 * `custom` one, e.g. a rich text field. A `custom` editor gets focus itself; the grid handles Enter, Tab, and Escape that bubble
 * up from it, unless it prevents their default.
 */
export type DataGridEditor<Row> =
    | { type: "text" }
    | { type: "number"; min?: number; max?: number }
    | { type: "select"; options: DataGridEditorOption[] }
    | { type: "checkbox" }
    | { type: "custom"; render: (params: DataGridEditorRenderParams<Row>) => ReactNode };

export interface DataGridColumn<Row> {
    /** Identifies the column, also in `sort`, `columnVisibility`, and cell changes. */
    key: string;
    /** The column title; also the accessible name of its cell editors. */
    header: string;
    /**
     * The cell content.
     *
     * @defaultValue the value, or the option's label for a `select` editor
     */
    render?: (row: Row) => ReactNode;
    /**
     * The cell's value for editing and export.
     *
     * @defaultValue `row[key]`
     */
    getValue?: (row: Row) => unknown;
    /**
     * The row with an edited value, passed to `onRowChange`.
     *
     * @defaultValue `{ ...row, [key]: value }`
     */
    setValue?: (row: Row, value: unknown) => Row;
    /**
     * Makes the cells editable, or only those of the rows it returns `true` for. Enter, F2, typing, or a double click opens the
     * editor; Enter saves and moves down, Tab saves and edits the next cell, Escape discards. The arrow keys move between
     * editable cells.
     *
     * @defaultValue `false`
     */
    editable?: boolean | ((row: Row) => boolean);
    /**
     * The editor of the editable cells.
     *
     * @defaultValue `{ type: "text" }`
     */
    editor?: DataGridEditor<Row>;
    /**
     * Can be hidden in the columns menu.
     *
     * @defaultValue `true`
     */
    hideable?: boolean;
    /** The cell's text in an export, e.g. a formatted date. Defaults to the value, or the option's label for a `select` editor. */
    exportValue?: (row: Row) => DataGridCellValue | undefined;
    /** Actions in the header, shown on hover and focus, e.g. a `Menu` to insert, move, or delete the column. */
    headerActions?: ReactNode;
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

/**
 * An edited cell, passed to `onCellChange` and `onRowChange`.
 */
export interface DataGridCellChange<Row> {
    /** The row before the change. */
    row: Row;
    /** The id of the row. */
    rowId: string;
    /** The `key` of the column. */
    columnKey: string;
    /** The new value. */
    value: unknown;
    /** The value before the change. */
    previousValue: unknown;
}

export interface DataGridSort {
    /** The `key` of the sorted column. */
    key: string;
    /** `asc` sorts from A to Z and from small to large numbers. */
    direction: "asc" | "desc";
}

/**
 * Which columns are shown, by column `key`; a column that is missing is shown.
 */
export type DataGridColumnVisibility = Record<string, boolean>;

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
    editable: boolean;
    reorderable: boolean;
    expandable: boolean;
};

export interface DataGridLabels {
    /** The accessible name of the "select all" checkbox in the header. */
    selectAll: string;
    /** Prefixes a row's first cell as the accessible name of its checkbox, e.g. "Select Frontend Developer". */
    selectRow: string;
    /** The accessible name of the row actions column. */
    actions: string;
    /** Prefixes a row's first cell as the accessible name of its grip, e.g. "Move Frontend Developer". */
    moveRow: string;
    /** Prefixes a row's first cell as the accessible name of its expand button, e.g. "Expand Frontend Developer". */
    expandRow: string;
    /** The accessible name of the button that opens the columns menu. */
    columns: string;
}

export const defaultDataGridLabels: DataGridLabels = {
    selectAll: "Select all",
    selectRow: "Select",
    actions: "Actions",
    moveRow: "Move",
    expandRow: "Expand",
    columns: "Columns",
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
    /** A stable id per row, used for selection, expansion, and editing. */
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
     * The ids of the selected rows; may include rows of other pages. The header checkbox reflects the rows shown.
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
    /** Called with the edited cell when an edit is saved. */
    onCellChange?: (change: DataGridCellChange<Row>) => void;
    /** Called with the row including the edited value (see the column's `setValue`) when an edit is saved. */
    onRowChange?: (row: Row, change: DataGridCellChange<Row>) => void;
    /**
     * Adds a grip to each row: drag it, or focus it and press the arrow keys, Home, or End, to move the row. Called with the row's
     * index in `rows` and its new index. Sub rows stay with their parent.
     */
    onRowReorder?: (fromIndex: number, toIndex: number) => void;
    /** Which columns are shown; a column missing here is shown. */
    columnVisibility?: DataGridColumnVisibility;
    /** Called with the new visibility from the columns menu, which appears at the end of the header when this is set. */
    onColumnVisibilityChange?: (columnVisibility: DataGridColumnVisibility) => void;
    /** The children of a row, shown indented below it while it is expanded. */
    getSubRows?: (row: Row) => Row[] | undefined;
    /** Details of a row, shown below it across all columns while it is expanded. */
    renderRowDetail?: (row: Row) => ReactNode;
    /**
     * Whether a row has details to expand; only used with `renderRowDetail`.
     *
     * @defaultValue every row
     */
    isRowExpandable?: (row: Row) => boolean;
    /**
     * The ids of the expanded rows.
     *
     * @defaultValue `[]`
     */
    expandedRowIds?: string[];
    /**
     * Called with the new expanded rows when a row's expand button is pressed, or on ArrowRight and ArrowLeft while the button or
     * the row has the focus.
     */
    onExpandedRowIdsChange?: (ids: string[]) => void;
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

interface RowEntry<Row> {
    row: Row;
    rowId: string;
    depth: number;
    index: number;
    topLevelIndex: number | undefined;
    hasSubRows: boolean;
    expandable: boolean;
    expanded: boolean;
}

interface CellPosition {
    rowId: string;
    columnKey: string;
}

interface EditingCell extends CellPosition {
    draft: unknown;
}

interface DropTarget {
    index: number;
    position: "before" | "after";
}

type Direction = "up" | "down" | "left" | "right" | "home" | "end";

const cellKeyDirections: Record<string, Direction> = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    Home: "home",
    End: "end",
};

const textEditor: DataGridEditor<unknown> = { type: "text" };

function stopPropagation(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
}

function nextSort(sort: DataGridSort | undefined, key: string): DataGridSort {
    if (sort?.key === key) {
        return { key, direction: sort.direction === "asc" ? "desc" : "asc" };
    }
    return { key, direction: "asc" };
}

function cellKey({ rowId, columnKey }: CellPosition) {
    return `${rowId}\u0000${columnKey}`;
}

function isPrintableKey(event: KeyboardEvent) {
    return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

function isTypingEditor<Row>(editor: DataGridEditor<Row>) {
    return editor.type === "text" || editor.type === "number";
}

function parseDraft<Row>(editor: DataGridEditor<Row>, draft: unknown, previousValue: unknown): { value: unknown } | undefined {
    if (editor.type === "text") {
        const text = draft == null ? "" : String(draft);
        return text === "" && previousValue == null ? { value: previousValue } : { value: text };
    }
    if (editor.type === "number") {
        const text = draft == null ? "" : String(draft).trim().replace(",", ".");
        if (text === "") {
            return { value: null };
        }
        const number = Number(text);
        if (Number.isNaN(number)) {
            return undefined;
        }
        return { value: Math.min(editor.max ?? Infinity, Math.max(editor.min ?? -Infinity, number)) };
    }
    return { value: draft };
}

/**
 * A table with selection, sorting, row actions, and paging; optionally with inline editing, reordering of rows, a columns menu,
 * and expandable rows.
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
        onCellChange,
        onRowChange,
        onRowReorder,
        columnVisibility,
        onColumnVisibilityChange,
        getSubRows,
        renderRowDetail,
        isRowExpandable,
        expandedRowIds = [],
        onExpandedRowIdsChange,
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
        onDragLeave,
        ...restProps
    }: DataGridProps<Row>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const labels = { ...defaultDataGridLabels, ...labelsProp };
    const visibleColumns = columns.filter((column) => columnVisibility?.[column.key] !== false);
    const reorderable = onRowReorder != null;
    const ownerState: DataGridOwnerState = {
        variant,
        selectable,
        loading,
        empty: !loading && rows.length === 0,
        stickyheader: stickyHeader,
        clickable: onRowClick != null,
        editable: visibleColumns.some((column) => column.editable != null && column.editable !== false),
        reorderable,
        expandable: getSubRows != null || renderRowDetail != null,
    };
    const id = useId();
    const selectRowLabelId = `${id}-select-row`;
    const moveRowLabelId = `${id}-move-row`;
    const expandRowLabelId = `${id}-expand-row`;

    const [activeCell, setActiveCell] = useState<CellPosition>();
    const [editing, setEditing] = useState<EditingCell>();
    const editingRef = useRef<EditingCell>(undefined);
    const [pendingFocus, setPendingFocus] = useState<{ key: string }>();
    const cellElements = useRef(new Map<string, HTMLTableCellElement>());
    const [draggedIndex, setDraggedIndex] = useState<number>();
    const [dropTarget, setDropTarget] = useState<DropTarget>();
    const [pendingGripFocus, setPendingGripFocus] = useState<{ index: number }>();
    const gripElements = useRef(new Map<number, HTMLButtonElement>());

    useEffect(() => {
        if (pendingFocus != null) {
            cellElements.current.get(pendingFocus.key)?.focus();
        }
    }, [pendingFocus]);

    useEffect(() => {
        if (pendingGripFocus != null) {
            gripElements.current.get(pendingGripFocus.index)?.focus();
        }
    }, [pendingGripFocus]);

    const expanded = new Set(expandedRowIds);
    const entries: RowEntry<Row>[] = [];
    const addEntries = (levelRows: Row[], depth: number) => {
        levelRows.forEach((row, levelIndex) => {
            const rowId = getRowId(row);
            const subRows = getSubRows?.(row) ?? [];
            const hasSubRows = subRows.length > 0;
            const expandable = hasSubRows || (renderRowDetail != null && (isRowExpandable?.(row) ?? true));
            const isExpanded = expandable && expanded.has(rowId);
            entries.push({
                row,
                rowId,
                depth,
                index: entries.length,
                topLevelIndex: depth === 0 ? levelIndex : undefined,
                hasSubRows,
                expandable,
                expanded: isExpanded,
            });
            if (isExpanded && hasSubRows) {
                addEntries(subRows, depth + 1);
            }
        });
    };
    if (!loading) {
        addEntries(rows, 0);
    }

    const selected = new Set(selectedIds);
    const pageIds = entries.map((entry) => entry.rowId);
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
    const setRowExpanded = (rowId: string, isExpanded: boolean) => {
        onExpandedRowIdsChange?.(isExpanded ? [...expandedRowIds, rowId] : expandedRowIds.filter((expandedId) => expandedId !== rowId));
    };

    const isCellEditable = (entry: RowEntry<Row>, column: DataGridColumn<Row>) =>
        typeof column.editable === "function" ? column.editable(entry.row) : column.editable === true;

    const editableCells: CellPosition[] = [];
    entries.forEach((entry) => {
        visibleColumns.forEach((column) => {
            if (isCellEditable(entry, column)) {
                editableCells.push({ rowId: entry.rowId, columnKey: column.key });
            }
        });
    });
    const activeCellKey = activeCell != null && editableCells.some((cell) => cellKey(cell) === cellKey(activeCell)) ? cellKey(activeCell) : undefined;
    const tabbableCellKey = activeCellKey ?? (editableCells.length > 0 ? cellKey(editableCells[0]) : undefined);

    const findEntry = (rowId: string) => entries.find((entry) => entry.rowId === rowId);
    const findColumn = (columnKey: string) => visibleColumns.find((column) => column.key === columnKey);
    const editorOf = (column: DataGridColumn<Row>) => column.editor ?? (textEditor as DataGridEditor<Row>);

    const focusCell = (cell: CellPosition) => {
        setActiveCell(cell);
        setPendingFocus({ key: cellKey(cell) });
    };

    const writeValue = (entry: RowEntry<Row>, column: DataGridColumn<Row>, value: unknown) => {
        const previousValue = getDataGridCellValue(entry.row, column);
        if (Object.is(value, previousValue)) {
            return;
        }
        const change: DataGridCellChange<Row> = { row: entry.row, rowId: entry.rowId, columnKey: column.key, value, previousValue };
        onCellChange?.(change);
        if (onRowChange != null) {
            onRowChange(column.setValue != null ? column.setValue(entry.row, value) : ({ ...entry.row, [column.key]: value } as Row), change);
        }
    };

    const setEditingCell = (next: EditingCell | undefined) => {
        editingRef.current = next;
        setEditing(next);
    };

    const startEditing = (entry: RowEntry<Row>, column: DataGridColumn<Row>, draft?: string) => {
        setActiveCell({ rowId: entry.rowId, columnKey: column.key });
        if (editorOf(column).type === "checkbox") {
            writeValue(entry, column, getDataGridCellValue(entry.row, column) !== true);
            return;
        }
        setEditingCell({ rowId: entry.rowId, columnKey: column.key, draft: draft ?? getDataGridCellValue(entry.row, column) });
    };

    const isEditingCell = (cell: CellPosition) => editingRef.current != null && cellKey(editingRef.current) === cellKey(cell);

    const commitEditing = (value?: unknown) => {
        const current = editingRef.current;
        if (current == null) {
            return;
        }
        setEditingCell(undefined);
        const entry = findEntry(current.rowId);
        const column = findColumn(current.columnKey);
        if (entry == null || column == null) {
            return;
        }
        const parsed = parseDraft(editorOf(column), value === undefined ? current.draft : value, getDataGridCellValue(entry.row, column));
        if (parsed != null) {
            writeValue(entry, column, parsed.value);
        }
    };

    const cancelEditing = () => {
        const current = editingRef.current;
        if (current != null) {
            setEditingCell(undefined);
            focusCell(current);
        }
    };

    const neighborCell = (cell: CellPosition, direction: Direction): CellPosition | undefined => {
        if (direction === "home" || direction === "end") {
            const rowCells = editableCells.filter((candidate) => candidate.rowId === cell.rowId);
            return direction === "home" ? rowCells[0] : rowCells[rowCells.length - 1];
        }
        const entryIndex = entries.findIndex((entry) => entry.rowId === cell.rowId);
        const columnIndex = visibleColumns.findIndex((column) => column.key === cell.columnKey);
        const vertical = direction === "up" || direction === "down";
        const step = direction === "up" || direction === "left" ? -1 : 1;
        for (
            let rowIndex = entryIndex + (vertical ? step : 0), colIndex = columnIndex + (vertical ? 0 : step);
            rowIndex >= 0 && rowIndex < entries.length && colIndex >= 0 && colIndex < visibleColumns.length;
            rowIndex += vertical ? step : 0, colIndex += vertical ? 0 : step
        ) {
            if (isCellEditable(entries[rowIndex], visibleColumns[colIndex])) {
                return { rowId: entries[rowIndex].rowId, columnKey: visibleColumns[colIndex].key };
            }
        }
        return undefined;
    };

    const handleCellKeyDown = (event: KeyboardEvent<HTMLTableCellElement>, entry: RowEntry<Row>, column: DataGridColumn<Row>) => {
        if (event.target !== event.currentTarget || editingRef.current != null) {
            return;
        }
        const editor = editorOf(column);
        const direction = cellKeyDirections[event.key];
        if (direction != null) {
            event.preventDefault();
            const target = neighborCell({ rowId: entry.rowId, columnKey: column.key }, direction);
            if (target != null) {
                focusCell(target);
            }
        } else if (event.key === "Enter" || event.key === "F2" || (event.key === " " && editor.type === "checkbox")) {
            event.preventDefault();
            event.stopPropagation();
            startEditing(entry, column);
        } else if ((event.key === "Backspace" || event.key === "Delete") && isTypingEditor(editor)) {
            event.preventDefault();
            writeValue(entry, column, editor.type === "text" ? "" : null);
        } else if (isPrintableKey(event) && isTypingEditor(editor)) {
            event.preventDefault();
            startEditing(entry, column, event.key);
        }
    };

    const handleEditorKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        const current = editingRef.current;
        if (current == null || event.defaultPrevented || !event.currentTarget.contains(event.target as Node)) {
            return;
        }
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            cancelEditing();
        } else if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            commitEditing();
            focusCell(neighborCell(current, event.shiftKey ? "up" : "down") ?? current);
        } else if (event.key === "Tab") {
            const index = editableCells.findIndex((cell) => cellKey(cell) === cellKey(current));
            const target = editableCells[index + (event.shiftKey ? -1 : 1)];
            commitEditing();
            if (target != null) {
                event.preventDefault();
                const targetEntry = findEntry(target.rowId);
                const targetColumn = findColumn(target.columnKey);
                if (targetEntry != null && targetColumn != null && editorOf(targetColumn).type !== "checkbox") {
                    startEditing(targetEntry, targetColumn);
                } else {
                    focusCell(target);
                }
            } else {
                setActiveCell(current);
            }
        }
    };

    const moveRow = (fromIndex: number, toIndex: number) => {
        if (onRowReorder == null || toIndex < 0 || toIndex >= rows.length || toIndex === fromIndex) {
            return;
        }
        onRowReorder(fromIndex, toIndex);
        setPendingGripFocus({ index: toIndex });
    };

    const hasTrailingColumn = rowActions != null || onColumnVisibilityChange != null;
    const columnCount = (reorderable ? 1 : 0) + (selectable ? 1 : 0) + visibleColumns.length + (hasTrailingColumn ? 1 : 0);

    const scrollerProps = resolveSlotProps<DataGridOwnerState, "div", "div">({
        ownProps: { className: styles.scroller },
        slotProps: slotProps?.scroller,
        ownerState,
    });
    const tableProps = resolveSlotProps<DataGridOwnerState, "table", "table">({
        ownProps: {
            className: styles.table,
            "aria-label": ariaLabel,
            "aria-busy": loading || undefined,
            role: ownerState.editable ? "grid" : undefined,
        },
        slotProps: slotProps?.table,
        ownerState,
    });
    const footerProps = resolveSlotProps<DataGridOwnerState, "div", "div">({
        ownProps: { className: styles.footer },
        slotProps: slotProps?.footer,
        ownerState,
    });

    const renderCellContent = (entry: RowEntry<Row>, column: DataGridColumn<Row>, editable: boolean, isEditing: boolean) => {
        const editor = editorOf(column);
        const position = { rowId: entry.rowId, columnKey: column.key };
        if (editable && editor.type === "checkbox") {
            return (
                <Checkbox
                    aria-label={column.header}
                    checked={getDataGridCellValue(entry.row, column) === true}
                    onChange={(checked) => {
                        setActiveCell(position);
                        writeValue(entry, column, checked);
                    }}
                    slotProps={{ control: { tabIndex: -1 } }}
                />
            );
        }
        if (isEditing && editing != null) {
            return (
                <DataGridCellEditor
                    editor={editor}
                    row={entry.row}
                    draft={editing.draft}
                    label={column.header}
                    onDraftChange={(draft) => {
                        if (isEditingCell(position)) {
                            setEditingCell({ ...position, draft });
                        }
                    }}
                    onCommit={(value) => {
                        if (isEditingCell(position)) {
                            commitEditing(value);
                            if (!isTypingEditor(editor)) {
                                focusCell(position);
                            }
                        }
                    }}
                    onCancel={() => {
                        if (isEditingCell(position)) {
                            cancelEditing();
                        }
                    }}
                    onKeyDown={handleEditorKeyDown}
                />
            );
        }
        return column.render != null ? column.render(entry.row) : getDataGridCellText(entry.row, column) || null;
    };

    const renderExpandPrefix = (entry: RowEntry<Row>, labelledById: string, detailId: string) => (
        <>
            {entry.depth > 0 && <span className={styles.indent} style={{ inlineSize: `calc(${entry.depth} * var(--dextinity-data-grid-indent))` }} />}
            {entry.expandable ? (
                <button
                    type="button"
                    className={styles.expandButton}
                    aria-expanded={entry.expanded}
                    aria-controls={entry.expanded && !entry.hasSubRows ? detailId : undefined}
                    aria-labelledby={`${expandRowLabelId} ${labelledById}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        setRowExpanded(entry.rowId, !entry.expanded);
                    }}
                    onKeyDown={(event) => {
                        if ((event.key === "ArrowRight" || event.key === "ArrowLeft") && (event.key === "ArrowRight") !== entry.expanded) {
                            event.preventDefault();
                            event.stopPropagation();
                            setRowExpanded(entry.rowId, event.key === "ArrowRight");
                        }
                    }}
                >
                    <Icon name="chevron-right" />
                </button>
            ) : (
                <span className={styles.expandSpacer} />
            )}
        </>
    );

    const renderGrip = (rowId: string, topLevelIndex: number, labelledById: string) => (
        <button
            ref={(element) => {
                if (element != null) {
                    gripElements.current.set(topLevelIndex, element);
                } else if (gripElements.current.get(topLevelIndex)?.isConnected === false) {
                    gripElements.current.delete(topLevelIndex);
                }
            }}
            type="button"
            className={styles.grip}
            aria-labelledby={`${moveRowLabelId} ${labelledById}`}
            aria-keyshortcuts="ArrowUp ArrowDown Home End"
            draggable
            onKeyDown={(event) => {
                const offsets: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 };
                const offset = offsets[event.key];
                if (offset != null || event.key === "Home" || event.key === "End") {
                    event.preventDefault();
                    event.stopPropagation();
                    moveRow(topLevelIndex, offset != null ? topLevelIndex + offset : event.key === "Home" ? 0 : rows.length - 1);
                }
            }}
            onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", rowId);
                const rowElement = event.currentTarget.closest("tr");
                if (rowElement != null) {
                    event.dataTransfer.setDragImage(rowElement, 16, 16);
                }
                setDraggedIndex(topLevelIndex);
            }}
            onDragEnd={() => {
                setDraggedIndex(undefined);
                setDropTarget(undefined);
            }}
        >
            <Icon name="grip" />
        </button>
    );

    const handleRowDragOver = (event: DragEvent<HTMLTableRowElement>, topLevelIndex: number) => {
        if (draggedIndex == null) {
            return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        const rect = event.currentTarget.getBoundingClientRect();
        const position = event.clientY - rect.top < rect.height / 2 ? "before" : "after";
        if (dropTarget?.index !== topLevelIndex || dropTarget.position !== position) {
            setDropTarget({ index: topLevelIndex, position });
        }
    };

    const handleRowDrop = (event: DragEvent<HTMLTableRowElement>) => {
        event.preventDefault();
        if (draggedIndex != null && dropTarget != null) {
            const insertionIndex = dropTarget.index + (dropTarget.position === "after" ? 1 : 0);
            moveRow(draggedIndex, insertionIndex > draggedIndex ? insertionIndex - 1 : insertionIndex);
        }
        setDraggedIndex(undefined);
        setDropTarget(undefined);
    };

    const renderRow = (entry: RowEntry<Row>) => {
        const { row, rowId, topLevelIndex } = entry;
        const isSelected = selected.has(rowId);
        const firstCellId = `${id}-row-${entry.index}`;
        const firstCellTextId = `${firstCellId}-text`;
        const detailId = `${id}-detail-${entry.index}`;
        const dropPosition = topLevelIndex != null && dropTarget?.index === topLevelIndex ? dropTarget.position : undefined;

        const rowElement = (
            <tr
                key={rowId}
                className={styles.row}
                data-selected={isSelected ? "" : undefined}
                data-depth={ownerState.expandable ? entry.depth : undefined}
                data-dragging={draggedIndex != null && draggedIndex === topLevelIndex ? "" : undefined}
                data-drop={dropPosition}
                tabIndex={onRowClick != null ? 0 : undefined}
                onClick={onRowClick != null ? () => onRowClick(row) : undefined}
                onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) {
                        return;
                    }
                    if (event.key === "Enter" && onRowClick != null) {
                        event.preventDefault();
                        onRowClick(row);
                    } else if (
                        (event.key === "ArrowRight" || event.key === "ArrowLeft") &&
                        entry.expandable &&
                        (event.key === "ArrowRight") !== entry.expanded
                    ) {
                        event.preventDefault();
                        setRowExpanded(rowId, event.key === "ArrowRight");
                    }
                }}
                onDragOver={reorderable && topLevelIndex != null ? (event) => handleRowDragOver(event, topLevelIndex) : undefined}
                onDrop={reorderable ? handleRowDrop : undefined}
            >
                {reorderable && (
                    <td className={styles.gripCell} onClick={stopPropagation}>
                        {topLevelIndex != null && renderGrip(rowId, topLevelIndex, firstCellTextId)}
                    </td>
                )}
                {selectable && (
                    <td className={styles.checkboxCell} onClick={stopPropagation}>
                        <Checkbox
                            checked={isSelected}
                            onChange={(checked) => setRowSelected(rowId, checked)}
                            slotProps={{ control: { "aria-labelledby": `${selectRowLabelId} ${firstCellTextId}` } }}
                        />
                    </td>
                )}
                {visibleColumns.map((column, columnIndex) => {
                    const editable = isCellEditable(entry, column);
                    const position = { rowId, columnKey: column.key };
                    const key = cellKey(position);
                    const isEditing = editing != null && cellKey(editing) === key;
                    const editorType = editable ? editorOf(column).type : undefined;
                    const content = renderCellContent(entry, column, editable, isEditing);
                    return (
                        <td
                            key={column.key}
                            id={columnIndex === 0 ? firstCellId : undefined}
                            ref={
                                editable
                                    ? (element) => {
                                          if (element != null) {
                                              cellElements.current.set(key, element);
                                          } else if (cellElements.current.get(key)?.isConnected === false) {
                                              cellElements.current.delete(key);
                                          }
                                      }
                                    : undefined
                            }
                            className={styles.cell}
                            data-align={column.align ?? "start"}
                            data-priority={column.priority ?? "high"}
                            data-editable={editable ? "" : undefined}
                            data-editing={isEditing ? "" : undefined}
                            data-editor={editorType}
                            tabIndex={editable ? (key === tabbableCellKey && !isEditing ? 0 : -1) : undefined}
                            onKeyDown={editable ? (event) => handleCellKeyDown(event, entry, column) : undefined}
                            onClick={editable ? stopPropagation : undefined}
                            onFocus={editable ? () => setActiveCell(position) : undefined}
                            onDoubleClick={editable && !isEditing && editorType !== "checkbox" ? () => startEditing(entry, column) : undefined}
                        >
                            {columnIndex === 0 ? (
                                <span className={styles.cellContent}>
                                    {ownerState.expandable && renderExpandPrefix(entry, firstCellTextId, detailId)}
                                    <span id={firstCellTextId} className={styles.cellText}>
                                        {content}
                                    </span>
                                </span>
                            ) : (
                                content
                            )}
                        </td>
                    );
                })}
                {hasTrailingColumn && (
                    <td className={styles.actionsCell} onClick={stopPropagation} onKeyDown={stopPropagation}>
                        {rowActions != null && <div className={styles.actions}>{rowActions(row)}</div>}
                    </td>
                )}
            </tr>
        );

        if (entry.expanded && !entry.hasSubRows && renderRowDetail != null) {
            return [
                rowElement,
                <tr key={`${rowId}-detail`} id={detailId} className={styles.detailRow}>
                    <td className={styles.detailCell} colSpan={columnCount}>
                        {renderRowDetail(row)}
                    </td>
                </tr>,
            ];
        }
        return rowElement;
    };

    const renderBody = () => {
        if (loading) {
            const placeholderIds = Array.from({ length: loadingRowCount }, (_, index) => `placeholder-${index}`);
            return placeholderIds.map((placeholderId) => (
                <tr key={placeholderId} className={styles.row} aria-hidden>
                    {reorderable && <td className={styles.gripCell} />}
                    {selectable && <td className={styles.checkboxCell} />}
                    {visibleColumns.map((column) => (
                        <td key={column.key} className={styles.cell} data-align={column.align ?? "start"} data-priority={column.priority ?? "high"}>
                            <span className={styles.placeholder} />
                        </td>
                    ))}
                    {hasTrailingColumn && <td className={styles.actionsCell} />}
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
        return entries.map(renderRow);
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
            data-editable={ownerState.editable ? "" : undefined}
            data-reorderable={ownerState.reorderable ? "" : undefined}
            data-expandable={ownerState.expandable ? "" : undefined}
            className={clsx(styles.root, className)}
            onKeyDown={(event) => {
                onKeyDown?.(event);
                if (event.key === "Escape" && !event.defaultPrevented && selectable && selectedIds.length > 0) {
                    event.preventDefault();
                    onSelectionChange?.([]);
                }
            }}
            onDragLeave={(event) => {
                onDragLeave?.(event);
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setDropTarget(undefined);
                }
            }}
        >
            <span id={selectRowLabelId} hidden>
                {labels.selectRow}
            </span>
            <span id={moveRowLabelId} hidden>
                {labels.moveRow}
            </span>
            <span id={expandRowLabelId} hidden>
                {labels.expandRow}
            </span>
            <div {...scrollerProps}>
                <table {...tableProps}>
                    <thead>
                        <tr>
                            {reorderable && <th className={styles.gripCell} aria-hidden />}
                            {selectable && (
                                <th className={styles.checkboxCell}>
                                    <Checkbox
                                        aria-label={labels.selectAll}
                                        checked={allSelected}
                                        indeterminate={selectedOnPage > 0 && !allSelected}
                                        disabled={loading || rows.length === 0}
                                        onChange={setAllSelected}
                                    />
                                </th>
                            )}
                            {visibleColumns.map((column) => {
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
                                        <span className={styles.headerContent}>
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
                                            {column.headerActions != null && <span className={styles.headerActions}>{column.headerActions}</span>}
                                        </span>
                                    </th>
                                );
                            })}
                            {hasTrailingColumn && (
                                <th className={styles.actionsCell}>
                                    {onColumnVisibilityChange != null ? (
                                        <DataGridColumnsMenu
                                            columns={columns}
                                            columnVisibility={columnVisibility ?? {}}
                                            onColumnVisibilityChange={onColumnVisibilityChange}
                                            placement="bottom-end"
                                            trigger={
                                                <IconButton aria-label={labels.columns} size="small" variant="text">
                                                    <Icon name="columns" />
                                                </IconButton>
                                            }
                                        />
                                    ) : (
                                        <span className={styles.visuallyHidden}>{labels.actions}</span>
                                    )}
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
