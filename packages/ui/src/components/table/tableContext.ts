import { createContext, useContext, useEffect } from "react";

/**
 * Horizontal alignment of a column's header and cells.
 */
export type TableColumnAlign = "start" | "center" | "end";

/**
 * The layout of a table column: the alignment of its header and cells.
 */
export interface TableLayoutColumn {
    /** Identifies the column; its header cell and cells name it in their `columnId`. */
    id: string;
    /**
     * Horizontal alignment of the header and the cells, e.g. `end` for numbers.
     *
     * @defaultValue `"start"`
     */
    align?: TableColumnAlign;
}

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
