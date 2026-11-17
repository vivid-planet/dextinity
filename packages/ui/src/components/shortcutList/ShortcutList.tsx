import { clsx } from "clsx";
import { forwardRef, Fragment, type TableHTMLAttributes } from "react";

import { keysByContent } from "../../utils/keysByContent";
import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { KeyboardShortcut } from "../keyboardShortcut/KeyboardShortcut";
import styles from "./ShortcutList.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ShortcutListOwnerState = Record<string, never>;

interface ShortcutListItemBase {
    /** What the shortcut does, e.g. "Open the command palette". */
    description: string;
}

interface ShortcutListItemWithShortcut extends ShortcutListItemBase {
    /**
     * The shortcut in the notation of `useKeyboardShortcut`, e.g. `"mod+k"`, shown for the platform as one key cap. Several shortcuts
     * are listed side by side and read as a list, for alternatives, e.g. `["mod+ArrowDown", "mod+o"]` for "Open", or one per part of
     * the description, e.g. `["mod+x", "mod+v"]` for "Cut and paste". The notation has no sequences of keys pressed one after another.
     */
    keyboardShortcut: string | string[];
    keys?: never;
}

interface ShortcutListItemWithKeys extends ShortcutListItemBase {
    /** Fixed key caps for what the notation doesn't cover, e.g. `["⇧", "Click"]` or `["Right-click"]`. */
    keys: string[];
    keyboardShortcut?: never;
}

/**
 * One row of a `ShortcutList`: a shortcut, or fixed key caps, with what it does.
 */
export type ShortcutListItem = ShortcutListItemWithShortcut | ShortcutListItemWithKeys;

function keyboardShortcutsOf(item: ShortcutListItem): string[] {
    if (item.keyboardShortcut == null) {
        return [];
    }
    return typeof item.keyboardShortcut === "string" ? [item.keyboardShortcut] : item.keyboardShortcut;
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
    /** The keyboard shortcuts, in the order they are listed. */
    keyboardShortcuts: ShortcutListItem[];
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
    { keyboardShortcuts, labels: labelsProp, className, slotProps, ...restProps },
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
                {keyboardShortcuts.map((item) => {
                    const itemKeyboardShortcuts = keyboardShortcutsOf(item);
                    const shortcutKeys = keysByContent(itemKeyboardShortcuts);
                    const capKeys = keysByContent(item.keys ?? []);
                    return (
                        <tr key={`${[...itemKeyboardShortcuts, ...(item.keys ?? [])].join(" ")} ${item.description}`}>
                            <td>
                                <span {...keysProps}>
                                    {itemKeyboardShortcuts.map((keyboardShortcut, index) => (
                                        <Fragment key={shortcutKeys[index]}>
                                            {index > 0 && <span className={styles.separator}>{", "}</span>}
                                            <KeyboardShortcut shortcut={keyboardShortcut} />
                                        </Fragment>
                                    ))}
                                    {item.keys?.map((key, index) => (
                                        <KeyboardShortcut key={capKeys[index]}>{key}</KeyboardShortcut>
                                    ))}
                                </span>
                            </td>
                            <td>{item.description}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
});
