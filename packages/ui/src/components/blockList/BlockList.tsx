import { clsx } from "clsx";
import { Children, type DragEvent, forwardRef, type HTMLAttributes, isValidElement, type KeyboardEvent, type ReactNode, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./BlockList.module.scss";
import { BlockListItemContext, type BlockListItemContextValue } from "./blockListContext";

export interface BlockListLabels {
    /** The button at the end of the list. */
    add: string;
    /** The accessible name of the buttons between blocks. */
    insert: string;
}

const defaultLabels: BlockListLabels = {
    add: "Add block",
    insert: "Insert block here",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type BlockListOwnerState = {
    reorderable: boolean;
    addable: boolean;
};

export interface BlockListSlotProps {
    /** Props for the `insertButton` slot, the button between two blocks. */
    insertButton?: SlotPropsValue<BlockListOwnerState, "button">;
    /** Props for the `addButton` slot, the button at the end of the list. */
    addButton?: SlotPropsValue<BlockListOwnerState, "button">;
}

export interface BlockListProps extends Omit<HTMLAttributes<HTMLUListElement>, "className"> {
    /** The blocks, as `Block` elements in their order. */
    children?: ReactNode;
    /** The accessible name of the list, e.g. "Blocks". */
    "aria-label": string;
    /**
     * Called when a block is moved by dragging its grip or with the arrow keys on it, with its current and its new index. Without it,
     * blocks can't be moved.
     */
    onReorder?: (fromIndex: number, toIndex: number) => void;
    /** Called with the index a new block should go to, from the buttons between blocks and at the end. Without it, there are none. */
    onAdd?: (index: number) => void;
    /** The built-in texts. */
    labels?: Partial<BlockListLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: BlockListSlotProps;
}

interface DropTarget {
    index: number;
    position: "before" | "after";
}

/**
 * The blocks of a page in their order: move them by dragging or with the keyboard, and add new ones between them or at the end.
 */
export const BlockList = forwardRef<HTMLUListElement, BlockListProps>(function BlockList(
    { children, onReorder, onAdd, labels: labelsProp, className, slotProps, ...restProps },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: BlockListOwnerState = { reorderable: onReorder != null, addable: onAdd != null };
    const [draggedIndex, setDraggedIndex] = useState<number>();
    const [dropTarget, setDropTarget] = useState<DropTarget>();
    const [focusGripIndex, setFocusGripIndex] = useState<number>();

    const blocks = Children.toArray(children).filter(isValidElement);
    const count = blocks.length;

    const move = (fromIndex: number, toIndex: number) => {
        if (onReorder == null || toIndex < 0 || toIndex >= count || toIndex === fromIndex) {
            return;
        }
        onReorder(fromIndex, toIndex);
        setFocusGripIndex(toIndex);
    };

    const createItemContext = (index: number): BlockListItemContextValue => ({
        index,
        count,
        reorderable: ownerState.reorderable,
        dropPosition: dropTarget?.index === index ? dropTarget.position : undefined,
        dragging: draggedIndex === index,
        focusGrip: focusGripIndex === index,
        onGripFocused: () => setFocusGripIndex(undefined),
        onGripKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            const offsets: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 };
            const offset = offsets[event.key];
            if (offset != null) {
                event.preventDefault();
                move(index, index + offset);
            } else if (event.key === "Home" || event.key === "End") {
                event.preventDefault();
                move(index, event.key === "Home" ? 0 : count - 1);
            }
        },
        onDragStart: (event: DragEvent<HTMLElement>) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", String(index));
            const item = event.currentTarget.closest("li");
            if (item != null) {
                event.dataTransfer.setDragImage(item, 24, 24);
            }
            setDraggedIndex(index);
        },
        onDragEnd: () => {
            setDraggedIndex(undefined);
            setDropTarget(undefined);
        },
        onDragOver: (event: DragEvent<HTMLElement>) => {
            if (draggedIndex == null) {
                return;
            }
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            const rect = event.currentTarget.getBoundingClientRect();
            const position = event.clientY - rect.top < rect.height / 2 ? "before" : "after";
            if (dropTarget?.index !== index || dropTarget.position !== position) {
                setDropTarget({ index, position });
            }
        },
        onDrop: (event: DragEvent<HTMLElement>) => {
            event.preventDefault();
            if (draggedIndex != null && dropTarget != null) {
                const insertionIndex = dropTarget.index + (dropTarget.position === "after" ? 1 : 0);
                move(draggedIndex, insertionIndex > draggedIndex ? insertionIndex - 1 : insertionIndex);
            }
            setDraggedIndex(undefined);
            setDropTarget(undefined);
        },
    });

    const getInsertButtonProps = (index: number) =>
        resolveSlotProps<BlockListOwnerState, "button", "button">({
            ownProps: { className: styles.insertButton, type: "button", "aria-label": labels.insert, onClick: () => onAdd?.(index) },
            slotProps: slotProps?.insertButton,
            ownerState,
        });
    const addButtonProps = resolveSlotProps<BlockListOwnerState, "button", "button">({
        ownProps: { className: styles.addButton, type: "button", onClick: () => onAdd?.(count) },
        slotProps: slotProps?.addButton,
        ownerState,
    });

    return (
        <ul
            {...restProps}
            ref={ref}
            data-reorderable={ownerState.reorderable ? "" : undefined}
            data-addable={ownerState.addable ? "" : undefined}
            className={clsx(styles.root, className)}
            onDragLeave={(event) => {
                restProps.onDragLeave?.(event);
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setDropTarget(undefined);
                }
            }}
        >
            {blocks.map((block, index) => (
                <BlockListItemContext.Provider key={block.key ?? index} value={createItemContext(index)}>
                    {ownerState.addable && index > 0 && (
                        <li className={styles.insert}>
                            <Tooltip content={labels.insert}>
                                <button {...getInsertButtonProps(index)}>
                                    <Icon name="plus" />
                                </button>
                            </Tooltip>
                        </li>
                    )}
                    {block}
                </BlockListItemContext.Provider>
            ))}
            {ownerState.addable && (
                <li className={styles.add}>
                    <button {...addButtonProps}>
                        <Icon name="plus" />
                        {labels.add}
                    </button>
                </li>
            )}
        </ul>
    );
});
