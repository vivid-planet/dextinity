import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactElement, useMemo } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { KeyboardShortcut } from "../keyboardShortcut/KeyboardShortcut";
import styles from "./Tooltip.module.scss";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

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
    /** The explanation, one short line. */
    content: string;
    /** The element that shows the tooltip on hover and keyboard focus. It must accept a ref and event handlers. */
    children: ReactElement;
    /** A keyboard shortcut for the action, shown after the text, e.g. `⌘S`. */
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
    /** Called when hover, focus, or Escape requests to open or close the tooltip. */
    onOpenChange?: (open: boolean) => void;
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
    { content, children, shortcut, placement = "bottom", delay, open, onOpenChange, disabled = false, className, slotProps, ...restProps },
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
        ownProps: { className: styles.shortcut, children: shortcut },
        slotProps: slotProps?.shortcut,
        ownerState,
    });

    return (
        <BaseTooltip.Root
            disabled={ownerState.disabled}
            open={open}
            onOpenChange={onOpenChange == null ? undefined : (nextOpen) => onOpenChange(nextOpen)}
        >
            <BaseTooltip.Trigger ref={anchorRef} render={children} delay={delay ?? themeDelay} />
            <BaseTooltip.Portal container={container}>
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
            </BaseTooltip.Portal>
        </BaseTooltip.Root>
    );
});
