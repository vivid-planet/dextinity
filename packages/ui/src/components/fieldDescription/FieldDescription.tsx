import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./FieldDescription.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FieldDescriptionOwnerState = Record<string, never>;

export interface FieldDescriptionProps extends Omit<HTMLAttributes<HTMLParagraphElement>, "className" | "children"> {
    /** The description. */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Tells what everyone needs to fill in a form field, e.g. the expected format. For a control without a `Field`; `Field` shows its own
 * `description`. Set its `id` as the control's `aria-describedby`.
 */
export const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescriptionProps>(function FieldDescription({ className, ...restProps }, ref) {
    return <p {...restProps} ref={ref} className={clsx(styles.root, className)} />;
});
