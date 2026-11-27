import { clsx } from "clsx";
import { type CSSProperties, forwardRef, type ReactNode, type TableHTMLAttributes, useEffect, useImperativeHandle, useMemo, useRef } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useMergedRef } from "../../utils/useMergedRef";
import { TableContext, type TableLayoutColumn } from "./tableContext";
import styles from "./TableRoot.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TableRootOwnerState = Record<string, never>;

export interface TableRootSlotProps {
    /** Props for the root, which holds the table. */
    root?: SlotPropsValue<TableRootOwnerState, "div">;
    /** Props for the `table` slot. */
    table?: SlotPropsValue<TableRootOwnerState, "table">;
}

export interface TableRootProps extends Omit<TableHTMLAttributes<HTMLTableElement>, "className" | "style" | "children"> {
    /** The columns in their order, with their alignment. The header cells and cells name their column by its `id`. */
    columns: TableLayoutColumn[];
    /** Names the table. The table needs a name, from `aria-label` or `aria-labelledby`. */
    "aria-label"?: string;
    /** The ids of the elements that name the table, e.g. a heading. The table needs a name, from `aria-label` or `aria-labelledby`. */
    "aria-labelledby"?: string;
    /** The `TableHeader` and the `TableBody`. */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Styles of the root. */
    style?: CSSProperties;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: TableRootSlotProps;
}

/**
 * Shows rows of data in columns.
 */
export const TableRoot = forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(
    { columns, children, className, style, slotProps, ...restProps },
    ref,
) {
    const tableRef = useRef<HTMLTableElement>(null);
    useImperativeHandle(ref, () => tableRef.current as HTMLTableElement);
    const ownerState: TableRootOwnerState = {};
    const context = useMemo(() => ({ columns }), [columns]);

    const ariaLabel = restProps["aria-label"];
    const ariaLabelledBy = restProps["aria-labelledby"];
    useEffect(() => {
        if (process.env.NODE_ENV !== "production" && ariaLabel == null && ariaLabelledBy == null) {
            console.warn("TableRoot: name the table with `aria-label` or `aria-labelledby`.");
        }
    }, [ariaLabel, ariaLabelledBy]);

    const rootProps = resolveSlotProps<TableRootOwnerState, "div", "div">({
        ownProps: { className: clsx(styles.root, className), style },
        slotProps: slotProps?.root,
        ownerState,
    });
    const tableProps = resolveSlotProps<TableRootOwnerState, "table", "table">({
        ownProps: { ...restProps, className: styles.table },
        slotProps: slotProps?.table,
        ownerState,
    });

    const setTableRef = useMergedRef(tableRef, tableProps.ref);

    return (
        <div {...rootProps}>
            <table {...tableProps} ref={setTableRef}>
                <TableContext.Provider value={context}>{children}</TableContext.Provider>
            </table>
        </div>
    );
});
