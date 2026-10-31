import clsx from "clsx";
import type { ComponentProps, ElementType, PropsWithChildren } from "react";

import styles from "./Typography.module.scss";

type TypographyVariant =
    | "headline600"
    | "headline550"
    | "headline500"
    | "headline450"
    | "headline400"
    | "headline350"
    | "eyebrow600"
    | "eyebrow550"
    | "eyebrow500"
    | "eyebrow450"
    | "paragraph300"
    | "paragraph200"
    | "list300"
    | "list200";

const variantToElementMap: Record<TypographyVariant, ElementType> = {
    headline600: "h1",
    headline550: "h2",
    headline500: "h3",
    headline450: "h4",
    headline400: "h5",
    headline350: "h6",
    eyebrow600: "p",
    eyebrow550: "p",
    eyebrow500: "p",
    eyebrow450: "p",
    paragraph300: "p",
    paragraph200: "p",
    list300: "p",
    list200: "p",
};

export type TypographyProps<T extends ElementType> = {
    as?: T;
    variant?: TypographyVariant;
    bottomSpacing?: boolean;
} & Omit<ComponentProps<T>, "variant">;

export const Typography = <T extends ElementType = "p">(props: PropsWithChildren<TypographyProps<T>>) => {
    const { as, variant = "paragraph300", bottomSpacing = false, className, children, ...restProps } = props;
    const Component = as || variantToElementMap[variant] || "p";
    return (
        <Component
            className={clsx(styles.root, styles[`root--${variant}`], !bottomSpacing && styles[`root--noBottomSpacing`], className)}
            {...restProps}
        >
            {children}
        </Component>
    );
};
