import type { ReactNode } from "react";

import { Checkbox } from "../components/checkbox/Checkbox";
import styles from "./StoryTable.module.scss";

export interface StoryTableColumn<Row> {
    key: string;
    header: string;
    render: (row: Row) => ReactNode;
}

export interface StoryTableProps<Row> {
    "aria-label": string;
    columns: StoryTableColumn<Row>[];
    rows: Row[];
    getRowId: (row: Row) => string;
    /** Names the row in the accessible names of its checkbox, e.g. "Select Frontend developer". */
    getRowLabel: (row: Row) => string;
    selectedIds?: string[];
    /** Shows a checkbox per row and one in the header to select all rows. */
    onSelectionChange?: (selectedIds: string[]) => void;
    /** Makes the whole row clickable, through a button around the first cell's content. */
    onRowClick?: (row: Row) => void;
    rowActions?: (row: Row) => ReactNode;
    /** Shown instead of the rows when there are none. */
    emptyState?: ReactNode;
}

/**
 * A plain table for the stories of page types and patterns that need a list of records.
 */
export function StoryTable<Row>({
    "aria-label": ariaLabel,
    columns,
    rows,
    getRowId,
    getRowLabel,
    selectedIds = [],
    onSelectionChange,
    onRowClick,
    rowActions,
    emptyState,
}: StoryTableProps<Row>) {
    const rowIds = rows.map(getRowId);
    const selectedRowCount = rowIds.filter((id) => selectedIds.includes(id)).length;
    const allSelected = rows.length > 0 && selectedRowCount === rows.length;
    const columnCount = columns.length + (onSelectionChange != null ? 1 : 0) + (rowActions != null ? 1 : 0);

    function toggleRow(id: string, checked: boolean) {
        onSelectionChange?.(checked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id));
    }

    function toggleAll(checked: boolean) {
        const others = selectedIds.filter((id) => !rowIds.includes(id));
        onSelectionChange?.(checked ? [...others, ...rowIds] : others);
    }

    return (
        <div className={styles.root}>
            <table aria-label={ariaLabel} className={styles.table}>
                <thead>
                    <tr>
                        {onSelectionChange != null && (
                            <th scope="col" className={styles.selectCell}>
                                <Checkbox
                                    aria-label="Select all"
                                    checked={allSelected}
                                    indeterminate={selectedRowCount > 0 && !allSelected}
                                    onChange={toggleAll}
                                />
                            </th>
                        )}
                        {columns.map((column) => (
                            <th key={column.key} scope="col">
                                {column.header}
                            </th>
                        ))}
                        {rowActions != null && (
                            <th scope="col" className={styles.actionsCell}>
                                <span className={styles.visuallyHidden}>Actions</span>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={columnCount}>{emptyState}</td>
                        </tr>
                    ) : (
                        rows.map((row) => {
                            const id = getRowId(row);
                            const selected = selectedIds.includes(id);
                            return (
                                <tr key={id} data-selected={selected ? "" : undefined} className={styles.row}>
                                    {onSelectionChange != null && (
                                        <td className={styles.selectCell}>
                                            <Checkbox
                                                aria-label={`Select ${getRowLabel(row)}`}
                                                checked={selected}
                                                onChange={(checked) => toggleRow(id, checked)}
                                            />
                                        </td>
                                    )}
                                    {columns.map((column, index) => (
                                        <td key={column.key}>
                                            {index === 0 && onRowClick != null ? (
                                                <button type="button" className={styles.rowButton} onClick={() => onRowClick(row)}>
                                                    {column.render(row)}
                                                </button>
                                            ) : (
                                                column.render(row)
                                            )}
                                        </td>
                                    ))}
                                    {rowActions != null && <td className={styles.actionsCell}>{rowActions(row)}</td>}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
