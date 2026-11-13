import { Slider as BaseSlider } from "@base-ui/react/slider";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode, useCallback } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { type ControlAriaProps, useGroupControl } from "../field/ControlFrame";
import styles from "./Slider.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type SliderOwnerState = {
    disabled: boolean;
    readOnly: boolean;
    invalid: boolean;
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

export interface SliderProps
    extends
        ControlAriaProps,
        Omit<
            ComponentPropsWithoutRef<typeof BaseSlider.Root>,
            "className" | "children" | "value" | "defaultValue" | "onValueChange" | "onChange" | keyof ControlAriaProps
        > {
    /** The current value. */
    value: number;
    /** Called with the new value while the thumb moves. */
    onChange: (value: number) => void;
    /**
     * The lowest value.
     *
     * @defaultValue `0`
     */
    min?: number;
    /**
     * The highest value.
     *
     * @defaultValue `100`
     */
    max?: number;
    /**
     * The amount the value changes by, e.g. with the arrow keys.
     *
     * @defaultValue `1`
     */
    step?: number;
    /** An icon before the track for the low end, e.g. a small image for a size. */
    startIcon?: ReactNode;
    /** An icon after the track for the high end, e.g. a large image for a size. */
    endIcon?: ReactNode;
    /**
     * Prevents interaction with the slider. Ignored inside a `Field`, which takes it from its own `disabled`.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Shows the value without letting the user change it; the thumb stays focusable. Ignored inside a `Field`, which takes it from its
     * own `readOnly`.
     *
     * @defaultValue `false`
     */
    readOnly?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: SliderSlotProps;
}

/**
 * Picks a value in a range, e.g. the size of thumbnails. For a visible label, help, or a validation message, put it in a `Field` with
 * `layout="group"`; on its own, name it with `aria-label`.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
    {
        value,
        onChange,
        min = 0,
        max = 100,
        step = 1,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
        startIcon,
        endIcon,
        disabled,
        readOnly,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const { control } = useGroupControl({
        controlName: "Slider",
        describeRequired: true,
        disabled,
        readOnly,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
    });
    const ownerState: SliderOwnerState = { disabled: control.disabled, readOnly: control.readOnly, invalid: control["aria-invalid"] === true };
    const { invalid, readOnly: isReadOnly } = ownerState;
    // The thumb passes neither aria-invalid nor aria-readonly to its input, so they are set on the input directly
    const inputRef = useCallback(
        (input: HTMLInputElement | null) => {
            for (const [attribute, isSet] of [
                ["aria-invalid", invalid],
                ["aria-readonly", isReadOnly],
            ] as const) {
                if (isSet) {
                    input?.setAttribute(attribute, "true");
                } else {
                    input?.removeAttribute(attribute);
                }
            }
        },
        [invalid, isReadOnly],
    );

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
            "aria-label": control["aria-label"],
            "aria-labelledby": control["aria-labelledby"],
            "aria-describedby": control["aria-describedby"],
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
            onValueChange={(nextValue: number) => {
                if (!isReadOnly) {
                    onChange(nextValue);
                }
            }}
            min={min}
            max={max}
            step={step}
            disabled={ownerState.disabled}
            aria-label={control["aria-label"]}
            aria-labelledby={control["aria-labelledby"]}
            data-readonly={ownerState.readOnly ? "" : undefined}
            data-invalid={ownerState.invalid ? "" : undefined}
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
