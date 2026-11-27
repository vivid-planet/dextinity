import { clsx } from "clsx";
import { forwardRef, type ReactNode, type TdHTMLAttributes } from "react";

import styles from "./TableCell.module.scss";
import { type TableColumnAlign, useTableColumn } from "./tableContext";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TableCellOwnerState = {
    /** Horizontal alignment, from the column's `align`. */
    align: TableColumnAlign;
};

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "className" | "children"> {
    /** The `id` of the cell's column in the `columns` of the `TableRoot`, which sets the alignment. */
    columnId: string;
    /** The cell's content: text or any component. */
    children?: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * A cell of a `TableRow`, which shows one value of the row's item.
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell({ columnId, children, className, ...restProps }, ref) {
    const column = useTableColumn(columnId, "TableCell");
    const ownerState: TableCellOwnerState = { align: column?.align ?? "start" };

    return (
        <td {...restProps} ref={ref} data-align={ownerState.align} className={clsx(styles.root, className)}>
            {children}
        </td>
    );
});
