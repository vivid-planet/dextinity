import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Checkbox } from "../checkbox/Checkbox";
import styles from "./BlockListHeader.module.scss";

export interface BlockListHeaderLabels {
    /** The accessible name of the checkbox that selects all blocks. */
    selectAll: string;
    /** The number of blocks, shown while none is selected, e.g. "12 blocks". */
    count: (count: number) => string;
    /** The number of selected blocks, e.g. "3 selected". */
    selectedCount: (count: number) => string;
}

export const defaultBlockListHeaderLabels: BlockListHeaderLabels = {
    selectAll: "Select all blocks",
    count: (count) => `${count} ${count === 1 ? "block" : "blocks"}`,
    selectedCount: (count) => `${count} selected`,
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type BlockListHeaderOwnerState = {
    /** Some blocks are selected. */
    selecting: boolean;
};

export interface BlockListHeaderSlotProps {
    /** Props for the `checkbox` slot, which selects all blocks. */
    checkbox?: SlotPropsValue<BlockListHeaderOwnerState, "div">;
    /** Props for the `count` slot, the number of blocks or of selected blocks. */
    count?: SlotPropsValue<BlockListHeaderOwnerState, "span">;
    /** Props for the `actions` slot. */
    actions?: SlotPropsValue<BlockListHeaderOwnerState, "div">;
}

export interface BlockListHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The number of blocks in the list. */
    count: number;
    /** The number of blocks selected with their checkboxes. */
    selectedCount: number;
    /** Called with `true` to select all blocks and with `false` to clear the selection. */
    onSelectAllChange: (selected: boolean) => void;
    /**
     * The bulk actions, e.g. `IconButton`s to show, hide, copy, paste, and delete the selected blocks. Disable the ones that need a
     * selection while nothing is selected.
     */
    actions?: ReactNode;
    /** Texts for translation; missing keys fall back to `defaultBlockListHeaderLabels`. */
    labels?: Partial<BlockListHeaderLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: BlockListHeaderSlotProps;
}

/**
 * The row above a `BlockList` with a checkbox that selects all blocks, their number, and the actions on the selected blocks. Place it in
 * the list's `header`, and give each `Block` `checked` and `onCheckedChange`.
 */
export const BlockListHeader = forwardRef<HTMLDivElement, BlockListHeaderProps>(function BlockListHeader(
    { count, selectedCount, onSelectAllChange, actions, labels: labelsProp, className, slotProps, ...restProps },
    ref,
) {
    const labels = { ...defaultBlockListHeaderLabels, ...labelsProp };
    const ownerState: BlockListHeaderOwnerState = { selecting: selectedCount > 0 };
    const allSelected = count > 0 && selectedCount >= count;

    const checkboxProps = resolveSlotProps<BlockListHeaderOwnerState, "div", "div">({
        ownProps: { className: styles.checkbox },
        slotProps: slotProps?.checkbox,
        ownerState,
    });
    const countProps = resolveSlotProps<BlockListHeaderOwnerState, "span", "span">({
        ownProps: { className: styles.count, role: "status" },
        slotProps: slotProps?.count,
        ownerState,
    });
    const actionsProps = resolveSlotProps<BlockListHeaderOwnerState, "div", "div">({
        ownProps: { className: styles.actions },
        slotProps: slotProps?.actions,
        ownerState,
    });

    return (
        <div {...restProps} ref={ref} data-selecting={ownerState.selecting ? "" : undefined} className={clsx(styles.root, className)}>
            <Checkbox
                {...checkboxProps}
                checked={allSelected}
                indeterminate={ownerState.selecting && !allSelected}
                disabled={count === 0}
                onChange={() => onSelectAllChange(!allSelected)}
                aria-label={labels.selectAll}
            />
            <span {...countProps}>{ownerState.selecting ? labels.selectedCount(selectedCount) : labels.count(count)}</span>
            {actions != null && <div {...actionsProps}>{actions}</div>}
        </div>
    );
});
