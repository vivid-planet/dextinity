import { createContext, useContext, useEffect } from "react";

/**
 * Horizontal alignment of a column's header and cells.
 */
export type TableColumnAlign = "start" | "center" | "end";

/**
 * The layout of a table column: its width limits and the alignment of its header and cells.
 */
export interface TableLayoutColumn {
    /** Identifies the column; its header cell and cells name it in their `columnId`. */
    id: string;
    /** Width in pixels. Without it, the column shares the space left by the columns that have one. */
    width?: number;
    /**
     * Smallest width in pixels. A column without `width` never gets narrower; the table scrolls horizontally instead.
     *
     * @defaultValue `80`
     */
    minWidth?: number;
    /** Largest width in pixels; a larger `width` is reduced to it. */
    maxWidth?: number;
    /**
     * Horizontal alignment of the header and the cells, e.g. `end` for numbers.
     *
     * @defaultValue `"start"`
     */
    align?: TableColumnAlign;
}

export const defaultColumnMinWidth = 80;

export const TableContext = createContext<{ columns: TableLayoutColumn[] } | null>(null);

/**
 * The layout of the column with `columnId` from the surrounding `TableRoot`.
 */
export function useTableColumn(columnId: string, componentName: string) {
    const context = useContext(TableContext);
    const column = context?.columns.find(({ id }) => id === columnId);

    useEffect(() => {
        if (process.env.NODE_ENV !== "production" && column == null) {
            console.warn(
                context == null
                    ? `${componentName}: place it inside a \`TableRoot\`.`
                    : `${componentName}: no column with the id "${columnId}" in the \`columns\` of the \`TableRoot\`.`,
            );
        }
    }, [column, context, columnId, componentName]);

    return column;
}
