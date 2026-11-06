import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./TreeDetailLayout.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TreeDetailLayoutOwnerState = {
    /** Whether the page has a toolbar above the tree. */
    toolbar: boolean;
};

export interface TreeDetailLayoutSlotProps {
    /** Props for the `header` slot. */
    header?: SlotPropsValue<TreeDetailLayoutOwnerState, "div">;
    /** Props for the `body` slot, which holds the tree column and the detail. */
    body?: SlotPropsValue<TreeDetailLayoutOwnerState, "div">;
    /** Props for the `main` slot, the column with the toolbar and the tree. */
    main?: SlotPropsValue<TreeDetailLayoutOwnerState, "div">;
    /** Props for the `toolbar` slot. */
    toolbar?: SlotPropsValue<TreeDetailLayoutOwnerState, "div">;
    /** Props for the `tree` slot. */
    tree?: SlotPropsValue<TreeDetailLayoutOwnerState, "div">;
    /** Props for the `detail` slot. */
    detail?: SlotPropsValue<TreeDetailLayoutOwnerState, "aside">;
}

export interface TreeDetailLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The page header with the scope, the count, and the primary action, e.g. a `PageHeader`. */
    header: ReactNode;
    /** Above the tree: select all, search, status filter, expand and collapse all. */
    toolbar?: ReactNode;
    /** The tree, e.g. a `TreeView`. Selecting a node shows it in the detail; checking nodes is separate from that. */
    children: ReactNode;
    /** The detail of the selected node: path, edit button, published switch, properties. Stays in view while the tree scrolls. */
    detail: ReactNode;
    /** The accessible name of the detail, e.g. the selected page's title. */
    detailLabel?: string;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: TreeDetailLayoutSlotProps;
}

/**
 * The layout of a tree page, e.g. the page tree: the page header, a toolbar, and the tree, with the detail of the selected node next to
 * it. In narrow layouts the detail moves below the tree.
 */
export const TreeDetailLayout = forwardRef<HTMLDivElement, TreeDetailLayoutProps>(function TreeDetailLayout(
    { header, toolbar, children, detail, detailLabel, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: TreeDetailLayoutOwnerState = { toolbar: toolbar != null };

    const headerProps = resolveSlotProps<TreeDetailLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const bodyProps = resolveSlotProps<TreeDetailLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.body },
        slotProps: slotProps?.body,
        ownerState,
    });
    const mainProps = resolveSlotProps<TreeDetailLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.main },
        slotProps: slotProps?.main,
        ownerState,
    });
    const toolbarProps = resolveSlotProps<TreeDetailLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.toolbar },
        slotProps: slotProps?.toolbar,
        ownerState,
    });
    const treeProps = resolveSlotProps<TreeDetailLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.tree },
        slotProps: slotProps?.tree,
        ownerState,
    });
    const detailProps = resolveSlotProps<TreeDetailLayoutOwnerState, "aside", "aside">({
        ownProps: { className: styles.detail, "aria-label": detailLabel },
        slotProps: slotProps?.detail,
        ownerState,
    });

    return (
        <div {...restProps} ref={ref} data-toolbar={ownerState.toolbar ? "" : undefined} className={clsx(styles.root, className)}>
            <div {...headerProps}>{header}</div>
            <div {...bodyProps}>
                <div {...mainProps}>
                    {toolbar != null && <div {...toolbarProps}>{toolbar}</div>}
                    <div {...treeProps}>{children}</div>
                </div>
                <aside {...detailProps}>{detail}</aside>
            </div>
        </div>
    );
});
