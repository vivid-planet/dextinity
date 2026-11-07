import { Slider as BaseSlider } from "@base-ui/react/slider";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode, useCallback, useId } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { type ControlValidationProps, useControlValidation } from "../field/controlValidation";
import type { FieldState } from "../field/Field";
import styles from "./Slider.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type SliderOwnerState = {
    disabled: boolean;
    state: FieldState;
};

export interface SliderSlotProps {
    /** Props for the `label` slot. */
    label?: SlotPropsValue<SliderOwnerState, "span">;
    /** Props for the `startIcon` slot. */
    startIcon?: SlotPropsValue<SliderOwnerState, "span">;
    /** Props for the `endIcon` slot. */
    endIcon?: SlotPropsValue<SliderOwnerState, "span">;
    /** Props for the `control` slot, the area that responds to pointer input. */
    control?: SlotPropsValue<SliderOwnerState, typeof BaseSlider.Control>;
    /** Props for the `track` slot. */
    track?: SlotPropsValue<SliderOwnerState, typeof BaseSlider.Track>;
    /** Props for the `indicator` slot, the filled part of the track. */
    indicator?: SlotPropsValue<SliderOwnerState, typeof BaseSlider.Indicator>;
    /** Props for the `thumb` slot. */
    thumb?: SlotPropsValue<SliderOwnerState, typeof BaseSlider.Thumb>;
    /** Props for the `message` slot, the validation message below the slider. */
    message?: SlotPropsValue<SliderOwnerState, "div">;
}

export interface SliderProps
    extends
        ControlValidationProps,
        Omit<ComponentPropsWithoutRef<typeof BaseSlider.Root>, "className" | "children" | "value" | "defaultValue" | "onValueChange" | "onChange"> {
    /** The current value. */
    value: number;
    /** Called with the new value while the thumb moves. */
    onChange: (value: number) => void;
    /** @defaultValue `0` */
    min?: number;
    /** @defaultValue `100` */
    max?: number;
    /** @defaultValue `1` */
    step?: number;
    /** Visible label above the slider. */
    label?: ReactNode;
    /** The accessible name when there is no visible label. Required without `label`. */
    "aria-label"?: string;
    /** An icon before the track for the low end, e.g. a small image for a size. */
    startIcon?: ReactNode;
    /** An icon after the track for the high end, e.g. a large image for a size. */
    endIcon?: ReactNode;
    /**
     * Prevents interaction with the slider.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: SliderSlotProps;
}

/**
 * Picks a value in a range, e.g. the size of thumbnails.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
    {
        value,
        onChange,
        min = 0,
        max = 100,
        step = 1,
        label,
        "aria-label": ariaLabel,
        "aria-describedby": ariaDescribedBy,
        startIcon,
        endIcon,
        disabled = false,
        state = "default",
        validationMessage,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const ownerState: SliderOwnerState = { disabled, state };
    const labelId = `${useId()}label`;
    const hasLabel = label != null;
    const validation = useControlValidation(state, validationMessage, ariaDescribedBy);
    const invalid = validation["aria-invalid"];
    // The thumb passes no aria-invalid to its input, so it is set on the input directly
    const inputRef = useCallback(
        (input: HTMLInputElement | null) => {
            if (invalid) {
                input?.setAttribute("aria-invalid", "true");
            } else {
                input?.removeAttribute("aria-invalid");
            }
        },
        [invalid],
    );

    const labelProps = resolveSlotProps<SliderOwnerState, "span", "span">({
        ownProps: { className: styles.label, id: labelId },
        slotProps: slotProps?.label,
        ownerState,
    });
    const messageProps = resolveSlotProps<SliderOwnerState, "div", "div">({
        ownProps: { className: styles.message, id: validation.messageId },
        slotProps: slotProps?.message,
        ownerState,
    });

    const startIconProps = resolveSlotProps<SliderOwnerState, "span", "span">({
        ownProps: { className: styles.startIcon, "aria-hidden": true },
        slotProps: slotProps?.startIcon,
        ownerState,
    });
    const endIconProps = resolveSlotProps<SliderOwnerState, "span", "span">({
        ownProps: { className: styles.endIcon, "aria-hidden": true },
        slotProps: slotProps?.endIcon,
        ownerState,
    });
    const controlProps = resolveSlotProps<SliderOwnerState, typeof BaseSlider.Control, typeof BaseSlider.Control>({
        ownProps: { className: styles.control },
        slotProps: slotProps?.control,
        ownerState,
    });
    const trackProps = resolveSlotProps<SliderOwnerState, typeof BaseSlider.Track, typeof BaseSlider.Track>({
        ownProps: { className: styles.track },
        slotProps: slotProps?.track,
        ownerState,
    });
    const indicatorProps = resolveSlotProps<SliderOwnerState, typeof BaseSlider.Indicator, typeof BaseSlider.Indicator>({
        ownProps: { className: styles.indicator },
        slotProps: slotProps?.indicator,
        ownerState,
    });
    const thumbProps = resolveSlotProps<SliderOwnerState, typeof BaseSlider.Thumb, typeof BaseSlider.Thumb>({
        ownProps: {
            className: styles.thumb,
            "aria-label": hasLabel ? undefined : ariaLabel,
            "aria-labelledby": hasLabel ? labelId : undefined,
            "aria-describedby": validation["aria-describedby"],
            inputRef,
        },
        slotProps: slotProps?.thumb,
        ownerState,
    });

    return (
        <BaseSlider.Root
            {...restProps}
            ref={ref}
            value={value}
            onValueChange={(nextValue: number) => onChange(nextValue)}
            min={min}
            max={max}
            step={step}
            disabled={ownerState.disabled}
            aria-labelledby={hasLabel ? labelId : undefined}
            data-state={ownerState.state}
            className={clsx(styles.root, className)}
        >
            {hasLabel && <span {...labelProps}>{label}</span>}
            {startIcon != null && <span {...startIconProps}>{startIcon}</span>}
            <BaseSlider.Control {...controlProps}>
                <BaseSlider.Track {...trackProps}>
                    <BaseSlider.Indicator {...indicatorProps} />
                    <BaseSlider.Thumb {...thumbProps} />
                </BaseSlider.Track>
            </BaseSlider.Control>
            {endIcon != null && <span {...endIconProps}>{endIcon}</span>}
            {validation.showsMessage && <div {...messageProps}>{validationMessage}</div>}
        </BaseSlider.Root>
    );
});
