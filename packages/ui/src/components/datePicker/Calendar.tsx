import { clsx } from "clsx";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { Icon } from "../icon/Icon";
import styles from "./Calendar.module.scss";
import {
    addDays,
    addMonths,
    clampDate,
    endOfMonth,
    endOfWeek,
    formatDate,
    type IsoDate,
    isWithin,
    monthWeeks,
    startOfMonth,
    startOfWeek,
    today as getToday,
} from "./dateValues";

/**
 * Texts of the calendar, for translation.
 */
export interface CalendarLabels {
    /** Accessible name of the button that shows the previous month. */
    previousMonth: string;
    /** Accessible name of the button that shows the next month. */
    nextMonth: string;
    /** Accessible name of the button that shows the previous year while choosing a month. */
    previousYear: string;
    /** Accessible name of the button that shows the next year while choosing a month. */
    nextYear: string;
    /** Accessible description of the heading, which switches to choosing a month. */
    chooseMonth: string;
    /** The button that chooses today. */
    today: string;
}

export const defaultCalendarLabels: CalendarLabels = {
    previousMonth: "Previous month",
    nextMonth: "Next month",
    previousYear: "Previous year",
    nextYear: "Next year",
    chooseMonth: "Choose month and year",
    today: "Today",
};

export interface CalendarProps {
    /** The chosen day, or the start of the chosen range. */
    start: IsoDate | null;
    /** The end of the chosen range; always `null` for a single day. */
    end: IsoDate | null;
    /** Chooses a range: the first click sets the start, the second the end, with a preview in between. */
    range: boolean;
    /** Called with the day the user chose. */
    onSelect: (date: IsoDate) => void;
    min: IsoDate | undefined;
    max: IsoDate | undefined;
    locale: string | undefined;
    weekStartsOn: number;
    /** How many months are shown side by side. */
    months: number;
    /** Shows a button that chooses today. */
    showToday: boolean;
    labels: CalendarLabels;
}

type CalendarView = "days" | "months";

function monthKey(date: IsoDate) {
    return date.slice(0, 7);
}

/**
 * The month grid inside the date pickers' popup. Arrow keys move by day and week, Home and End to the start and end of the week, Page
 * Up and Page Down by month, and with Shift by year.
 */
