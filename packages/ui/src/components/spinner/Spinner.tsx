import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";

import styles from "./Spinner.module.scss";

type SpinnerSize = "md" | "lg" | "xl";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type SpinnerOwnerState = {
    size: SpinnerSize;
};

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children"> {
    /** @defaultValue `"md"` */
    size?: SpinnerSize;
    /** Names what is loading. Without a name, the spinner is hidden from assistive technology. */
    "aria-label"?: string;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Shows that content is loading or an action is in progress.
 */
export const Spinner = forwardRef<HTMLElement, SpinnerProps>(function Spinner({ size = "md", className, ...restProps }, ref) {
    const ownerState: SpinnerOwnerState = { size };
    const hasAccessibleName = restProps["aria-label"] != null || restProps["aria-labelledby"] != null;

    return useRender({
        ref,
        state: ownerState,
        defaultTagName: "span",
        props: {
            role: hasAccessibleName ? "progressbar" : undefined,
            "aria-hidden": hasAccessibleName ? undefined : true,
            ...restProps,
            className: clsx(styles.root, className),
            children: (
                <svg className={styles.svg} aria-hidden>
                    <circle className={styles.arc} pathLength={100} />
                </svg>
            ),
        },
    });
});
