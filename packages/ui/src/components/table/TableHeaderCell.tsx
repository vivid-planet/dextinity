import { clsx } from "clsx";
import { forwardRef, type ReactNode, type ThHTMLAttributes } from "react";

import { type TableColumnAlign, useTableColumn } from "./tableContext";
import styles from "./TableHeaderCell.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TableHeaderCellOwnerState = {
    /** Horizontal alignment, from the column's `align`. */
    align: TableColumnAlign;
};

export interface TableHeaderCellProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "className" | "children"> {
    /** The `id` of the cell's column in the `columns` of the `TableRoot`, which sets the alignment. */
    columnId: string;
    /** The column's name. */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * The header of a column in a `TableHeader`, with the column's name.
 */
export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(function TableHeaderCell(
    { columnId, children, className, ...restProps },
    ref,
) {
    const column = useTableColumn(columnId, "TableHeaderCell");
    const ownerState: TableHeaderCellOwnerState = { align: column?.align ?? "start" };

    return (
        <th scope="col" {...restProps} ref={ref} data-align={ownerState.align} className={clsx(styles.root, className)}>
            {children}
        </th>
    );
});
