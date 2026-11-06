import { clsx } from "clsx";
import { type CSSProperties, forwardRef, type HTMLAttributes, type KeyboardEvent, type PointerEvent, useRef } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import type { FocalPoint } from "../assetThumbnail/AssetThumbnail";
import { type ControlValidationProps, useControlValidation } from "../field/controlValidation";
import type { FieldState } from "../field/Field";
import styles from "./FocalPointPicker.module.scss";

export interface FocalPointPickerLabels {
    /** The accessible name of the point. */
    marker: string;
    /** Marks a point that comes from image analysis. */
    auto: string;
    /** Reads the point's position to screen readers. */
    valueText: (value: FocalPoint) => string;
}

const defaultLabels: FocalPointPickerLabels = {
    marker: "Focal point",
    auto: "Automatic",
    valueText: ({ x, y }) => `${Math.round(x * 100)} % from the left, ${Math.round(y * 100)} % from the top`,
};

const defaultRatios = ["16:9", "4:3", "1:1", "9:16"];

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FocalPointPickerOwnerState = {
    auto: boolean;
    disabled: boolean;
    state: FieldState;
};

export interface FocalPointPickerSlotProps {
    /** Props for the `stage` slot, the area holding the image and the point. */
    stage?: SlotPropsValue<FocalPointPickerOwnerState, "div">;
    /** Props for the `image` slot. */
    image?: SlotPropsValue<FocalPointPickerOwnerState, "img">;
    /** Props for the `marker` slot, the draggable point. */
    marker?: SlotPropsValue<FocalPointPickerOwnerState, "span">;
    /** Props for the `previews` slot, the row of crops. */
    previews?: SlotPropsValue<FocalPointPickerOwnerState, "div">;
    /** Props for the `message` slot, the validation message below the picker. */
    message?: SlotPropsValue<FocalPointPickerOwnerState, "div">;
}

export interface FocalPointPickerProps extends ControlValidationProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onChange"> {
    /** The URL of the image. */
    src: string;
    /** The image's text alternative. */
    alt?: string;
    /** The point the crops are centered on, as fractions of the image's width and height. */
    value: FocalPoint;
    /** Called with the new point while clicking, dragging, or pressing the arrow keys. */
    onChange: (value: FocalPoint) => void;
    /**
     * The crops previewed next to the image, as `width:height`. An empty array hides the previews.
     *
     * @defaultValue `["16:9", "4:3", "1:1", "9:16"]`
     */
    ratios?: ReadonlyArray<string>;
    /**
     * Marks the point as suggested by image analysis, until someone sets it. Set it to `false` in `onChange`.
     *
     * @defaultValue `false`
     */
    auto?: boolean;
    /**
     * Prevents moving the point.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** The built-in texts. */
    labels?: Partial<FocalPointPickerLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: FocalPointPickerSlotProps;
}

function clamp(value: number) {
    return Math.min(1, Math.max(0, value));
}

function round(value: number) {
    return Math.round(value * 1000) / 1000;
}

function toPercent(value: number) {
    return `${Math.round(clamp(value) * 1000) / 10}%`;
}

/**
 * Sets the point an image is cropped around, by clicking or dragging in the image or with the arrow keys, and previews the crops.
 */
export const FocalPointPicker = forwardRef<HTMLDivElement, FocalPointPickerProps>(function FocalPointPicker(
    {
        src,
        alt = "",
        value,
        onChange,
        ratios = defaultRatios,
        auto = false,
        disabled = false,
        state = "default",
        validationMessage,
        labels: labelsProp,
        "aria-describedby": ariaDescribedBy,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: FocalPointPickerOwnerState = { auto, disabled, state };
    const validation = useControlValidation(state, validationMessage, ariaDescribedBy);
    const markerRef = useRef<HTMLSpanElement>(null);
    const objectPosition = `${toPercent(value.x)} ${toPercent(value.y)}`;

    const setFromPointer = (event: PointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            return;
        }
        onChange({ x: round(clamp((event.clientX - rect.left) / rect.width)), y: round(clamp((event.clientY - rect.top) / rect.height)) });
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (disabled) {
            return;
        }
        const step = event.shiftKey ? 0.1 : 0.01;
        const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        const move = moves[event.key];
        if (move == null) {
            return;
        }
        event.preventDefault();
        onChange({ x: round(clamp(value.x + move[0])), y: round(clamp(value.y + move[1])) });
    };

    const stageProps = resolveSlotProps<FocalPointPickerOwnerState, "div", "div">({
        ownProps: {
            className: styles.stage,
            onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
                if (disabled || event.button !== 0) {
                    return;
                }
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                markerRef.current?.focus({ preventScroll: true });
                setFromPointer(event);
            },
            onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
                if (!disabled && event.currentTarget.hasPointerCapture(event.pointerId)) {
                    setFromPointer(event);
                }
            },
        },
        slotProps: slotProps?.stage,
        ownerState,
    });
    const imageProps = resolveSlotProps<FocalPointPickerOwnerState, "img", "img">({
        ownProps: { className: styles.image, src, alt, draggable: false },
        slotProps: slotProps?.image,
        ownerState,
    });
    const markerProps = resolveSlotProps<FocalPointPickerOwnerState, "span", "span">({
        ownProps: {
            ref: markerRef,
            className: styles.marker,
            role: "slider",
            tabIndex: disabled ? -1 : 0,
            "aria-label": labels.marker,
            "aria-valuemin": 0,
            "aria-valuemax": 100,
            "aria-valuenow": Math.round(clamp(value.x) * 100),
            "aria-valuetext": labels.valueText(value),
            "aria-disabled": disabled || undefined,
            "aria-invalid": validation["aria-invalid"],
            "aria-describedby": validation["aria-describedby"],
            style: { insetInlineStart: toPercent(value.x), insetBlockStart: toPercent(value.y) } satisfies CSSProperties,
            onKeyDown: handleKeyDown,
        },
        slotProps: slotProps?.marker,
        ownerState,
    });
    const messageProps = resolveSlotProps<FocalPointPickerOwnerState, "div", "div">({
        ownProps: { className: styles.message, id: validation.messageId },
        slotProps: slotProps?.message,
        ownerState,
    });
    const previewsProps = resolveSlotProps<FocalPointPickerOwnerState, "div", "div">({
        ownProps: { className: styles.previews },
        slotProps: slotProps?.previews,
        ownerState,
    });

    return (
        <div
            {...restProps}
            ref={ref}
            data-auto={ownerState.auto ? "" : undefined}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-state={ownerState.state}
            className={clsx(styles.root, className)}
        >
            <div {...stageProps}>
                <img {...imageProps} />
                <span {...markerProps} />
                {ownerState.auto && <span className={styles.autoTag}>{labels.auto}</span>}
            </div>
            {ratios.length > 0 && (
                <div {...previewsProps}>
                    {ratios.map((ratio) => (
                        <figure key={ratio} className={styles.preview}>
                            <img
                                className={styles.previewImage}
                                src={src}
                                alt=""
                                draggable={false}
                                style={{ aspectRatio: ratio.replace(":", " / "), objectPosition }}
                            />
                            <figcaption className={styles.previewCaption}>{ratio.replace(":", "/")}</figcaption>
                        </figure>
                    ))}
                </div>
            )}
            {validation.showsMessage && <div {...messageProps}>{validationMessage}</div>}
        </div>
    );
});
