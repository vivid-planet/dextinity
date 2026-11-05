import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { clsx } from "clsx";
import { type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode, type RefAttributes } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./SegmentedControl.module.scss";

type SegmentedControlSize = "default" | "small";

/** One option of `SegmentedControl`. */
export interface SegmentedControlOption<Value extends string = string> {
    /** Identifies the option; `value` and `onChange` use it. */
    value: Value;
    /** The visible text. Leave it out for an icon-only option and set `aria-label` instead. */
    label?: ReactNode;
    /** An icon before the label, or the whole content of an icon-only option. */
    icon?: ReactNode;
    /** The accessible name of an icon-only option, also shown as its tooltip. */
    "aria-label"?: string;
    /** Prevents choosing this option. */
    disabled?: boolean;
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type SegmentedControlOwnerState = {
    size: SegmentedControlSize;
    disabled: boolean;
};

export interface SegmentedControlSlotProps {
    /** Props for the `option` slot, each option's button. */
    option?: SlotPropsValue<SegmentedControlOwnerState, typeof Toggle>;
    /** Props for the `optionIcon` slot. */
    optionIcon?: SlotPropsValue<SegmentedControlOwnerState, "span">;
}

export interface SegmentedControlProps<Value extends string = string> extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "className" | "children" | "onChange" | "defaultValue"
> {
    /** Two to four mutually exclusive options. For more, use a `Select`. */
    options: ReadonlyArray<SegmentedControlOption<Value>>;
    /** The chosen option's value. */
    value: Value;
    /** Called with the newly chosen option's value. */
    onChange: (value: Value) => void;
    /** The accessible name of the group. */
    "aria-label": string;
    /**
     * `small` for toolbars, e.g. a device switch above a preview.
     *
     * @defaultValue `"default"`
     */
    size?: SegmentedControlSize;
    /**
     * Prevents interaction with the whole group.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: SegmentedControlSlotProps;
}

/**
 * Chooses one of two to four mutually exclusive options, e.g. a view or a device.
 */
export const SegmentedControl = forwardRef(function SegmentedControl<Value extends string = string>(
    { options, value, onChange, size = "default", disabled = false, className, slotProps, ...restProps }: SegmentedControlProps<Value>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const ownerState: SegmentedControlOwnerState = { size, disabled };

    const iconProps = resolveSlotProps<SegmentedControlOwnerState, "span", "span">({
        ownProps: { className: styles.optionIcon },
        slotProps: slotProps?.optionIcon,
        ownerState,
    });

    return (
        <ToggleGroup<Value>
            {...restProps}
            ref={ref}
            value={[value]}
            onValueChange={(groupValue) => {
                const [next] = groupValue;
                if (next !== undefined && next !== value) {
                    onChange(next);
                }
            }}
            disabled={ownerState.disabled}
            data-size={ownerState.size}
            className={clsx(styles.root, className)}
        >
            {options.map((option) => {
                const isIconOnly = option.label == null;
                const optionProps = resolveSlotProps<SegmentedControlOwnerState, typeof Toggle, typeof Toggle>({
                    ownProps: {
                        className: styles.option,
                        disabled: option.disabled,
                        "aria-label": option["aria-label"],
                    },
                    slotProps: slotProps?.option,
                    ownerState,
                });
                const toggle = (
                    <Toggle key={option.value} {...optionProps} value={option.value}>
                        {option.icon != null && <span {...iconProps}>{option.icon}</span>}
                        {option.label}
                    </Toggle>
                );
                return isIconOnly && option["aria-label"] != null ? (
                    <Tooltip key={option.value} content={option["aria-label"]}>
                        {toggle}
                    </Tooltip>
                ) : (
                    toggle
                );
            })}
        </ToggleGroup>
    );
}) as <Value extends string = string>(props: SegmentedControlProps<Value> & RefAttributes<HTMLDivElement>) => ReactNode;
