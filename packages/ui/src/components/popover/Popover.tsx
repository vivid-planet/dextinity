import { Popover as BasePopover } from "@base-ui/react/popover";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactElement, type ReactNode, type RefObject } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import styles from "./Popover.module.scss";

export type PopoverPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type PopoverOwnerState = {
    placement: PopoverPlacement;
};

export interface PopoverSlotProps {
    /** Props for the `positioner` slot, which places the popover next to its trigger. */
    positioner?: SlotPropsValue<PopoverOwnerState, typeof BasePopover.Positioner>;
    /** Props for the `title` slot. */
    title?: SlotPropsValue<PopoverOwnerState, typeof BasePopover.Title>;
}

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "title"> {
    /** The element that opens the popover on click. It must accept a ref and event handlers. */
    trigger: ReactElement;
    /** The content, e.g. a slider or a few settings. */
    children: ReactNode;
    /** Whether the popover is open. */
    open: boolean;
    /** Called when the trigger, Escape, or a click outside requests to open or close the popover. */
    onOpenChange: (open: boolean) => void;
    /** A short heading above the content, which also names the popover. Without it, set `aria-label`. */
    title?: string;
    /**
     * The preferred position next to the trigger. The popover flips when there isn't enough room.
     *
     * @defaultValue `"bottom-start"`
     */
    placement?: PopoverPlacement;
    /** The element focused when the popover opens. Without it, the first focusable element gets focus. */
    initialFocus?: RefObject<HTMLElement | null>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: PopoverSlotProps;
}

/**
 * A small panel at its trigger for a few related controls, e.g. simulating the time of day. It closes on Escape and on a
 * click outside; the page stays usable.
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
    { trigger, children, open, onOpenChange, title, placement = "bottom-start", initialFocus, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: PopoverOwnerState = { placement };
    const { anchorRef, container } = useThemePortalContainer<HTMLElement>();
    const [side, align] = ownerState.placement.split("-") as ["bottom" | "top", "start" | "end"];

    const positionerProps = resolveSlotProps<PopoverOwnerState, typeof BasePopover.Positioner, typeof BasePopover.Positioner>({
        ownProps: { side, align, sideOffset: 8, collisionPadding: 8, className: styles.positioner },
        slotProps: slotProps?.positioner,
        ownerState,
    });
    const titleProps = resolveSlotProps<PopoverOwnerState, typeof BasePopover.Title, typeof BasePopover.Title>({
        ownProps: { className: styles.title, children: title },
        slotProps: slotProps?.title,
        ownerState,
    });

    return (
        <BasePopover.Root open={open} onOpenChange={(nextOpen) => onOpenChange(nextOpen)}>
            <BasePopover.Trigger ref={anchorRef} render={trigger} />
            <BasePopover.Portal container={container}>
                <BasePopover.Positioner {...positionerProps}>
                    <BasePopover.Popup
                        {...restProps}
                        ref={ref}
                        initialFocus={initialFocus}
                        data-placement={ownerState.placement}
                        className={clsx(styles.root, className)}
                    >
                        {title != null && <BasePopover.Title {...titleProps} />}
                        {children}
                    </BasePopover.Popup>
                </BasePopover.Positioner>
            </BasePopover.Portal>
        </BasePopover.Root>
    );
});
