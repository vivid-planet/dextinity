import { clsx } from "clsx";
import { forwardRef, type TableHTMLAttributes } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Kbd } from "../kbd/Kbd";
import styles from "./ShortcutList.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ShortcutListOwnerState = Record<string, never>;

export interface ShortcutListItem {
    /** The keys pressed, one key cap each, e.g. `["⌘", "K"]`; a sequence lists all of its keys, e.g. `["⌘", "X", "⌘", "V"]`. */
    keys: string[];
    /** What the shortcut does, e.g. "Open the command palette". */
    description: string;
}

export interface ShortcutListLabels {
    /** Header of the key column. */
    keys: string;
    /** Header of the description column. */
    description: string;
}

const defaultLabels: ShortcutListLabels = {
    keys: "Key",
    description: "Action",
};

export interface ShortcutListSlotProps {
    /** Props for the `keys` slot, the key caps of one shortcut. */
    keys?: SlotPropsValue<ShortcutListOwnerState, "span">;
}

export interface ShortcutListProps extends Omit<TableHTMLAttributes<HTMLTableElement>, "className" | "children"> {
    /** The shortcuts, in the order they are listed. */
    shortcuts: ShortcutListItem[];
    /** Column headers; English defaults. */
    labels?: Partial<ShortcutListLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ShortcutListSlotProps;
}

/**
 * Lists keyboard shortcuts with what they do, e.g. on a help page or in a "Keyboard shortcuts" dialog opened with `?`.
 */
export const ShortcutList = forwardRef<HTMLTableElement, ShortcutListProps>(function ShortcutList(
    { shortcuts, labels: labelsProp, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: ShortcutListOwnerState = {};
    const labels = { ...defaultLabels, ...labelsProp };
    const keysProps = resolveSlotProps<ShortcutListOwnerState, "span", "span">({
        ownProps: { className: styles.keys },
        slotProps: slotProps?.keys,
        ownerState,
    });

    return (
        <table {...restProps} ref={ref} className={clsx(styles.root, className)}>
            <thead>
                <tr>
                    <th scope="col">{labels.keys}</th>
                    <th scope="col">{labels.description}</th>
                </tr>
            </thead>
            <tbody>
                {shortcuts.map((shortcut) => (
                    <tr key={`${shortcut.keys.join(" ")} ${shortcut.description}`}>
                        <td>
                            <span {...keysProps}>
                                {shortcut.keys.map((key, index) => (
                                    <Kbd key={index}>{key}</Kbd>
                                ))}
                            </span>
                        </td>
                        <td>{shortcut.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
});
