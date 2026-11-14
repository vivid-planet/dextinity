import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./ListLayout.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ListLayoutOwnerState = {
    /** Whether the page has a toolbar. */
    toolbar: boolean;
};

export interface ListLayoutSlotProps {
    /** Props for the `header` slot. */
    header?: SlotPropsValue<ListLayoutOwnerState, "div">;
    /** Props for the `toolbar` slot. */
    toolbar?: SlotPropsValue<ListLayoutOwnerState, "div">;
    /** Props for the `content` slot, which holds the list. */
    content?: SlotPropsValue<ListLayoutOwnerState, "div">;
}

export interface ListLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The page header with the scope, the count, and the primary action, e.g. a `PageHeader`. */
    header: ReactNode;
    /** Search and filters above the list, e.g. a `FilterBar`. */
    toolbar?: ReactNode;
    /** The list, e.g. a `DataGrid` with its selection, sorting, row menu, and paging. A row opens the edit page. */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ListLayoutSlotProps;
}

/**
 * The layout of a list page, which shows the structured content of one type as a table: the page header, a toolbar with search and
 * filters, then the list.
 */
export const ListLayout = forwardRef<HTMLDivElement, ListLayoutProps>(function ListLayout(
    { header, toolbar, children, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: ListLayoutOwnerState = { toolbar: toolbar != null };

    const headerProps = resolveSlotProps<ListLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const toolbarProps = resolveSlotProps<ListLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.toolbar },
        slotProps: slotProps?.toolbar,
        ownerState,
    });
    const contentProps = resolveSlotProps<ListLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.content },
        slotProps: slotProps?.content,
        ownerState,
    });

    return (
        <div {...restProps} ref={ref} data-toolbar={ownerState.toolbar ? "" : undefined} className={clsx(styles.root, className)}>
            <div {...headerProps}>{header}</div>
            {toolbar != null && <div {...toolbarProps}>{toolbar}</div>}
            <div {...contentProps}>{children}</div>
        </div>
    );
});
