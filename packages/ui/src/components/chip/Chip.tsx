import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
    type ElementType,
    type ForwardedRef,
    forwardRef,
    type HTMLAttributes,
    type MouseEvent,
    type ReactNode,
    type RefAttributes,
    type SyntheticEvent,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./Chip.module.scss";

type ChipVariant = "contained" | "outlined";
type ChipColor = "primary" | "secondary" | "info" | "warning" | "error" | "success";
type ChipSize = "default" | "small";
type ClearButtonElement = ElementType<{ type?: "button"; disabled?: boolean }>;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ChipOwnerState = {
    variant: ChipVariant;
    color: ChipColor;
    size: ChipSize;
    disabled: boolean;
};

interface ChipSlots<StartIcon extends ElementType, EndIcon extends ElementType, ClearButton extends ClearButtonElement> {
    /**
     * Element for the `startIcon` slot.
     *
     * @defaultValue `span`
     */
    startIcon?: StartIcon;
    /**
     * Element for the `endIcon` slot.
     *
     * @defaultValue `span`
     */
    endIcon?: EndIcon;
    /**
     * Element for the `clearButton` slot.
     *
     * @defaultValue `button`
     */
    clearButton?: ClearButton;
}

interface ChipSlotProps<StartIcon extends ElementType, EndIcon extends ElementType, ClearButton extends ClearButtonElement> {
    /** Props for the `startIcon` slot. */
    startIcon?: SlotPropsValue<ChipOwnerState, StartIcon>;
    /** Props for the `endIcon` slot. */
    endIcon?: SlotPropsValue<ChipOwnerState, EndIcon>;
    /** Props for the `clearButton` slot. */
    clearButton?: SlotPropsValue<ChipOwnerState, ClearButton>;
}

interface ChipOwnProps<StartIcon extends ElementType, EndIcon extends ElementType, ClearButton extends ClearButtonElement> extends Omit<
    HTMLAttributes<HTMLElement>,
    "className" | "color"
> {
    /** The label, e.g. a value or a status. */
    children?: ReactNode;
    /**
     * Visual emphasis: `contained` for chips that need attention, `outlined` for quieter ones, for example in a long list of filters.
     *
     * @defaultValue `"contained"`
     */
    variant?: ChipVariant;
    /**
     * Use `info`, `success`, `warning` and `error` for a status, `primary` and `secondary` for other values and filters.
     *
     * @defaultValue `"primary"`
     */
    color?: ChipColor;
    /**
     * `small` in table rows and dense lists.
     *
     * @defaultValue `"default"`
     */
    size?: ChipSize;
    /**
     * Shows the chip as unavailable and disables its clear button.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** The icon to render before the label. */
    startIcon?: ReactNode;
    /** The icon to render after the label. */
    endIcon?: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: ChipSlots<StartIcon, EndIcon, ClearButton>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ChipSlotProps<StartIcon, EndIcon, ClearButton>;
    /**
     * Render a custom root element, for example a `<button>` for a chip that toggles a filter.
     *
     * @example
     * ```tsx
     * <Chip render={<button type="button" />}>Published</Chip>
     * ```
     */
    render?: useRender.RenderProp<ChipOwnerState>;
    /** Shows a clear button that calls this function. Don't combine it with a `render` element that is itself interactive. */
    onClear?: (event: MouseEvent<HTMLButtonElement>) => void;
    /** Names the clear button for assistive technology, for example "Remove filter: Published". Required with `onClear`. */
    clearLabel?: string;
}

// Declared in `ChipOwnProps` as well, where the props table finds their descriptions; this union only requires them together
type ChipClearProps =
    | {
          onClear?: undefined;
          clearLabel?: undefined;
      }
    | {
          onClear: (event: MouseEvent<HTMLButtonElement>) => void;
          clearLabel: string;
      };

export type ChipProps<
    StartIcon extends ElementType = "span",
    EndIcon extends ElementType = "span",
    ClearButton extends ClearButtonElement = "button",
> = ChipOwnProps<StartIcon, EndIcon, ClearButton> & ChipClearProps;

function preventDefault(event: SyntheticEvent) {
    event.preventDefault();
}

/**
 * A compact element for a value, a status, or a filter.
 */
export const Chip: <StartIcon extends ElementType = "span", EndIcon extends ElementType = "span", ClearButton extends ClearButtonElement = "button">(
    props: ChipProps<StartIcon, EndIcon, ClearButton> & RefAttributes<HTMLElement>,
) => ReactNode = forwardRef(function Chip<
    StartIcon extends ElementType = "span",
    EndIcon extends ElementType = "span",
    ClearButton extends ClearButtonElement = "button",
>(
    {
        variant = "contained",
        color = "primary",
        size = "default",
        disabled,
        startIcon,
        endIcon,
        onClear,
        clearLabel,
        className,
        slots,
        slotProps,
        children,
        render,
        onClick,
        ...restProps
    }: ChipProps<StartIcon, EndIcon, ClearButton>,
    ref: ForwardedRef<HTMLElement>,
) {
    const ownerState: ChipOwnerState = { variant, color, size, disabled: disabled === true };

    const StartIconSlot: ElementType = slots?.startIcon ?? "span";
    const EndIconSlot: ElementType = slots?.endIcon ?? "span";
    const ClearButtonSlot: ElementType = slots?.clearButton ?? "button";

    const startIconProps = resolveSlotProps<ChipOwnerState, StartIcon, "span">({
        ownProps: { className: styles.startIcon },
        slotProps: slotProps?.startIcon,
        ownerState,
    });
    const endIconProps = resolveSlotProps<ChipOwnerState, EndIcon, "span">({
        ownProps: { className: styles.endIcon },
        slotProps: slotProps?.endIcon,
        ownerState,
    });
    const clearButtonProps = resolveSlotProps<ChipOwnerState, ClearButton, "button">({
        ownProps: { type: "button", "aria-label": clearLabel, disabled: ownerState.disabled, onClick: onClear, className: styles.clearButton },
        slotProps: slotProps?.clearButton,
        ownerState,
    });

    return useRender({
        render,
        ref,
        state: ownerState,
        defaultTagName: "span",
        props: {
            ...restProps,
            "aria-disabled": (render !== undefined && ownerState.disabled) || undefined,
            onClick: ownerState.disabled ? preventDefault : onClick,
            className: clsx(styles.root, className),
            children: (
                <>
                    {startIcon != null && <StartIconSlot {...startIconProps}>{startIcon}</StartIconSlot>}
                    {children}
                    {endIcon != null && <EndIconSlot {...endIconProps}>{endIcon}</EndIconSlot>}
                    {onClear !== undefined && (
                        <ClearButtonSlot {...clearButtonProps}>
                            <Icon name="close-circle-fill" />
                        </ClearButtonSlot>
                    )}
                </>
            ),
        },
    });
});
