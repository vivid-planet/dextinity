import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";

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
    /**
     * Visual style, each with a default semantic element:
     *
     * - `displayXl`: one greeting or key figure per view.
     * - `displayL`: the page title.
     * - `title`: titles of panels and cards.
     * - `section`: sections in forms.
     * - `body`: the default for interfaces and tables.
     * - `small`: help texts and metadata, in a muted color.
     * - `label`: monospaced capitals that name groups and sections, in a muted color.
     * - `mono`: paths, IDs, and keyboard shortcuts.
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
 * Renders a single block of text in one of the styles of the type scale, each mapping to a default semantic element.
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
