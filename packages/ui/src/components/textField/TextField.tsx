import { clsx } from "clsx";
import { type ChangeEvent, forwardRef, type InputHTMLAttributes } from "react";

import { Field, type FieldBaseProps, type FieldOwnerState, type FieldProps } from "../field/Field";
import styles from "./TextField.module.scss";

type InputType = "text" | "email" | "password" | "number" | "search" | "tel" | "url" | "date";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TextFieldOwnerState = FieldOwnerState & {
    type: InputType;
};

export interface TextFieldProps
    extends
        FieldBaseProps,
        Omit<
            InputHTMLAttributes<HTMLInputElement>,
            "className" | "size" | "prefix" | "value" | "defaultValue" | "onChange" | "type" | "disabled" | "readOnly" | "required"
        > {
    /** Field name. Describes the data, not the UI. */
    name: string;
    /** The value. Fields are always controlled. */
    value: string;
    /** Called on every change; set `value` from it. */
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    /**
     * Controls validation and the on-screen keyboard; `date` shows the browser's date picker and takes the value as `YYYY-MM-DD`.
     *
     * @defaultValue `"text"`
     */
    type?: InputType;
    /**
     * Shows the character count at the label, as `count / maxLength` when `maxLength` is set.
     *
     * @defaultValue `false`
     */
    showCount?: boolean;
    /** Added alongside the component's own classes, on the root. */
    className?: string;
    /** Props for each slot of the field frame, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldProps["slotProps"];
}

/**
 * A complete single-line text field with label, helper text and validation message. For several lines, use `Textarea`; for the
 * bare box to compose yourself, use `Input`. Props not listed are passed to the input element.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
    {
        label,
        required,
        helperText,
        validationMessage,
        state,
        disabled,
        readOnly,
        loading,
        size,
        prefix,
        suffix,
        actions,
        type = "text",
        showCount = false,
        id,
        value,
        maxLength,
        className,
        slotProps,
        "aria-describedby": ariaDescribedBy,
        ...restProps
    },
    ref,
) {
    return (
        <Field
            className={clsx(styles.root, className)}
            data-type={type}
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
            counter={showCount ? (maxLength != null ? `${value.length} / ${maxLength}` : `${value.length}`) : undefined}
            slotProps={slotProps}
        >
            {(control) => (
                <input
                    {...restProps}
                    {...control}
                    ref={ref}
                    type={type}
                    value={value}
                    maxLength={maxLength}
                    aria-describedby={clsx(control["aria-describedby"], ariaDescribedBy) || undefined}
                    className={styles.control}
                />
            )}
        </Field>
    );
});
