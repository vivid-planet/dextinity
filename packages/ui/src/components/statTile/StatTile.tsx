import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import type { IconName } from "../icon/iconRegistry";
import styles from "./StatTile.module.scss";

export type StatTileTrend = "up" | "down" | "flat";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type StatTileOwnerState = {
    trend: StatTileTrend | undefined;
};

export interface StatTileSlotProps {
    /** Props for the `value` slot, the row with the number, the unit, and the trend. */
    value?: SlotPropsValue<StatTileOwnerState, "div">;
    /** Props for the `number` slot. */
    number?: SlotPropsValue<StatTileOwnerState, "span">;
    /** Props for the `unit` slot. */
    unit?: SlotPropsValue<StatTileOwnerState, "span">;
    /** Props for the `trend` slot. */
    trend?: SlotPropsValue<StatTileOwnerState, "span">;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<StatTileOwnerState, "span">;
    /** Props for the `context` slot. */
    context?: SlotPropsValue<StatTileOwnerState, "div">;
}

export interface StatTileLabels {
    /** Announced for an upward trend. */
    trendUp: string;
    /** Announced for a downward trend. */
    trendDown: string;
    /** Announced for a flat trend. */
    trendFlat: string;
}

const defaultLabels: StatTileLabels = {
    trendUp: "Rising",
    trendDown: "Falling",
    trendFlat: "Steady",
};

const trendIcon: Record<StatTileTrend, IconName> = {
    up: "trend-up",
    down: "trend-down",
    flat: "arrow-right",
};

const trendLabelKey: Record<StatTileTrend, keyof StatTileLabels> = {
    up: "trendUp",
    down: "trendDown",
    flat: "trendFlat",
};

export interface StatTileProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The number, formatted by the application, e.g. `79` or `"1.2k"`. */
    value: number | string;
    /** What is counted, e.g. "Changes live". */
    label: string;
    /** The unit, shown small after the value, e.g. "ms" or "%". */
    unit?: string;
    /** A line below, e.g. a status or a comparison with the previous period. */
    context?: ReactNode;
    /** The direction of the change. Only show it when the direction means something. */
    trend?: StatTileTrend;
    /** Built-in text for assistive technology. */
    labels?: Partial<StatTileLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: StatTileSlotProps;
}

/**
 * One metric with its unit and context. A number without context says nothing, so give a period or a comparison.
 */
export const StatTile = forwardRef<HTMLDivElement, StatTileProps>(function StatTile(
    { value, label, unit, context, trend, labels: labelsProp, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: StatTileOwnerState = { trend };
    const labels = { ...defaultLabels, ...labelsProp };

    const valueProps = resolveSlotProps<StatTileOwnerState, "div", "div">({
        ownProps: { className: styles.value },
        slotProps: slotProps?.value,
        ownerState,
    });
    const numberProps = resolveSlotProps<StatTileOwnerState, "span", "span">({
        ownProps: { className: styles.number },
        slotProps: slotProps?.number,
        ownerState,
    });
    const unitProps = resolveSlotProps<StatTileOwnerState, "span", "span">({
        ownProps: { className: styles.unit },
        slotProps: slotProps?.unit,
        ownerState,
    });
    const trendProps = resolveSlotProps<StatTileOwnerState, "span", "span">({
        ownProps: { className: styles.trend },
        slotProps: slotProps?.trend,
        ownerState,
    });
    const labelProps = resolveSlotProps<StatTileOwnerState, "span", "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const contextProps = resolveSlotProps<StatTileOwnerState, "div", "div">({
        ownProps: { className: styles.context },
        slotProps: slotProps?.context,
        ownerState,
    });

    return (
        <div {...restProps} ref={ref} data-trend={ownerState.trend} className={clsx(styles.root, className)}>
            <div {...valueProps}>
                <span {...numberProps}>{value}</span>
                {unit != null && <span {...unitProps}>{unit}</span>}
                {trend != null && (
                    <span {...trendProps}>
                        <Icon name={trendIcon[trend]} aria-label={labels[trendLabelKey[trend]]} />
                    </span>
                )}
            </div>
            <span {...labelProps}>{label}</span>
            {context != null && <div {...contextProps}>{context}</div>}
        </div>
    );
});
