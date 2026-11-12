import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Tooltip, type TooltipProps } from "../tooltip/Tooltip";
import styles from "./SaveState.module.scss";

export type SaveStateValue = "saved" | "dirty" | "saving" | "error";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type SaveStateOwnerState = {
    state: SaveStateValue;
};

export interface SaveStateSlotProps {
    /** Props for the `dot` slot. */
    dot?: SlotPropsValue<SaveStateOwnerState, "span">;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<SaveStateOwnerState, "span">;
    /** Props for the tooltip that shows when the content was saved. */
    tooltip?: Partial<Omit<TooltipProps, "children" | "content" | "open" | "onOpenChange">>;
}

export interface SaveStateLabels {
    /** Shown when everything is saved. */
    saved: string;
    /** Shown when there are unsaved changes. */
    dirty: string;
    /** Shown while saving is in progress. */
    saving: string;
    /** Shown when saving failed. */
    error: string;
    /** The tooltip with the time of the last save. `{time}` is replaced with the relative time, e.g. "2 minutes ago". */
    savedAt: string;
}

const defaultLabels: SaveStateLabels = {
    saved: "All changes saved",
    dirty: "Unsaved changes",
    saving: "Saving …",
    error: "Not saved",
    savedAt: "Saved {time}",
};

export interface SaveStateProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> {
    /** Whether everything is saved, there are unsaved changes, saving is in progress, or saving failed. */
    state: SaveStateValue;
    /** The time of the last save, shown as "Saved 2 minutes ago" in the tooltip. */
    savedAt?: Date;
    /**
     * The locale of the relative time in the tooltip.
     *
     * @defaultValue `"en"`
     */
    locale?: string;
    /** The texts of the states and the tooltip. */
    labels?: Partial<SaveStateLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: SaveStateSlotProps;
}

const relativeTimeUnits: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
];

function formatRelativeTime(date: Date, locale: string) {
    const seconds = Math.round((date.getTime() - Date.now()) / 1000);
    const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    for (const [unit, unitSeconds] of relativeTimeUnits) {
        if (Math.abs(seconds) >= unitSeconds) {
            return format.format(Math.round(seconds / unitSeconds), unit);
        }
    }
    return format.format(0, "second");
}

/**
 * Shows in the page header of an edit page whether everything is saved. Quiet while saved, it stands out with unsaved changes and errors.
 */
export const SaveState = forwardRef<HTMLSpanElement, SaveStateProps>(function SaveState(
    { state, savedAt, locale = "en", labels: labelsProp, className, slotProps, ...restProps },
    ref,
) {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const ownerState: SaveStateOwnerState = { state };
    const labels = { ...defaultLabels, ...labelsProp };

    const dotProps = resolveSlotProps<SaveStateOwnerState, "span", "span">({
        ownProps: { className: styles.dot, "aria-hidden": true },
        slotProps: slotProps?.dot,
        ownerState,
    });
    const labelProps = resolveSlotProps<SaveStateOwnerState, "span", "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });

    const root = (
        <span
            role="status"
            tabIndex={savedAt != null ? 0 : undefined}
            {...restProps}
            ref={ref}
            data-state={ownerState.state}
            className={clsx(styles.root, className)}
        >
            <span {...dotProps} />
            <span {...labelProps}>{labels[ownerState.state]}</span>
        </span>
    );

    if (savedAt == null) {
        return root;
    }

    return (
        <Tooltip
            {...slotProps?.tooltip}
            open={tooltipOpen}
            onOpenChange={setTooltipOpen}
            content={labels.savedAt.replace("{time}", formatRelativeTime(savedAt, locale))}
        >
            {root}
        </Tooltip>
    );
});
