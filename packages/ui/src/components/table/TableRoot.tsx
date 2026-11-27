import { clsx } from "clsx";
import { type CSSProperties, forwardRef, type ReactNode, type TableHTMLAttributes, useEffect, useImperativeHandle, useMemo, useRef } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useMergedRef } from "../../utils/useMergedRef";
import { defaultColumnMinWidth, TableContext, type TableLayoutColumn } from "./tableContext";
import styles from "./TableRoot.module.scss";
import { useOverflowing } from "./useOverflowing";
import { useStickyHeader } from "./useStickyHeader";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TableRootOwnerState = {
    /** The table is wider than its container, so it scrolls horizontally. */
    overflowing: boolean;
    /** The header row stays in view while the page scrolls. */
    stickyHeader: boolean;
    /** The toolbar stays in view while the page scrolls; `false` without a toolbar. */
    stickyToolbar: boolean;
};

export interface TableRootSlotProps {
    /** Props for the root, which holds the scrolling area. */
    root?: SlotPropsValue<TableRootOwnerState, "div">;
    /** Props for the `toolbar` slot, the area above the table. */
    toolbar?: SlotPropsValue<TableRootOwnerState, "div">;
    /** Props for the `scrollerFrame` slot, which draws the focus ring of the scrolling area. */
    scrollerFrame?: SlotPropsValue<TableRootOwnerState, "div">;
    /** Props for the `scroller` slot, the area that scrolls the table horizontally. */
    scroller?: SlotPropsValue<TableRootOwnerState, "div">;
    /** Props for the `table` slot. */
    table?: SlotPropsValue<TableRootOwnerState, "table">;
}

export interface TableRootProps extends Omit<TableHTMLAttributes<HTMLTableElement>, "className" | "style" | "children"> {
    /** The columns in their order, with their widths and alignment. The header cells and cells name their column by its `id`. */
    columns: TableLayoutColumn[];
    /** Names the table. The table needs a name, from `aria-label` or `aria-labelledby`. */
    "aria-label"?: string;
    /** The ids of the elements that name the table, e.g. a heading. The table needs a name, from `aria-label` or `aria-labelledby`. */
    "aria-labelledby"?: string;
    /** The `TableHeader` and the `TableBody`. */
    children: ReactNode;
    /** Above the table, e.g. a `FilterBar`. */
    toolbar?: ReactNode;
    /**
     * Keeps the header row in view at the top of the window while the page scrolls past the table, except in windows lower than
     * 30rem. In a scroll container, e.g. the body of a `Drawer`, it stays at the top of the container.
     *
     * @defaultValue `true`
     */
    stickyHeader?: boolean;
    /**
     * Keeps the toolbar in view at the top of the window as well, with the header below it.
     *
     * @defaultValue `false`
     */
    stickyToolbar?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Styles of the root. */
    style?: CSSProperties;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: TableRootSlotProps;
}

function getColumnWidth({ width, minWidth = defaultColumnMinWidth, maxWidth = Infinity }: TableLayoutColumn) {
    return width != null ? Math.min(Math.max(width, minWidth), maxWidth) : undefined;
}

// The columns without a `width` share the remaining space equally, so each gets as wide as the widest minimum among them
function getMinTableWidth(columns: TableLayoutColumn[]) {
    const fixedWidth = columns.reduce((sum, column) => sum + (getColumnWidth(column) ?? 0), 0);
    const autoMinWidths = columns.filter((column) => column.width == null).map((column) => column.minWidth ?? defaultColumnMinWidth);
    return fixedWidth + autoMinWidths.length * Math.max(0, ...autoMinWidths);
}

/**
 * Shows rows of data in columns. When the columns don't fit, the table scrolls horizontally, and its scrolling area takes keyboard
 * focus. The header row stays in view while the page scrolls.
 */
export const TableRoot = forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(
    { columns, children, toolbar, stickyHeader = true, stickyToolbar = false, className, style, slotProps, ...restProps },
    ref,
) {
    const rootRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    useImperativeHandle(ref, () => tableRef.current as HTMLTableElement);
    const overflowing = useOverflowing(scrollerRef, tableRef);
    const hasToolbar = toolbar != null && toolbar !== false;
    const ownerState: TableRootOwnerState = { overflowing, stickyHeader, stickyToolbar: stickyToolbar && hasToolbar };
    useStickyHeader({ rootRef, toolbarRef, tableRef, stickyHeader, stickyToolbar: ownerState.stickyToolbar, overflowing });
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
    const toolbarProps = resolveSlotProps<TableRootOwnerState, "div", "div">({
        ownProps: { className: styles.toolbar },
        slotProps: slotProps?.toolbar,
        ownerState,
    });
    const scrollerFrameProps = resolveSlotProps<TableRootOwnerState, "div", "div">({
        ownProps: { className: styles.scrollerFrame },
        slotProps: slotProps?.scrollerFrame,
        ownerState,
    });
    const scrollerProps = resolveSlotProps<TableRootOwnerState, "div", "div">({
        ownProps: {
            className: styles.scroller,
            // Lets keyboard users scroll a table that holds nothing else to focus
            ...(overflowing && { tabIndex: 0, role: "region", "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy }),
        },
        slotProps: slotProps?.scroller,
        ownerState,
    });
    const tableProps = resolveSlotProps<TableRootOwnerState, "table", "table">({
        ownProps: {
            ...restProps,
            className: styles.table,
            style: {
                [columns.every((column) => column.width != null) ? "--_table-width" : "--_min-table-width"]: `${getMinTableWidth(columns)}px`,
            } as CSSProperties,
        },
        slotProps: slotProps?.table,
        ownerState,
    });

    const setRootRef = useMergedRef(rootRef, rootProps.ref);
    const setToolbarRef = useMergedRef(toolbarRef, toolbarProps.ref);
    const setScrollerRef = useMergedRef(scrollerRef, scrollerProps.ref);
    const setTableRef = useMergedRef(tableRef, tableProps.ref);

    return (
        <div
            {...rootProps}
            ref={setRootRef}
            data-overflowing={overflowing ? "" : undefined}
            data-stickyheader={stickyHeader ? "" : undefined}
            data-stickytoolbar={ownerState.stickyToolbar ? "" : undefined}
        >
            {hasToolbar && (
                <div {...toolbarProps} ref={setToolbarRef}>
                    {toolbar}
                </div>
            )}
            <div {...scrollerFrameProps}>
                <div {...scrollerProps} ref={setScrollerRef}>
                    <table {...tableProps} ref={setTableRef}>
                        <colgroup>
                            {columns.map((column) => {
                                const width = getColumnWidth(column);
                                return <col key={column.id} style={width != null ? { inlineSize: width } : undefined} />;
                            })}
                        </colgroup>
                        <TableContext.Provider value={context}>{children}</TableContext.Provider>
                    </table>
                </div>
            </div>
        </div>
    );
});
