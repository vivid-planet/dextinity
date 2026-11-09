import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";

import { Icon } from "../icon/Icon";
import { IconButton, type IconButtonProps } from "../iconButton/IconButton";
import styles from "./TreeViewExpandButtons.module.scss";

export type TreeViewExpandButtonsOwnerState = {
    /** Whether "Expand all" is enabled. */
    expandable: boolean;
    /** Whether "Collapse all" is enabled. */
    collapsible: boolean;
};

export interface TreeViewExpandButtonsLabels {
    /** The accessible name and tooltip of the button that expands every node. */
    expandAll: string;
    /** The accessible name and tooltip of the button that collapses every node. */
    collapseAll: string;
}

const defaultLabels: TreeViewExpandButtonsLabels = {
    expandAll: "Expand all",
    collapseAll: "Collapse all",
};

export interface TreeViewExpandButtonsSlotProps {
    /** Props for the `expandAllButton` slot, an `IconButton`. */
    expandAllButton?: Partial<Omit<IconButtonProps, "children" | "aria-label" | "onClick">>;
    /** Props for the `collapseAllButton` slot, an `IconButton`. */
    collapseAllButton?: Partial<Omit<IconButtonProps, "children" | "aria-label" | "onClick">>;
}

export interface TreeViewExpandButtonsProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** Called when "Expand all" is clicked; usually sets the expanded ids to `getExpandableTreeNodeIds(nodes)`. */
    onExpandAll: () => void;
    /** Called when "Collapse all" is clicked; usually sets the expanded ids to `[]`. */
    onCollapseAll: () => void;
    /**
     * Disables "Expand all", e.g. while every node is expanded.
     *
     * @defaultValue `false`
     */
    expandAllDisabled?: boolean;
    /**
     * Disables "Collapse all", e.g. while every node is collapsed.
     *
     * @defaultValue `false`
     */
    collapseAllDisabled?: boolean;
    /** Texts for translation; English defaults. */
    labels?: Partial<TreeViewExpandButtonsLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: TreeViewExpandButtonsSlotProps;
}

/**
 * The "Expand all" and "Collapse all" buttons of a `TreeView`, e.g. at the end of the toolbar above the page tree.
 */
export const TreeViewExpandButtons = forwardRef<HTMLDivElement, TreeViewExpandButtonsProps>(function TreeViewExpandButtons(
    { onExpandAll, onCollapseAll, expandAllDisabled = false, collapseAllDisabled = false, labels: labelsProp, className, slotProps, ...restProps },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: TreeViewExpandButtonsOwnerState = { expandable: !expandAllDisabled, collapsible: !collapseAllDisabled };

    return (
        <div
            {...restProps}
            ref={ref}
            data-expandable={ownerState.expandable ? "" : undefined}
            data-collapsible={ownerState.collapsible ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <IconButton
                variant="text"
                color="secondary"
                disabled={expandAllDisabled}
                {...slotProps?.expandAllButton}
                className={clsx(styles.expandAllButton, slotProps?.expandAllButton?.className)}
                aria-label={labels.expandAll}
                onClick={onExpandAll}
            >
                <Icon name="chevrons-expand" />
            </IconButton>
            <IconButton
                variant="text"
                color="secondary"
                disabled={collapseAllDisabled}
                {...slotProps?.collapseAllButton}
                className={clsx(styles.collapseAllButton, slotProps?.collapseAllButton?.className)}
                aria-label={labels.collapseAll}
                onClick={onCollapseAll}
            >
                <Icon name="chevrons-collapse" />
            </IconButton>
        </div>
    );
});
