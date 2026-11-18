import { Progress } from "@base-ui/react/progress";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./ProgressBar.module.scss";

type ProgressBarTone = "accent" | "success" | "warning" | "danger";
type ProgressBarSize = "default" | "small";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ProgressBarOwnerState = {
    tone: ProgressBarTone;
    size: ProgressBarSize;
    indeterminate: boolean;
};

export interface ProgressBarSlotProps {
    /** Props for the `label` slot. */
    label?: SlotPropsValue<ProgressBarOwnerState, typeof Progress.Label>;
    /** Props for the `value` slot, the formatted value at the end of the label row. */
    value?: SlotPropsValue<ProgressBarOwnerState, typeof Progress.Value>;
    /** Props for the `track` slot, the bar's background. */
    track?: SlotPropsValue<ProgressBarOwnerState, typeof Progress.Track>;
    /** Props for the `indicator` slot, the filled part of the bar. */
    indicator?: SlotPropsValue<ProgressBarOwnerState, typeof Progress.Indicator>;
}

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** How far the task is, between `min` and `max`. `null` while it is unknown: the bar then moves without a value. */
    value: number | null;
    /**
     * The value at the start of the bar.
     *
     * @defaultValue `0`
     */
    min?: number;
    /**
     * The value at the end of the bar.
     *
     * @defaultValue `100`
     */
    max?: number;
    /** Visible text above the bar, e.g. "Uploading 3 files". Without it, give the bar an `aria-label`. */
    label?: ReactNode;
    /**
     * Shows the value at the end of the label row, as a percentage unless `format` says otherwise.
     *
     * @defaultValue `false`
     */
    showValue?: boolean;
    /** How the value is formatted, for screen readers and with `showValue`. */
    format?: Intl.NumberFormatOptions;
    /** The locale the value is formatted in. Defaults to the browser's. */
    locale?: Intl.LocalesArgument;
    /**
     * The bar's color: `success` once a task finished, `warning` and `danger` when it ran into problems.
     *
     * @defaultValue `"accent"`
     */
    tone?: ProgressBarTone;
    /**
     * The bar's thickness: `small` inside rows and lists.
     *
     * @defaultValue `"default"`
     */
    size?: ProgressBarSize;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ProgressBarSlotProps;
}

/**
 * Shows how far a task is, e.g. an upload or an import. Without a known value, the bar moves to show that the task is running.
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
    { value, min = 0, max = 100, label, showValue = false, format, locale, tone = "accent", size = "default", className, slotProps, ...restProps },
    ref,
) {
    const ownerState: ProgressBarOwnerState = { tone, size, indeterminate: value === null };

    const labelProps = resolveSlotProps<ProgressBarOwnerState, typeof Progress.Label, typeof Progress.Label>({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const valueProps = resolveSlotProps<ProgressBarOwnerState, typeof Progress.Value, typeof Progress.Value>({
        ownProps: { className: styles.value },
        slotProps: slotProps?.value,
        ownerState,
    });
    const trackProps = resolveSlotProps<ProgressBarOwnerState, typeof Progress.Track, typeof Progress.Track>({
        ownProps: { className: styles.track },
        slotProps: slotProps?.track,
        ownerState,
    });
    const indicatorProps = resolveSlotProps<ProgressBarOwnerState, typeof Progress.Indicator, typeof Progress.Indicator>({
        ownProps: { className: styles.indicator },
        slotProps: slotProps?.indicator,
        ownerState,
    });

    const showsValue = showValue && value !== null;

    return (
        <Progress.Root
            {...restProps}
            ref={ref}
            value={value}
            min={min}
            max={max}
            format={format}
            locale={locale}
            data-tone={ownerState.tone}
            data-size={ownerState.size}
            className={clsx(styles.root, className)}
        >
            {(label != null || showsValue) && (
                <div className={styles.labelRow}>
                    {label != null && <Progress.Label {...labelProps}>{label}</Progress.Label>}
                    {showsValue && <Progress.Value {...valueProps} />}
                </div>
            )}
            <Progress.Track {...trackProps}>
                <Progress.Indicator {...indicatorProps} />
            </Progress.Track>
        </Progress.Root>
    );
});
