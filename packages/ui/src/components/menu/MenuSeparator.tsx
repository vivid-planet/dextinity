import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";

import styles from "./MenuSeparator.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type MenuSeparatorOwnerState = Record<string, never>;

export interface MenuSeparatorProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * A line between groups of items in a `Menu`, e.g. before destructive actions.
 */
export const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorProps>(function MenuSeparator({ className, ...restProps }, ref) {
    return <BaseMenu.Separator {...restProps} ref={ref} className={clsx(styles.root, className)} />;
});
