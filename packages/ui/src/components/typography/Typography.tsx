import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./Typography.module.scss";

type TypographyVariant = "displayXl" | "displayL" | "title" | "section" | "body" | "small" | "label" | "mono";
type TypographyElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TypographyOwnerState = {
    variant: TypographyVariant;
};

const variantElement: Record<TypographyVariant, TypographyElement> = {
    displayXl: "h1",
    displayL: "h1",
    title: "h2",
    section: "h3",
    body: "p",
    small: "p",
    label: "span",
    mono: "span",
};

export interface TypographyProps extends Omit<HTMLAttributes<HTMLElement>, "className"> {
    /** The text. */
    children?: ReactNode;
    /**
     * Visual style. Each variant has a default semantic element: `displayXl` for the greeting on an overview, `displayL` for the page title
     * (one per view), `title` for panels and cards, `section` for form sections, `body` for UI text and tables, `small` for help texts and
     * metadata, `label` for groups and markers, `mono` for paths, IDs, and shortcuts.
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
    { variant = "body", element, className, children, render, ...restProps },
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
