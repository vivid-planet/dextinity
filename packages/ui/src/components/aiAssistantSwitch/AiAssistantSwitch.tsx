import { clsx } from "clsx";
import { type ButtonHTMLAttributes, forwardRef, type MouseEvent, type ReactNode, useCallback } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useAppShellContext } from "../appShell/appShellContext";
import { Icon } from "../icon/Icon";
import { useAriaKeyShortcuts } from "../keyboardShortcut/useAriaKeyShortcuts";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./AiAssistantSwitch.module.scss";

export interface AiAssistantSwitchLabels {
    /** The visible label, the accessible name, and the tooltip. */
    label: string;
}

const defaultLabels: AiAssistantSwitchLabels = {
    label: "AI assistant",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type AiAssistantSwitchOwnerState = {
    /** Whether the assistant is shown. */
    checked: boolean;
    /** Shows only the icon and the switch. */
    iconOnly: boolean;
};

export interface AiAssistantSwitchSlotProps {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<AiAssistantSwitchOwnerState, "span">;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<AiAssistantSwitchOwnerState, "span">;
    /** Props for the `track` slot, the mini switch. */
    track?: SlotPropsValue<AiAssistantSwitchOwnerState, "span">;
}

export interface AiAssistantSwitchProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children" | "type" | "role" | "aria-checked"
> {
    /** Whether the assistant is shown. Inside `AppShell`, leave it unset: the switch follows the shell's assistant. */
    checked?: boolean;
    /** Called to show or hide the assistant. Inside `AppShell`, leave it unset. */
    onCheckedChange?: (checked: boolean) => void;
    /** Shows only the icon and the switch. Inside `AppShell`, leave it unset: the label is hidden on narrow windows. */
    iconOnly?: boolean;
    /**
     * The icon before the label. The AI icon is still being decided, so apps should pass it from one place.
     *
     * @defaultValue `<Icon name="spark" />`
     */
    icon?: ReactNode;
    /**
     * The keyboard shortcut shown in the tooltip, in the notation of `useKeyboardShortcut`. It only shows the hint; `AppShell`
     * listens to the shortcut.
     *
     * @defaultValue `"mod+j"`
     */
    keyboardShortcut?: string;
    /** The built-in texts. */
    labels?: Partial<AiAssistantSwitchLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: AiAssistantSwitchSlotProps;
}

/**
 * Shows and hides the AI assistant, as a pill with an icon, a label and a mini switch, so the state is visible at all times. Place it
 * in the `TopBar`'s `assistantSwitch`, and leave it out for users without the right to use the assistant. On narrow windows it
 * shows only the icon and the switch.
 */
export const AiAssistantSwitch = forwardRef<HTMLButtonElement, AiAssistantSwitchProps>(function AiAssistantSwitch(
    {
        checked: checkedProp,
        onCheckedChange: onCheckedChangeProp,
        iconOnly: iconOnlyProp,
        icon = <Icon name="spark" />,
        keyboardShortcut = "mod+j",
        labels: labelsProp,
        className,
        slotProps,
        onClick,
        ...restProps
    },
    forwardedRef,
) {
    const shell = useAppShellContext();
    const labels = { ...defaultLabels, ...labelsProp };
    const checked = checkedProp ?? shell?.assistantOpen ?? false;
    const onCheckedChange = onCheckedChangeProp ?? shell?.onAssistantOpenChange;
    const iconOnly = iconOnlyProp ?? shell?.layout === "narrow";
    const ownerState: AiAssistantSwitchOwnerState = { checked, iconOnly };
    const ariaKeyShortcuts = useAriaKeyShortcuts(keyboardShortcut);
    const shellSwitchRef = shell?.assistantSwitchRef;

    const ref = useCallback(
        (node: HTMLButtonElement | null) => {
            if (shellSwitchRef != null) {
                shellSwitchRef.current = node;
            }
            if (typeof forwardedRef === "function") {
                forwardedRef(node);
            } else if (forwardedRef != null) {
                forwardedRef.current = node;
            }
        },
        [forwardedRef, shellSwitchRef],
    );

    const iconProps = resolveSlotProps<AiAssistantSwitchOwnerState, "span", "span">({
        ownProps: { className: styles.icon, "aria-hidden": true },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const labelProps = resolveSlotProps<AiAssistantSwitchOwnerState, "span", "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const trackProps = resolveSlotProps<AiAssistantSwitchOwnerState, "span", "span">({
        ownProps: { className: styles.track, "aria-hidden": true },
        slotProps: slotProps?.track,
        ownerState,
    });

    return (
        <Tooltip content={labels.label} keyboardShortcut={keyboardShortcut}>
            <button
                aria-label={labels.label}
                aria-keyshortcuts={ariaKeyShortcuts}
                {...restProps}
                ref={ref}
                type="button"
                role="switch"
                aria-checked={checked}
                data-icononly={iconOnly ? "" : undefined}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    onClick?.(event);
                    if (!event.defaultPrevented) {
                        onCheckedChange?.(!checked);
                    }
                }}
                className={clsx(styles.root, className)}
            >
                <span {...iconProps}>{icon}</span>
                <span {...labelProps}>{labels.label}</span>
                <span {...trackProps}>
                    <span className={styles.thumb} />
                </span>
            </button>
        </Tooltip>
    );
});
