import { Slider as BaseSlider } from "@base-ui/react/slider";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./Slider.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type SliderOwnerState = {
    disabled: boolean;
};

export interface SliderSlotProps {
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
}

export interface SliderProps extends Omit<
    ComponentPropsWithoutRef<typeof BaseSlider.Root>,
    "className" | "children" | "value" | "defaultValue" | "onValueChange" | "onChange"
> {
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
    /** The accessible name; there is no visible label. */
    "aria-label": string;
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
        "aria-label": ariaLabel,
        startIcon,
        endIcon,
        disabled = false,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const ownerState: SliderOwnerState = { disabled };

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
        ownProps: { className: styles.thumb, "aria-label": ariaLabel },
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
            className={clsx(styles.root, className)}
        >
            {startIcon != null && <span {...startIconProps}>{startIcon}</span>}
            <BaseSlider.Control {...controlProps}>
                <BaseSlider.Track {...trackProps}>
                    <BaseSlider.Indicator {...indicatorProps} />
                    <BaseSlider.Thumb {...thumbProps} />
                </BaseSlider.Track>
            </BaseSlider.Control>
            {endIcon != null && <span {...endIconProps}>{endIcon}</span>}
        </BaseSlider.Root>
    );
});
