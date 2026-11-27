import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./TableBody.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TableBodyOwnerState = Record<string, never>;

export interface TableBodyProps extends Omit<HTMLAttributes<HTMLTableSectionElement>, "className" | "children"> {
    /** A `TableRow` for each item. */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * The rows of a `TableRoot`, below its `TableHeader`.
 */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody({ children, className, ...restProps }, ref) {
    return (
        <tbody {...restProps} ref={ref} className={clsx(styles.root, className)}>
            {children}
        </tbody>
    );
});
