import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { clsx } from "clsx";
import { type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode, type RefAttributes, useId } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { type ControlAriaProps, useGroupControl } from "../field/ControlFrame";
import styles from "./RadioGroup.module.scss";

type RadioGroupVariant = "default" | "card";
type RadioGroupOrientation = "vertical" | "horizontal";

/** One option of `RadioGroup`. */
export interface RadioGroupOption<Value extends string = string> {
    /** Identifies the option; `value` and `onChange` use it. */
    value: Value;
    /** The visible label. */
    label: ReactNode;
    /** A second line under the label, e.g. what the option does. */
    description?: ReactNode;
    /** Prevents choosing this option. */
    disabled?: boolean;
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type RadioGroupOwnerState = {
    variant: RadioGroupVariant;
    orientation: RadioGroupOrientation;
    invalid: boolean;
    required: boolean;
    disabled: boolean;
    readOnly: boolean;
};

export interface RadioGroupSlotProps {
    /** Props for the `group` slot, the element that holds the options and the group's role. */
    group?: SlotPropsValue<RadioGroupOwnerState, typeof BaseRadioGroup>;
    /** Props for the `option` slot, each option's clickable row or card. */
    option?: SlotPropsValue<RadioGroupOwnerState, "label">;
    /** Props for the `control` slot, each option's circle that holds the radio's role and focus. */
    control?: SlotPropsValue<RadioGroupOwnerState, typeof Radio.Root>;
    /** Props for the `indicator` slot, the dot inside the chosen option's circle. */
    indicator?: SlotPropsValue<RadioGroupOwnerState, typeof Radio.Indicator>;
    /** Props for the `optionLabel` slot. */
    optionLabel?: SlotPropsValue<RadioGroupOwnerState, "span">;
    /** Props for the `optionDescription` slot. */
    optionDescription?: SlotPropsValue<RadioGroupOwnerState, "span">;
}

export interface RadioGroupProps<Value extends string = string>
    extends ControlAriaProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onChange" | "defaultValue" | keyof ControlAriaProps> {
    /** The options, usually two to seven. For a short choice in a toolbar, use `SegmentedControl`; for more options, a `Select`. */
    options: ReadonlyArray<RadioGroupOption<Value>>;
    /** The chosen option's value, `null` while none is chosen. */
    value: Value | null;
    /** Called with the newly chosen option's value. */
    onChange: (value: Value) => void;
    /** Identifies the field when a form is submitted. */
    name?: string;
    /**
     * `card` shows each option as a bordered card, for options with a description that deserve more weight.
     *
     * @defaultValue `"default"`
     */
    variant?: RadioGroupVariant;
    /**
     * Stacks the options or puts them side by side, wrapping when the space runs out.
     *
     * @defaultValue `"vertical"`
     */
    orientation?: RadioGroupOrientation;
    /**
     * Prevents interaction with the whole group. Ignored inside a `Field`, which takes it from its own `disabled`.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Shows the choice without allowing changes. The options stay focusable. Ignored inside a `Field`, which takes it from its own
     * `readOnly`.
     *
     * @defaultValue `false`
     */
    readOnly?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: RadioGroupSlotProps;
}

/**
 * Chooses exactly one of a few mutually exclusive options, all visible at once.
 */
export const RadioGroup = forwardRef(function RadioGroup<Value extends string = string>(
    {
        options,
        value,
        onChange,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
        name,
        variant = "default",
        orientation = "vertical",
        disabled: disabledProp,
        readOnly: readOnlyProp,
        className,
        slotProps,
        ...restProps
    }: RadioGroupProps<Value>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const { control } = useGroupControl({
        disabled: disabledProp,
        readOnly: readOnlyProp,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
    });
    const { disabled, readOnly, required } = control;
    const ownerState: RadioGroupOwnerState = {
        variant,
        orientation,
        invalid: control["aria-invalid"] === true,
        required,
        disabled,
        readOnly,
    };
    const optionIdPrefix = useId();

    const groupProps = resolveSlotProps<RadioGroupOwnerState, typeof BaseRadioGroup, typeof BaseRadioGroup>({
        ownProps: {
            className: styles.group,
            "aria-label": control["aria-label"],
            "aria-labelledby": control["aria-labelledby"],
            "aria-describedby": control["aria-describedby"],
            "aria-invalid": control["aria-invalid"],
        },
        slotProps: slotProps?.group,
        ownerState,
    });

    return (
        <div
            {...restProps}
            ref={ref}
            data-variant={ownerState.variant}
            data-orientation={ownerState.orientation}
            data-invalid={ownerState.invalid ? "" : undefined}
            data-required={ownerState.required ? "" : undefined}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-readonly={ownerState.readOnly ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <BaseRadioGroup<Value | null>
                {...groupProps}
                defaultValue={undefined}
                value={value}
                onValueChange={(next) => {
                    if (next != null && next !== value) {
                        onChange(next);
                    }
                }}
                name={name}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
            >
                {options.map((option, index) => {
                    const labelId = `${optionIdPrefix}${index}label`;
                    const descriptionId = option.description != null ? `${optionIdPrefix}${index}description` : undefined;
                    const optionProps = resolveSlotProps<RadioGroupOwnerState, "label", "label">({
                        ownProps: { className: styles.option },
                        slotProps: slotProps?.option,
                        ownerState,
                    });
                    const controlProps = resolveSlotProps<RadioGroupOwnerState, typeof Radio.Root, typeof Radio.Root>({
                        ownProps: {
                            className: styles.control,
                            value: option.value,
                            disabled: option.disabled,
                            "aria-labelledby": labelId,
                            "aria-describedby": descriptionId,
                        },
                        slotProps: slotProps?.control,
                        ownerState,
                    });
                    const indicatorProps = resolveSlotProps<RadioGroupOwnerState, typeof Radio.Indicator, typeof Radio.Indicator>({
                        ownProps: { className: styles.indicator },
                        slotProps: slotProps?.indicator,
                        ownerState,
                    });
                    const optionLabelProps = resolveSlotProps<RadioGroupOwnerState, "span", "span">({
                        ownProps: { className: styles.optionLabel, id: labelId },
                        slotProps: slotProps?.optionLabel,
                        ownerState,
                    });
                    const optionDescriptionProps = resolveSlotProps<RadioGroupOwnerState, "span", "span">({
                        ownProps: { className: styles.optionDescription, id: descriptionId },
                        slotProps: slotProps?.optionDescription,
                        ownerState,
                    });
                    return (
                        <label key={option.value} {...optionProps} data-disabled={disabled || option.disabled ? "" : undefined}>
                            <Radio.Root {...controlProps} value={option.value}>
                                <Radio.Indicator {...indicatorProps} />
                            </Radio.Root>
                            <span className={styles.text}>
                                <span {...optionLabelProps}>{option.label}</span>
                                {option.description != null && <span {...optionDescriptionProps}>{option.description}</span>}
                            </span>
                        </label>
                    );
                })}
            </BaseRadioGroup>
        </div>
    );
}) as <Value extends string = string>(props: RadioGroupProps<Value> & RefAttributes<HTMLDivElement>) => ReactNode;
