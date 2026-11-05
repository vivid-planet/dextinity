import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import { type AnchorHTMLAttributes, forwardRef, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./Link.module.scss";

type LinkColor = "secondary" | "accent";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type LinkOwnerState = {
    color: LinkColor;
    external: boolean;
};

export interface LinkSlotProps {
    /** Props for the `startIcon` slot. */
    startIcon?: SlotPropsValue<LinkOwnerState, "span">;
    /** Props for the `endIcon` slot. */
    endIcon?: SlotPropsValue<LinkOwnerState, "span">;
    /** Props for the `externalHint` slot, the visually hidden text announced for external links. */
    externalHint?: SlotPropsValue<LinkOwnerState, "span">;
}

export interface LinkLabels {
    /** Announced after the text of an external link. */
    opensInNewTab: string;
}

const defaultLabels: LinkLabels = {
    opensInNewTab: "(opens in a new tab)",
};

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "color"> {
    /** The link text. Say where the link goes, never "Click here". */
    children: ReactNode;
    /** The destination. */
    href?: string;
    /**
     * `secondary` for quiet links next to headings and in cards, `accent` for links within text and breadcrumbs.
     *
     * @defaultValue `"secondary"`
     */
    color?: LinkColor;
    /**
     * Opens the destination in a new tab and shows the external-link icon, unless an `endIcon` is given.
     *
     * @defaultValue `false`
     */
    external?: boolean;
    /** An icon before the text, e.g. `<Icon name="arrow-left" />` for a back link. It nudges to the start on hover. */
    startIcon?: ReactNode;
    /** An icon after the text, e.g. `<Icon name="arrow-right" />`. It nudges to the end on hover. */
    endIcon?: ReactNode;
    /** Built-in text for assistive technology. */
    labels?: Partial<LinkLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: LinkSlotProps;
    /**
     * Render a custom root element, e.g. the router's link component, instead of an anchor.
     *
     * @example
     * ```tsx
     * <Link render={<RouterLink to="/pages" />}>Page tree</Link>
     * ```
     */
    render?: useRender.RenderProp<LinkOwnerState>;
}

/**
 * A text link that says where it goes. Its icon nudges in the direction of travel on hover.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
    { children, color = "secondary", external = false, startIcon, endIcon, labels: labelsProp, className, slotProps, render, ...restProps },
    ref,
) {
    const ownerState: LinkOwnerState = { color, external };
    const labels = { ...defaultLabels, ...labelsProp };
    const resolvedEndIcon = endIcon ?? (external ? <Icon name="external-link" /> : undefined);

    const startIconProps = resolveSlotProps<LinkOwnerState, "span", "span">({
        ownProps: { className: styles.startIcon, "aria-hidden": true },
        slotProps: slotProps?.startIcon,
        ownerState,
    });
    const endIconProps = resolveSlotProps<LinkOwnerState, "span", "span">({
        ownProps: { className: styles.endIcon, "aria-hidden": true },
        slotProps: slotProps?.endIcon,
        ownerState,
    });
    const externalHintProps = resolveSlotProps<LinkOwnerState, "span", "span">({
        ownProps: { className: styles.externalHint },
        slotProps: slotProps?.externalHint,
        ownerState,
    });

    return useRender({
        ref,
        render,
        state: ownerState,
        defaultTagName: "a",
        props: {
            ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
            ...restProps,
            className: clsx(styles.root, className),
            children: (
                <>
                    {startIcon != null && <span {...startIconProps}>{startIcon}</span>}
                    {children}
                    {external && <span {...externalHintProps}>{labels.opensInNewTab}</span>}
                    {resolvedEndIcon != null && <span {...endIconProps}>{resolvedEndIcon}</span>}
                </>
            ),
        },
    });
});
