import { clsx } from "clsx";
import { forwardRef, Fragment, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./KeyValueList.module.scss";

type KeyValueListLayout = "columns" | "stacked";

export interface KeyValueListItem {
    /** The name of the property, e.g. "Template". Unique within the list. */
    key: string;
    /** The value, e.g. text, a `StatusIndicator`, or a `Link`. */
    value: ReactNode;
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type KeyValueListOwnerState = {
    layout: KeyValueListLayout;
};

export interface KeyValueListSlotProps {
    /** Props for each `key` slot. */
    key?: SlotPropsValue<KeyValueListOwnerState, "dt">;
    /** Props for each `value` slot. */
    value?: SlotPropsValue<KeyValueListOwnerState, "dd">;
}

export interface KeyValueListProps extends Omit<HTMLAttributes<HTMLDListElement>, "className" | "children"> {
    /** The pairs, in reading order. */
    items: readonly KeyValueListItem[];
    /**
     * `columns` puts keys and values side by side, `stacked` puts each key above its value, for narrow panels.
     *
     * @defaultValue `"columns"`
     */
    layout?: KeyValueListLayout;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: KeyValueListSlotProps;
}

/**
 * Properties as pairs, e.g. status, template, and last change of a page.
 */
export const KeyValueList = forwardRef<HTMLDListElement, KeyValueListProps>(function KeyValueList(
    { items, layout = "columns", className, slotProps, ...restProps },
    ref,
) {
    const ownerState: KeyValueListOwnerState = { layout };

    const keyProps = resolveSlotProps<KeyValueListOwnerState, "dt", "dt">({
        ownProps: { className: styles.key },
        slotProps: slotProps?.key,
        ownerState,
    });
    const valueProps = resolveSlotProps<KeyValueListOwnerState, "dd", "dd">({
        ownProps: { className: styles.value },
        slotProps: slotProps?.value,
        ownerState,
    });

    return (
        <dl {...restProps} ref={ref} data-layout={ownerState.layout} className={clsx(styles.root, className)}>
            {items.map((item) => (
                <Fragment key={item.key}>
                    <dt {...keyProps}>{item.key}</dt>
                    <dd {...valueProps}>{item.value}</dd>
                </Fragment>
            ))}
        </dl>
    );
});
