import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactElement, type ReactNode, useMemo } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { FieldContextReset } from "../field/fieldContext";
import { KeyboardShortcut } from "../keyboardShortcut/KeyboardShortcut";
import styles from "./Tooltip.module.scss";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

/**
 * What requested the tooltip to open or close, e.g. `"trigger-hover"`, `"trigger-focus"`, `"outside-press"`, or `"escape-key"`.
 */
export type TooltipOpenChangeReason = BaseTooltip.Root.ChangeEventReason;

const delayTokenName = "--dextinity-motion-tooltip-delay";
const fallbackDelay = 380;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TooltipOwnerState = {
    placement: TooltipPlacement;
    disabled: boolean;
};

export interface TooltipSlotProps {
    /** Props for the `positioner` slot, which places the tooltip next to its trigger. */
    positioner?: SlotPropsValue<TooltipOwnerState, typeof BaseTooltip.Positioner>;
    /** Props for the `shortcut` slot. */
    shortcut?: SlotPropsValue<TooltipOwnerState, typeof KeyboardShortcut>;
}

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "content"> {
    /** The explanation, usually one short line. */
    content: ReactNode;
    /** The element that shows the tooltip on hover and keyboard focus. It must accept a ref and event handlers. */
    children: ReactElement;
    /**
     * A keyboard shortcut for the action, shown after the text, in the notation of `useKeyboardShortcut`, e.g. `"mod+s"`: `⌘S` on
     * Apple platforms and `Ctrl+S` elsewhere.
     */
    shortcut?: string;
    /**
     * The preferred side. The tooltip flips to the opposite side when there isn't enough room.
     *
     * @defaultValue `"bottom"`
     */
    placement?: TooltipPlacement;
    /**
     * Milliseconds to wait on hover before the tooltip opens. Without a value, the theme's `--dextinity-motion-tooltip-delay` applies.
     */
    delay?: number;
    /** Whether the tooltip is open. Without it, hover and focus open and close the tooltip. */
    open?: boolean;
    /** Called when hover, focus, a press outside, or Escape requests to open or close the tooltip, with what requested it. */
    onOpenChange?: (open: boolean, details: { reason: TooltipOpenChangeReason }) => void;
    /**
     * Closes the tooltip when the trigger is clicked. Turn it off for a trigger whose click shows the tooltip, e.g. an info button.
     *
     * @defaultValue `true`
     */
    closeOnClick?: boolean;
    /**
     * Keeps the tooltip from opening.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: TooltipSlotProps;
}

/**
 * Reads the theme's hover delay for tooltips (`--dextinity-motion-tooltip-delay`) at an element, in milliseconds.
 */
export function readTooltipDelay(element: Element | null) {
    if (element == null) {
        return fallbackDelay;
    }
    const value = getComputedStyle(element).getPropertyValue(delayTokenName).trim();
    const amount = Number.parseFloat(value);
    if (Number.isNaN(amount)) {
        return fallbackDelay;
    }
    return value.endsWith("ms") ? amount : value.endsWith("s") ? amount * 1000 : amount;
}

/**
 * A short explanation of an element, shown on hover and keyboard focus. Every icon-only control has one.
 *
 * The tooltip is a visual aid: the trigger needs its own accessible name, e.g. an `aria-label` with the same text.
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
    {
        content,
        children,
        shortcut,
        placement = "bottom",
        delay,
        open,
        onOpenChange,
        closeOnClick = true,
        disabled = false,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const ownerState: TooltipOwnerState = { placement, disabled };
    const { anchor, anchorRef, container } = useThemePortalContainer<HTMLElement>();
    const themeDelay = useMemo(() => readTooltipDelay(anchor), [anchor]);

    const positionerProps = resolveSlotProps<TooltipOwnerState, typeof BaseTooltip.Positioner, typeof BaseTooltip.Positioner>({
        ownProps: { side: ownerState.placement, sideOffset: 6, collisionPadding: 8, className: styles.positioner },
        slotProps: slotProps?.positioner,
        ownerState,
    });
    const shortcutProps = resolveSlotProps<TooltipOwnerState, typeof KeyboardShortcut, typeof KeyboardShortcut>({
        ownProps: { className: styles.shortcut, shortcut },
        slotProps: slotProps?.shortcut,
        ownerState,
    });

    return (
        <BaseTooltip.Root
            disabled={ownerState.disabled}
            open={open}
            onOpenChange={onOpenChange == null ? undefined : (nextOpen, eventDetails) => onOpenChange(nextOpen, { reason: eventDetails.reason })}
        >
            <BaseTooltip.Trigger ref={anchorRef} render={children} delay={delay ?? themeDelay} closeOnClick={closeOnClick} />
            <BaseTooltip.Portal container={container}>
                <FieldContextReset>
                    <BaseTooltip.Positioner {...positionerProps}>
                        <BaseTooltip.Popup
                            role="tooltip"
                            {...restProps}
                            ref={ref}
                            data-placement={ownerState.placement}
                            className={clsx(styles.root, className)}
                        >
                            {content}
                            {shortcut != null && <KeyboardShortcut {...shortcutProps} />}
                        </BaseTooltip.Popup>
                    </BaseTooltip.Positioner>
                </FieldContextReset>
            </BaseTooltip.Portal>
        </BaseTooltip.Root>
    );
});
