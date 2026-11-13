import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { clsx } from "clsx";
import { forwardRef, type InputHTMLAttributes, useMemo } from "react";

import { Field, type FieldBaseProps, type FieldOwnerState, type FieldProps } from "../field/Field";
import { Icon } from "../icon/Icon";
import styles from "./NumberInput.module.scss";

/**
 * Texts for assistive technology.
 */
export interface NumberInputLabels {
    /** @defaultValue `"Increase"` */
    increment: string;
    /** @defaultValue `"Decrease"` */
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
        FieldBaseProps,
        Omit<
            InputHTMLAttributes<HTMLInputElement>,
            | "className"
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
    /** Added alongside the component's own classes, on the root. */
    className?: string;
    /** Props for each slot of the field frame, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldProps["slotProps"];
}

/**
 * A field for a number, e.g. a price, a quantity, or a coordinate, formatted for the locale. Put a unit in `suffix`. Props not listed are
 * passed to the input element.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
    {
        label,
        required = false,
        helperText,
        validationMessage,
        state,
        disabled = false,
        readOnly = false,
        loading,
        size,
        prefix,
        suffix,
        actions,
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
        slotProps,
        "aria-describedby": ariaDescribedBy,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const resolvedFormat = useMemo<Intl.NumberFormatOptions | undefined>(
        () => (decimals != null ? { ...format, minimumFractionDigits: decimals, maximumFractionDigits: decimals } : format),
        [decimals, format],
    );
    const showsSteppers = steppers && !readOnly;

    return (
        <Field
            className={clsx(styles.root, className)}
            data-steppers={showsSteppers ? "" : undefined}
            controlId={id}
            label={label}
            required={required}
            helperText={helperText}
            validationMessage={validationMessage}
            state={state}
            disabled={disabled}
            readOnly={readOnly}
            loading={loading}
            size={size}
            prefix={prefix}
            suffix={suffix}
            actions={actions}
            slotProps={slotProps}
        >
            {({ id: controlId, disabled: controlDisabled, readOnly: controlReadOnly, required: controlRequired, ...control }) => (
                <BaseNumberField.Root
                    className={styles.number}
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
                        aria-describedby={clsx(control["aria-describedby"], ariaDescribedBy) || undefined}
                        className={styles.control}
                    />
                    {showsSteppers && (
                        <span className={styles.steppers}>
                            <BaseNumberField.Increment className={styles.increment} aria-label={labels.increment}>
                                <Icon name="chev-d" />
                            </BaseNumberField.Increment>
                            <BaseNumberField.Decrement className={styles.decrement} aria-label={labels.decrement}>
                                <Icon name="chev-d" />
                            </BaseNumberField.Decrement>
                        </span>
                    )}
                </BaseNumberField.Root>
            )}
        </Field>
    );
});
