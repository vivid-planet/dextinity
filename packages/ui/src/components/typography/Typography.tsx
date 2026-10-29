import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";

import styles from "./Typography.module.scss";

type TypographyVariant =
    "display" | "h1" | "h2" | "h3" | "h4" | "bodyL" | "bodyM" | "bodyS" | "bodyXs" | "caption" | "labelM" | "labelS" | "labelXs" | "dataM" | "dataS";
type TypographyElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TypographyOwnerState = {
    variant: TypographyVariant;
};

const variantElement: Record<TypographyVariant, TypographyElement> = {
    display: "h1",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    bodyL: "p",
    bodyM: "p",
    bodyS: "p",
    bodyXs: "p",
    caption: "span",
    labelM: "span",
    labelS: "span",
    labelXs: "span",
    dataM: "span",
    dataS: "span",
};

export interface TypographyProps extends Omit<HTMLAttributes<HTMLElement>, "className"> {
    /**
     * Visual style. Each variant has a default semantic element.
     *
     * @defaultValue `"bodyM"`
     */
    variant?: TypographyVariant;
    /**
     * The semantic element to render, overriding the variant's default.
     *
     * @defaultValue The variant's default element
     */
    element?: TypographyElement;
    /** Added alongside the component's own classes. */
    className?: string;
    /**
     * Render a custom root element instead of the variant's default.
     *
     * @example
     * ```tsx
     * <Typography render={<label htmlFor="email" />}>Email</Typography>
     * ```
     */
    render?: useRender.RenderProp<TypographyOwnerState>;
}

/**
 * Renders a single block of text in one of several visual variants, each
 * mapping to a default semantic element.
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>(function Typography(
    { variant = "bodyM", element, className, children, render, ...restProps },
    ref,
) {
    const ownerState: TypographyOwnerState = { variant };
    const tagName = element ?? variantElement[ownerState.variant];

    return useRender({
        render,
        ref,
        state: ownerState,
        defaultTagName: tagName,
        props: { ...restProps, className: clsx(styles.root, className), children },
    });
});
