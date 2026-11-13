import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { forwardRef, type InputHTMLAttributes, useMemo } from "react";

import { ControlFrame, type PureControlProps, useControlState } from "../field/ControlFrame";
import type { FieldOwnerState } from "../field/Field";
import { Icon } from "../icon/Icon";
import styles from "./NumberInput.module.scss";

/**
 * Texts for assistive technology.
 */
export interface NumberInputLabels {
    /**
     * Names the button that increases the value.
     *
     * @defaultValue `"Increase"`
     */
    increment: string;
    /**
     * Names the button that decreases the value.
     *
     * @defaultValue `"Decrease"`
     */
    decrement: string;
    /**
     * What screen readers announce the input as.
     *
     * @defaultValue `"Number field"`
     */
    roleDescription: string;
}

const defaultLabels: NumberInputLabels = { increment: "Increase", decrement: "Decrease", roleDescription: "Number field" };

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type NumberInputOwnerState = FieldOwnerState & {
    steppers: boolean;
};

export interface NumberInputProps
    extends
        PureControlProps,
        Omit<
            InputHTMLAttributes<HTMLInputElement>,
            | keyof PureControlProps
            | "size"
            | "prefix"
            | "value"
            | "defaultValue"
            | "onChange"
            | "type"
            | "disabled"
            | "readOnly"
            | "required"
            | "min"
            | "max"
            | "step"
        > {
    /** Identifies the field when a form is submitted. */
    name?: string;
    /** The value, `null` while the field is empty. Fields are always controlled. */
    value: number | null;
    /** Called with the parsed number, or `null` when the field was cleared; set `value` from it. */
    onChange: (value: number | null) => void;
    /** The smallest allowed value. A lower entry is raised to it when the field loses focus. */
    min?: number;
    /** The largest allowed value. A higher entry is lowered to it when the field loses focus. */
    max?: number;
    /**
     * The amount the arrow keys and step buttons change the value by.
     *
     * @defaultValue `1`
     */
    step?: number;
    /**
     * The amount Page Up, Page Down, and Shift with an arrow key change the value by.
     *
     * @defaultValue `10`
     */
    largeStep?: number;
    /** Shows and rounds the value to exactly this many decimal places, e.g. `2` for prices. */
    decimals?: number;
    /** How the value is shown, e.g. `{ style: "percent" }` or grouping. `decimals` takes precedence for the decimal places. */
    format?: Intl.NumberFormatOptions;
    /**
     * The locale for showing and parsing the value, e.g. the decimal separator.
     *
     * @defaultValue the browser's locale
     */
    locale?: Intl.LocalesArgument;
    /**
     * Shows buttons that increase and decrease the value by `step`.
     *
     * @defaultValue `true`
     */
    steppers?: boolean;
    /** Accessible names of the step buttons and the input's announced role, in English by default. */
    labels?: Partial<NumberInputLabels>;
}

/**
 * A field for a number, e.g. a price, a quantity, or a coordinate, formatted for the locale. Put a unit in `suffix`. Props not listed are
 * passed to the input element.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
    {
        disabled: disabledProp,
        readOnly: readOnlyProp,
        name,
        value,
        onChange,
        min,
        max,
        step = 1,
        largeStep = 10,
        decimals,
        format,
        locale,
        steppers = true,
        labels: labelsProp,
        id,
        className,
        style,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const resolvedFormat = useMemo<Intl.NumberFormatOptions | undefined>(
        () => (decimals != null ? { ...format, minimumFractionDigits: decimals, maximumFractionDigits: decimals } : format),
        [decimals, format],
    );
    const { readOnly } = useControlState(disabledProp, readOnlyProp);
    const showsSteppers = steppers && !readOnly;

    return (
        <ControlFrame
            controlName="NumberInput"
            id={id}
            disabled={disabledProp}
            readOnly={readOnlyProp}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            className={className}
            style={style}
        >
            {({ id: controlId, disabled: controlDisabled, readOnly: controlReadOnly, required: controlRequired, ...control }) => (
                <BaseNumberField.Root
                    className={styles.number}
                    data-steppers={showsSteppers ? "" : undefined}
                    id={controlId}
                    name={name}
                    value={value}
                    onValueChange={(next) => onChange(next)}
                    min={min}
                    max={max}
                    step={step}
                    largeStep={largeStep}
                    format={resolvedFormat}
                    locale={locale}
                    disabled={controlDisabled}
                    readOnly={controlReadOnly}
                    required={controlRequired}
                    allowWheelScrub={false}
                >
                    <BaseNumberField.Input
                        {...restProps}
                        {...control}
                        ref={ref}
                        aria-roledescription={labels.roleDescription}
                        className={styles.control}
                    />
                    {showsSteppers && (
                        <span className={styles.steppers}>
                            <BaseNumberField.Increment className={styles.increment} aria-label={labels.increment}>
                                <Icon name="chevron-down" />
                            </BaseNumberField.Increment>
                            <BaseNumberField.Decrement className={styles.decrement} aria-label={labels.decrement}>
                                <Icon name="chevron-down" />
                            </BaseNumberField.Decrement>
                        </span>
                    )}
                </BaseNumberField.Root>
            )}
        </ControlFrame>
    );
});
