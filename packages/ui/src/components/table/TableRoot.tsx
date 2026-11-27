import { clsx } from "clsx";
import {
    type CSSProperties,
    forwardRef,
    type MouseEvent,
    type ReactNode,
    type TableHTMLAttributes,
    useEffect,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

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
    /** Props for the `skipLink` slot, the link before the table that moves focus past it. It shows only while it has focus. */
    skipLink?: SlotPropsValue<TableRootOwnerState, "a">;
    /** Props for the `skipTarget` slot after the table, where the skip link moves focus. Its text is visually hidden. */
    skipTarget?: SlotPropsValue<TableRootOwnerState, "span">;
}

export interface TableRootLabels {
    /** The link before the table that moves focus past it, with the table's name when it has one. */
    skipTable: (tableName?: string) => string;
    /** Read when the skip link moved focus past the table, with the table's name when it has one. */
    tableEnd: (tableName?: string) => string;
}

const defaultLabels: TableRootLabels = {
    skipTable: (tableName) => (tableName != null ? `Skip table ${tableName}` : "Skip table"),
    tableEnd: (tableName) => (tableName != null ? `End of table ${tableName}` : "End of table"),
};

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
    /** Built-in text for assistive technology. */
    labels?: Partial<TableRootLabels>;
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
 * focus. The header row stays in view while the page scrolls. A link before the table, shown while it has focus, moves focus past
 * it.
 */
export const TableRoot = forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(
    { columns, children, toolbar, stickyHeader = true, stickyToolbar = false, labels: labelsProp, className, style, slotProps, ...restProps },
    ref,
) {
    const rootRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    const skipTargetRef = useRef<HTMLSpanElement>(null);
    const skipTargetId = useId();
    const labels = { ...defaultLabels, ...labelsProp };
    useImperativeHandle(ref, () => tableRef.current as HTMLTableElement);
    const overflowing = useOverflowing(scrollerRef, tableRef);
    const hasToolbar = toolbar != null && toolbar !== false;
    const ownerState: TableRootOwnerState = { overflowing, stickyHeader, stickyToolbar: stickyToolbar && hasToolbar };
    useStickyHeader({ rootRef, toolbarRef, tableRef, stickyHeader, stickyToolbar: ownerState.stickyToolbar, overflowing });
    const context = useMemo(() => ({ columns }), [columns]);

    const ariaLabel = restProps["aria-label"];
    const ariaLabelledBy = restProps["aria-labelledby"];
    const [labelledByText, setLabelledByText] = useState<string>();
    // Runs after every render and observes the naming elements, as they may render later than the table or change their text alone
    useLayoutEffect(() => {
        const ownerDocument = rootRef.current?.ownerDocument;
        const elements = (ariaLabelledBy?.split(/\s+/) ?? []).flatMap((id) => ownerDocument?.getElementById(id) ?? []);
        const updateLabelledByText = () => {
            const text = elements
                .map((element) => element.textContent.trim())
                .filter((part) => part !== "")
                .join(" ");
            setLabelledByText(text !== "" ? text : undefined);
        };
        updateLabelledByText();
        if (elements.length === 0 || typeof MutationObserver === "undefined") {
            return;
        }
        const observer = new MutationObserver(updateLabelledByText);
        for (const element of elements) {
            observer.observe(element, { characterData: true, childList: true, subtree: true });
        }
        return () => observer.disconnect();
    });
    const tableName = ariaLabel != null && ariaLabel !== "" ? ariaLabel : labelledByText;

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

    const skipLinkProps = resolveSlotProps<TableRootOwnerState, "a", "a">({
        ownProps: {
            href: `#${skipTargetId}`,
            className: styles.skipLink,
            // Moves focus without changing the address, which a router may take for a navigation
            onClick: (event: MouseEvent<HTMLAnchorElement>) => {
                event.preventDefault();
                skipTargetRef.current?.focus();
            },
        },
        slotProps: slotProps?.skipLink,
        ownerState,
    });
    const skipTargetProps = resolveSlotProps<TableRootOwnerState, "span", "span">({
        ownProps: { id: skipTargetId, tabIndex: -1, className: styles.skipTarget },
        slotProps: slotProps?.skipTarget,
        ownerState,
    });
    const setSkipTargetRef = useMergedRef(skipTargetRef, skipTargetProps.ref);

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
                <a {...skipLinkProps}>{labels.skipTable(tableName)}</a>
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
            <span {...skipTargetProps} ref={setSkipTargetRef}>
                {labels.tableEnd(tableName)}
            </span>
        </div>
    );
});