export function Calendar({ start, end, range, onSelect, min, max, locale, weekStartsOn, months, showToday, labels }: CalendarProps) {
    const today = getToday();
    const [focused, setFocused] = useState(() => clampDate(start ?? today, min, max));
    const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(focused));
    const [view, setView] = useState<CalendarView>("days");
    const [hovered, setHovered] = useState<IsoDate | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const moveFocusRef = useRef(false);
    const headingDescriptionId = `${useId()}heading`;

    const visibleMonths = Array.from({ length: months }, (_, index) => addMonths(visibleMonth, index));
    const lastVisibleMonth = visibleMonths[visibleMonths.length - 1];

    useEffect(() => {
        if (moveFocusRef.current) {
            moveFocusRef.current = false;
            rootRef.current?.querySelector<HTMLElement>("[data-focus-target]")?.focus();
        }
    }, [focused, visibleMonth, view]);

    const focusDate = (date: IsoDate) => {
        const next = clampDate(date, min, max);
        moveFocusRef.current = true;
        setFocused(next);
        if (next < visibleMonth) {
            setVisibleMonth(startOfMonth(next));
        } else if (next > endOfMonth(lastVisibleMonth)) {
            setVisibleMonth(startOfMonth(addMonths(next, -(months - 1))));
        }
    };

    const showMonths = (delta: number) => {
        const nextVisible = addMonths(visibleMonth, delta);
        setVisibleMonth(nextVisible);
        setFocused((current) => {
            const shifted = clampDate(addMonths(current, delta), min, max);
            const lastDay = endOfMonth(addMonths(nextVisible, months - 1));
            return shifted < nextVisible || shifted > lastDay ? clampDate(nextVisible, min, max) : shifted;
        });
    };

    const onGridKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
        const moves: Record<string, () => IsoDate> = {
            ArrowLeft: () => addDays(focused, -1),
            ArrowRight: () => addDays(focused, 1),
            ArrowUp: () => addDays(focused, -7),
            ArrowDown: () => addDays(focused, 7),
            Home: () => startOfWeek(focused, weekStartsOn),
            End: () => endOfWeek(focused, weekStartsOn),
            PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
            PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
        };
        const move = moves[event.key];
        if (move) {
            event.preventDefault();
            focusDate(move());
        }
    };

    const previewEnd = range && start != null && end == null ? hovered : null;
    const rangeEnd = end ?? previewEnd;
    const [rangeLow, rangeHigh] = start != null && rangeEnd != null ? [start, rangeEnd].sort() : [start, start];

    const monthTitle = (month: IsoDate) => formatDate(month, locale, { year: "numeric", month: "long", day: undefined });
    const yearTitle = formatDate(visibleMonth, locale, { year: "numeric", month: undefined, day: undefined });
    const headingFormat = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", timeZone: "UTC" });
    const heading =
        view === "months"
            ? yearTitle
            : months > 1
              ? headingFormat.formatRange(new Date(`${visibleMonth}T00:00:00Z`), new Date(`${lastVisibleMonth}T00:00:00Z`))
              : monthTitle(visibleMonth);

    const weekdays = Array.from({ length: 7 }, (_, index) => addDays(startOfWeek("2026-11-02", weekStartsOn), index)).map((day) => ({
        short: formatDate(day, locale, { weekday: "short", year: undefined, month: undefined, day: undefined }),
        long: formatDate(day, locale, { weekday: "long", year: undefined, month: undefined, day: undefined }),
    }));

    const step = view === "months" ? 12 : 1;
    const canGoBack = min == null || (view === "months" ? visibleMonth.slice(0, 4) > min.slice(0, 4) : monthKey(visibleMonth) > monthKey(min));
    const canGoForward = max == null || (view === "months" ? visibleMonth.slice(0, 4) < max.slice(0, 4) : monthKey(lastVisibleMonth) < monthKey(max));

    const renderDay = (day: IsoDate) => {
        const disabled = !isWithin(day, min, max);
        const selected = day === start || day === end;
        const isRangeStart = range && rangeEnd != null && day === rangeLow;
        const isRangeEnd = range && rangeEnd != null && day === rangeHigh;
        const inRange = range && rangeLow != null && rangeHigh != null && day > rangeLow && day < rangeHigh;
        return (
            <td
                key={day}
                role="gridcell"
                aria-selected={selected || inRange}
                className={clsx(styles.cell, inRange && styles.cellInRange, isRangeStart && styles.cellRangeStart, isRangeEnd && styles.cellRangeEnd)}
            >
                <button
                    type="button"
                    className={styles.day}
                    tabIndex={day === focused ? 0 : -1}
                    aria-label={formatDate(day, locale, { weekday: "long", month: "long", day: "numeric" })}
                    aria-disabled={disabled || undefined}
                    aria-current={day === today ? "date" : undefined}
                    data-focus-target={day === focused ? "" : undefined}
                    data-date={day}
                    data-selected={selected || isRangeStart || isRangeEnd ? "" : undefined}
                    data-in-range={inRange ? "" : undefined}
                    data-today={day === today ? "" : undefined}
                    data-disabled={disabled ? "" : undefined}
                    onClick={() => {
                        if (!disabled) {
                            setFocused(day);
                            onSelect(day);
                        }
                    }}
                    onFocus={() => setHovered(day)}
                    onMouseEnter={() => setHovered(day)}
                >
                    {Number(day.slice(8))}
                </button>
            </td>
        );
    };

    const monthButtons = Array.from({ length: 12 }, (_, index) => `${visibleMonth.slice(0, 4)}-${String(index + 1).padStart(2, "0")}-01`);

    return (
        <div ref={rootRef} className={styles.root} data-range={range ? "" : undefined} data-view={view}>
            <div className={styles.header}>
                <button
                    type="button"
                    className={styles.navButton}
                    aria-label={view === "months" ? labels.previousYear : labels.previousMonth}
                    disabled={!canGoBack}
                    onClick={() => showMonths(-step)}
                >
                    <Icon name="chevron-left" />
                </button>
                <button
                    type="button"
                    className={styles.heading}
                    aria-live="polite"
                    aria-describedby={headingDescriptionId}
                    aria-expanded={view === "months"}
                    onClick={() => {
                        moveFocusRef.current = view === "months";
                        setView(view === "months" ? "days" : "months");
                    }}
                >
                    {heading}
                    <Icon name="chevron-down" className={styles.headingIcon} />
                    <span id={headingDescriptionId} hidden>
                        {labels.chooseMonth}
                    </span>
                </button>
                <button
                    type="button"
                    className={styles.navButton}
                    aria-label={view === "months" ? labels.nextYear : labels.nextMonth}
                    disabled={!canGoForward}
                    onClick={() => showMonths(step)}
                >
                    <Icon name="chevron-right" />
                </button>
            </div>
            {view === "months" ? (
                <div className={styles.monthList} role="group" aria-label={yearTitle}>
                    {monthButtons.map((month) => {
                        const disabled = (min != null && monthKey(month) < monthKey(min)) || (max != null && monthKey(month) > monthKey(max));
                        return (
                            <button
                                key={month}
                                type="button"
                                className={styles.month}
                                disabled={disabled}
                                aria-current={monthKey(month) === monthKey(visibleMonth) ? "true" : undefined}
                                data-focus-target={monthKey(month) === monthKey(visibleMonth) ? "" : undefined}
                                onClick={() => {
                                    const shifted = clampDate(`${monthKey(month)}-${focused.slice(8)}`, min, max);
                                    moveFocusRef.current = true;
                                    setVisibleMonth(month);
                                    setFocused(monthKey(shifted) === monthKey(month) ? shifted : clampDate(month, min, max));
                                    setView("days");
                                }}
                            >
                                {formatDate(month, locale, { month: "short", year: undefined, day: undefined })}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className={styles.months} onMouseLeave={() => setHovered(null)}>
                    {visibleMonths.map((month) => (
                        <div key={month} className={styles.monthPanel}>
                            {months > 1 && (
                                <div className={styles.monthTitle} aria-hidden>
                                    {monthTitle(month)}
                                </div>
                            )}
                            <table role="grid" className={styles.grid} aria-label={monthTitle(month)} onKeyDown={onGridKeyDown}>
                                <thead>
                                    <tr>
                                        {weekdays.map((weekday) => (
                                            <th key={weekday.long} scope="col" abbr={weekday.long} className={styles.weekday}>
                                                {weekday.short}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthWeeks(month, weekStartsOn).map((week, weekIndex) => (
                                        <tr key={weekIndex}>
                                            {week.map((day, dayIndex) =>
                                                day == null ? <td key={`empty${dayIndex}`} className={styles.cell} /> : renderDay(day),
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
            {showToday && view === "days" && (
                <div className={styles.footer}>
                    <button type="button" className={styles.todayButton} disabled={!isWithin(today, min, max)} onClick={() => onSelect(today)}>
                        {labels.today}
                    </button>
                </div>
            )}
        </div>
    );
}
