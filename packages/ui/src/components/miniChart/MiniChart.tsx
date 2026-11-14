import { clsx } from "clsx";
import { type CSSProperties, forwardRef, type HTMLAttributes } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./MiniChart.module.scss";

type MiniChartVariant = "bars" | "line";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type MiniChartOwnerState = {
    variant: MiniChartVariant;
};

export interface MiniChartSlotProps {
    /** Props for the `plot` slot, the area that holds the bars or the line. */
    plot?: SlotPropsValue<MiniChartOwnerState, "div">;
    /** Props for the `labels` slot, the row with `startLabel` and `endLabel`. */
    labels?: SlotPropsValue<MiniChartOwnerState, "div">;
}

export interface MiniChartProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The values, oldest first. Bars start at zero, so negative values count as zero; a line spans the lowest to the highest value. */
    data: readonly number[];
    /** The summary for assistive technology, as a sentence, e.g. "79 changes in 30 days". */
    "aria-label": string;
    /**
     * `bars` for counts per period, `line` for a continuous measure.
     *
     * @defaultValue `"bars"`
     */
    variant?: MiniChartVariant;
    /**
     * Marks the last value, e.g. today, in the accent color.
     *
     * @defaultValue `true`
     */
    highlightLast?: boolean;
    /** Indexes of values that deviate and should stand out, e.g. days with errors. Everything else stays quiet. */
    highlighted?: readonly number[];
    /** A label below the start, e.g. "30 days ago". */
    startLabel?: string;
    /** A label below the end, e.g. "Today". */
    endLabel?: string;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: MiniChartSlotProps;
}

const minimumBarShare = 0.04;

function toBarShares(data: readonly number[]) {
    const max = Math.max(0, ...data);
    return data.map((value) => (max > 0 ? Math.max(0, value) / max : 0));
}

/** A line spans the range between the lowest and the highest value, with some room at the top and bottom for the points. */
function toLineShares(data: readonly number[]) {
    const min = Math.min(...data);
    const range = Math.max(...data) - min;
    return data.map((value) => (range > 0 ? 0.1 + ((value - min) / range) * 0.8 : 0.5));
}

/**
 * A trend at a glance: bars or a line without axes or grid. Only the last value and deviations stand out.
 */
export const MiniChart = forwardRef<HTMLDivElement, MiniChartProps>(function MiniChart(
    { data, variant = "bars", highlightLast = true, highlighted = [], startLabel, endLabel, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: MiniChartOwnerState = { variant };
    const shares = variant === "bars" ? toBarShares(data) : toLineShares(data);
    const lastIndex = data.length - 1;
    const isMarked = (index: number) => highlighted.includes(index);
    const isLast = (index: number) => highlightLast && index === lastIndex;

    const plotProps = resolveSlotProps<MiniChartOwnerState, "div", "div">({
        ownProps: { className: styles.plot, "aria-hidden": true },
        slotProps: slotProps?.plot,
        ownerState,
    });
    const labelsProps = resolveSlotProps<MiniChartOwnerState, "div", "div">({
        ownProps: { className: styles.labels, "aria-hidden": true },
        slotProps: slotProps?.labels,
        ownerState,
    });

    const points = shares.map((share, index) => ({
        x: shares.length > 1 ? (index / (shares.length - 1)) * 100 : 50,
        y: (1 - share) * 100,
    }));

    return (
        <div role="img" {...restProps} ref={ref} data-variant={ownerState.variant} className={clsx(styles.root, className)}>
            <div {...plotProps}>
                {variant === "bars" ? (
                    shares.map((share, index) => (
                        <span
                            key={index}
                            className={styles.bar}
                            data-last={isLast(index) ? "" : undefined}
                            data-highlighted={isMarked(index) ? "" : undefined}
                            style={{ "--dextinity-mini-chart-bar-share": Math.max(share, minimumBarShare) } as CSSProperties}
                        />
                    ))
                ) : (
                    <>
                        <svg className={styles.line} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polyline points={points.map(({ x, y }) => `${x},${y}`).join(" ")} vectorEffect="non-scaling-stroke" />
                        </svg>
                        {points.map(({ x, y }, index) =>
                            isLast(index) || isMarked(index) ? (
                                <span
                                    key={index}
                                    className={styles.point}
                                    data-last={isLast(index) ? "" : undefined}
                                    data-highlighted={isMarked(index) ? "" : undefined}
                                    style={{ insetInlineStart: `${x}%`, insetBlockStart: `${y}%` }}
                                />
                            ) : null,
                        )}
                    </>
                )}
            </div>
            {(startLabel != null || endLabel != null) && (
                <div {...labelsProps}>
                    <span>{startLabel}</span>
                    <span>{endLabel}</span>
                </div>
            )}
        </div>
    );
});
