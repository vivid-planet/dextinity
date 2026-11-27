import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./TableHeader.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TableHeaderOwnerState = Record<string, never>;

export interface TableHeaderSlotProps {
    /** Props for the `row` slot, the row of the header cells. */
    row?: SlotPropsValue<TableHeaderOwnerState, "tr">;
}

export interface TableHeaderProps extends Omit<HTMLAttributes<HTMLTableSectionElement>, "className" | "children"> {
    /** A `TableHeaderCell` for each column. */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: TableHeaderSlotProps;
}

/**
 * The header row of a `TableRoot`, which names the columns.
 */
export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(function TableHeader(
    { children, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: TableHeaderOwnerState = {};
    const rowProps = resolveSlotProps<TableHeaderOwnerState, "tr", "tr">({
        ownProps: { className: styles.row },
        slotProps: slotProps?.row,
        ownerState,
    });

    return (
        <thead {...restProps} ref={ref} className={clsx(styles.root, className)}>
            <tr {...rowProps}>{children}</tr>
        </thead>
    );
});
