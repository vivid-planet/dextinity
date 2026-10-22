import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import type { HTMLAttributes, Ref } from "react";

import styles from "./Typography.module.scss";

type TypographyVariant = "headline" | "body";
type TypographyElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 *
 * @experimental
 */
export type TypographyOwnerState = {
    variant: TypographyVariant;
};

const variantElement: Record<TypographyVariant, TypographyElement> = {
    headline: "h2",
    body: "p",
};

/** @experimental */
export interface TypographyProps extends Omit<HTMLAttributes<HTMLElement>, "className"> {
    /**
     * Visual style. Each variant has a default semantic element.
     *
     * @defaultValue `"body"`
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
    /** Ref forwarded to the root element. */
    ref?: Ref<HTMLElement>;
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
 *
 * @experimental
 */
export function Typography({ variant = "body", element, className, children, ref, render, ...restProps }: TypographyProps) {
    const ownerState: TypographyOwnerState = { variant };
    const tagName = element ?? variantElement[ownerState.variant];

    return useRender({
        render,
        ref,
        state: ownerState,
        defaultTagName: tagName,
        props: { ...restProps, className: clsx(styles.root, className), children },
    });
}
