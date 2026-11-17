import clsx from "clsx";
import type { ComponentProps, ElementType } from "react";

import styles from "./Button.module.scss";

export type ButtonVariant = "contained" | "outlined" | "text";

type ButtonProps<T extends ElementType> = {
    as?: T;
    variant?: ButtonVariant;
} & Omit<ComponentProps<T>, "variant">;

export const Button = <T extends ElementType = "button">(props: ButtonProps<T>) => {
    const { as: Component = "button", variant = "contained", className, ...rest } = props;
    return <Component className={clsx(styles["button"], styles[`button--${variant}`], className)} {...rest} />;
};
