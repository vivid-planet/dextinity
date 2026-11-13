import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import { type AnchorHTMLAttributes, forwardRef, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./LinkedContent.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type LinkedContentOwnerState = {
    hasDescription: boolean;
};

export interface LinkedContentSlotProps {
    /** Props for the `icon` slot, the tinted square at the start. */
    icon?: SlotPropsValue<LinkedContentOwnerState, "span">;
    /** Props for the `text` slot that holds the title and the description. */
    text?: SlotPropsValue<LinkedContentOwnerState, "span">;
    /** Props for the `title` slot. */
    title?: SlotPropsValue<LinkedContentOwnerState, "span">;
    /** Props for the `description` slot. */
    description?: SlotPropsValue<LinkedContentOwnerState, "span">;
    /** Props for the `arrow` slot at the end. */
    arrow?: SlotPropsValue<LinkedContentOwnerState, "span">;
}

export interface LinkedContentProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "title"> {
    /** The type of content, e.g. "Job postings". */
    title: string;
    /** What is shown on the page, e.g. "12 entries are shown here". */
    description?: string;
    /**
     * The icon of the content type.
     *
     * @defaultValue `<Icon name="blocks" />`
     */
    icon?: ReactNode;
    /** Opens the list of the content. */
    href: string;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: LinkedContentSlotProps;
    /**
     * Render a custom root element, e.g. the router's link component, instead of an anchor.
     *
     * @example
     * ```tsx
     * <LinkedContent title="Job postings" href="/jobs" render={<RouterLink to="/jobs" />} />
     * ```
     */
    render?: useRender.RenderProp<LinkedContentOwnerState>;
}

/**
 * Points to structured content that is shown on a page, e.g. the job postings a block lists, and opens it.
 */
export const LinkedContent = forwardRef<HTMLAnchorElement, LinkedContentProps>(function LinkedContent(
    { title, description, icon = <Icon name="blocks" />, className, slotProps, render, ...restProps },
    ref,
) {
    const ownerState: LinkedContentOwnerState = { hasDescription: description != null };

    const iconProps = resolveSlotProps<LinkedContentOwnerState, "span", "span">({
        ownProps: { className: styles.icon, "aria-hidden": true },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const textProps = resolveSlotProps<LinkedContentOwnerState, "span", "span">({
        ownProps: { className: styles.text },
        slotProps: slotProps?.text,
        ownerState,
    });
    const titleProps = resolveSlotProps<LinkedContentOwnerState, "span", "span">({
        ownProps: { className: styles.title },
        slotProps: slotProps?.title,
        ownerState,
    });
    const descriptionProps = resolveSlotProps<LinkedContentOwnerState, "span", "span">({
        ownProps: { className: styles.description },
        slotProps: slotProps?.description,
        ownerState,
    });
    const arrowProps = resolveSlotProps<LinkedContentOwnerState, "span", "span">({
        ownProps: { className: styles.arrow, "aria-hidden": true },
        slotProps: slotProps?.arrow,
        ownerState,
    });

    return useRender({
        ref,
        render,
        state: ownerState,
        stateAttributesMapping: { hasDescription: (value) => (value ? { "data-has-description": "" } : null) },
        defaultTagName: "a",
        props: {
            ...restProps,
            className: clsx(styles.root, className),
            children: (
                <>
                    <span {...iconProps}>{icon}</span>
                    <span {...textProps}>
                        <span {...titleProps}>{title}</span>
                        {description != null && <span {...descriptionProps}>{description}</span>}
                    </span>
                    <span {...arrowProps}>
                        <Icon name="arrow" />
                    </span>
                </>
            ),
        },
    });
});
