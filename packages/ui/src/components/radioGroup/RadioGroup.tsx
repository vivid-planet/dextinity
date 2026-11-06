import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { clsx } from "clsx";
import { type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode, type RefAttributes, useId } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import type { FieldState } from "../field/Field";
import { useGroupMessage } from "../field/groupMessage";
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
    state: FieldState;
    required: boolean;
    disabled: boolean;
    readOnly: boolean;
};

export interface RadioGroupSlotProps {
    /** Props for the `label` slot, the group's label above the options. */
    label?: SlotPropsValue<RadioGroupOwnerState, "span">;
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
    /** Props for the `message` slot, the help or validation message below the options. */
    message?: SlotPropsValue<RadioGroupOwnerState, "div">;
}

export interface RadioGroupProps<Value extends string = string> extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "className" | "children" | "onChange" | "defaultValue"
> {
    /** The options, usually two to seven. For a short choice in a toolbar, use `SegmentedControl`; for more options, a `Select`. */
    options: ReadonlyArray<RadioGroupOption<Value>>;
    /** The chosen option's value, `null` while none is chosen. */
    value: Value | null;
    /** Called with the newly chosen option's value. */
    onChange: (value: Value) => void;
    /** Visible label above the options. */
    label?: ReactNode;
    /** The accessible name when there is no visible label. Required without `label`. */
    "aria-label"?: string;
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
     * Requires an option to be chosen before a form is submitted, and adds a star after the label.
     *
     * @defaultValue `false`
     */
    required?: boolean;
    /**
     * Prevents interaction with the whole group.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Shows the choice without allowing changes. The options stay focusable.
     *
     * @defaultValue `false`
     */
    readOnly?: boolean;
    /** Permanent help below the options. */
    helperText?: ReactNode;
    /** Message for the `state`. Replaces the help while the state is `success`, `warning`, or `error`. Say what is missing and how to fix it. */
    validationMessage?: ReactNode;
    /**
     * Validation state, shown by the message color and, for `error`, the circles' line.
     *
     * @defaultValue `"default"`
     */
    state?: FieldState;
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
        label,
        "aria-label": ariaLabel,
        "aria-describedby": ariaDescribedBy,
        name,
        variant = "default",
        orientation = "vertical",
        required = false,
        disabled = false,
        readOnly = false,
        helperText,
        validationMessage,
        state = "default",
        className,
        slotProps,
        ...restProps
    }: RadioGroupProps<Value>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const ownerState: RadioGroupOwnerState = { variant, orientation, state, required, disabled, readOnly };
    const message = useGroupMessage({ state, validationMessage, helperText, ariaDescribedBy });
    const optionIdPrefix = useId();

    const labelProps = resolveSlotProps<RadioGroupOwnerState, "span", "span">({
        ownProps: { className: styles.label, id: message.labelId },
        slotProps: slotProps?.label,
        ownerState,
    });
    const groupProps = resolveSlotProps<RadioGroupOwnerState, typeof BaseRadioGroup, typeof BaseRadioGroup>({
        ownProps: {
            className: styles.group,
            "aria-label": ariaLabel,
            "aria-labelledby": label != null ? message.labelId : undefined,
            "aria-describedby": message["aria-describedby"],
            "aria-invalid": message["aria-invalid"],
        },
        slotProps: slotProps?.group,
        ownerState,
    });
    const messageProps = resolveSlotProps<RadioGroupOwnerState, "div", "div">({
        ownProps: { className: styles.message, id: message.messageId },
        slotProps: slotProps?.message,
        ownerState,
    });

    return (
        <div
            {...restProps}
            ref={ref}
            data-variant={ownerState.variant}
            data-orientation={ownerState.orientation}
            data-state={ownerState.state}
            data-required={ownerState.required ? "" : undefined}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-readonly={ownerState.readOnly ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            {label != null && (
                <div className={styles.labelRow}>
                    <span {...labelProps}>{label}</span>
                    {required && <span className={styles.required} aria-hidden />}
                </div>
            )}
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
            {message.showsMessage && <div {...messageProps}>{message.message}</div>}
        </div>
    );
}) as <Value extends string = string>(props: RadioGroupProps<Value> & RefAttributes<HTMLDivElement>) => ReactNode;
