import { type ChangeEvent, forwardRef, type TextareaHTMLAttributes, useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { ControlFrame, type PureControlProps } from "../field/ControlFrame";
import type { FieldOwnerState } from "../field/Field";
import styles from "./Textarea.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TextareaOwnerState = FieldOwnerState & {
    autoResize: boolean;
};

export interface TextareaProps
    extends
        PureControlProps,
        Omit<
            TextareaHTMLAttributes<HTMLTextAreaElement>,
            keyof PureControlProps | "prefix" | "value" | "defaultValue" | "onChange" | "disabled" | "readOnly" | "required" | "rows"
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
        disabled,
        readOnly,
        rows = 3,
        autoResize = true,
        maxRows = 12,
        showCount = false,
        id,
        value,
        maxLength,
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

    useEffect(() => {
        const element = elementRef.current;
        if (element == null || !autoResize || typeof ResizeObserver === "undefined") {
            return;
        }
        let width = element.clientWidth;
        let frame = 0;
        const observer = new ResizeObserver(() => {
            if (element.clientWidth !== width) {
                width = element.clientWidth;
                cancelAnimationFrame(frame);
                // Resizing inside the observer callback would trigger a ResizeObserver loop error
                frame = requestAnimationFrame(() => fitHeight(element, rows, maxRows));
            }
        });
        observer.observe(element);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [autoResize, rows, maxRows]);

    return (
        <ControlFrame
            id={id}
            disabled={disabled}
            readOnly={readOnly}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            counter={showCount ? (maxLength != null ? `${value.length} / ${maxLength}` : `${value.length}`) : undefined}
            className={className}
            style={style}
        >
            {(control) => (
                <textarea
                    {...restProps}
                    {...control}
                    ref={setRefs}
                    rows={rows}
                    value={value}
                    maxLength={maxLength}
                    className={styles.control}
                    data-autoresize={autoResize ? "" : undefined}
                />
            )}
        </ControlFrame>
    );
});
