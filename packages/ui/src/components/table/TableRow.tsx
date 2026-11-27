import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./TableRow.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TableRowOwnerState = Record<string, never>;

export interface TableRowProps extends Omit<HTMLAttributes<HTMLTableRowElement>, "className" | "children"> {
    /** A `TableCell` for each column. */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * A row of a `TableBody`, which shows one item.
 */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow({ children, className, ...restProps }, ref) {
    return (
        <tr {...restProps} ref={ref} className={clsx(styles.root, className)}>
            {children}
        </tr>
    );
});
