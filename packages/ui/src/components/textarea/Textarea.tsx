import { clsx } from "clsx";
import { type ChangeEvent, forwardRef, type TextareaHTMLAttributes, useCallback, useLayoutEffect, useRef } from "react";

import { Field, type FieldBaseProps, type FieldOwnerState, type FieldProps } from "../field/Field";
import styles from "./Textarea.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TextareaOwnerState = FieldOwnerState & {
    autoResize: boolean;
};

export interface TextareaProps
    extends
        FieldBaseProps,
        Omit<
            TextareaHTMLAttributes<HTMLTextAreaElement>,
            "className" | "prefix" | "value" | "defaultValue" | "onChange" | "disabled" | "readOnly" | "required" | "rows"
        > {
    /** Field name. Describes the data, not the UI. */
    name: string;
    /** The value. Fields are always controlled. */
    value: string;
    /** Called on every change; set `value` from it. */
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    /**
     * Visible lines at the start.
     *
     * @defaultValue `3`
     */
    rows?: number;
    /**
     * Grows with the content up to `maxRows`. Without it, the user can resize the field.
     *
     * @defaultValue `true`
     */
    autoResize?: boolean;
    /**
     * Upper limit for growing; beyond it, the content scrolls.
     *
     * @defaultValue `12`
     */
    maxRows?: number;
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

function fitHeight(element: HTMLTextAreaElement, rows: number, maxRows: number) {
    const style = getComputedStyle(element);
    const lineHeight = parseFloat(style.lineHeight);
    if (Number.isNaN(lineHeight)) {
        return;
    }
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const minHeight = lineHeight * rows + padding;
    const maxHeight = lineHeight * Math.max(rows, maxRows) + padding;

    element.style.height = "auto";
    const contentHeight = element.scrollHeight;
    element.style.height = `${Math.min(Math.max(contentHeight, minHeight), maxHeight)}px`;
    element.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";
}

/**
 * A multi-line text field, growing with its content. Props not listed are passed to the textarea element.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
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
        rows = 3,
        autoResize = true,
        maxRows = 12,
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
    const elementRef = useRef<HTMLTextAreaElement | null>(null);
    const setRefs = useCallback(
        (element: HTMLTextAreaElement | null) => {
            elementRef.current = element;
            if (typeof ref === "function") {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
        },
        [ref],
    );

    useLayoutEffect(() => {
        const element = elementRef.current;
        if (element == null) {
            return;
        }
        if (autoResize) {
            fitHeight(element, rows, maxRows);
        } else {
            element.style.removeProperty("height");
            element.style.removeProperty("overflow-y");
        }
    }, [value, autoResize, rows, maxRows]);

    return (
        <Field
            className={clsx(styles.root, className)}
            data-autoresize={autoResize ? "" : undefined}
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
                <textarea
                    {...restProps}
                    {...control}
                    ref={setRefs}
                    rows={rows}
                    value={value}
                    maxLength={maxLength}
                    aria-describedby={clsx(control["aria-describedby"], ariaDescribedBy) || undefined}
                    className={styles.control}
                />
            )}
        </Field>
    );
});
