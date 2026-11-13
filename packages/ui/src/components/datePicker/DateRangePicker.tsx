import { clsx } from "clsx";
import { forwardRef, type KeyboardEvent, useCallback, useId, useRef, useState } from "react";

import { ControlFrame, type PureControlProps, useControlState } from "../field/ControlFrame";
import type { FieldOwnerState } from "../field/Field";
import { Icon } from "../icon/Icon";
import { CalendarPopover } from "./CalendarPopover";
import { type DatePickerCalendarProps, type DatePickerLabels, defaultDatePickerLabels } from "./DatePicker";
import styles from "./DateRangePicker.module.scss";
import { formatDate, isIsoDate, type IsoDate, localeWeekStart } from "./dateValues";
import { readTypedDay } from "./typedDay";
import { useTextDraft } from "./useTextDraft";

/**
 * A range of days as `YYYY-MM-DD`, both ends inclusive. An end is `null` while it isn't set.
 */
export interface DateRange {
    start: string | null;
    end: string | null;
}

/**
 * Texts of the date range picker, for translation.
 */
export interface DateRangePickerLabels extends DatePickerLabels {
    /** Accessible name of the start input, read after the field's label. */
    start: string;
    /** Accessible name of the end input, read after the field's label. */
    end: string;
}

const defaultLabels: DateRangePickerLabels = { ...defaultDatePickerLabels, openCalendar: "Choose dates", start: "Start", end: "End" };

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type DateRangePickerOwnerState = FieldOwnerState & {
    clearable: boolean;
};

export interface DateRangePickerProps extends DatePickerCalendarProps, PureControlProps {
    /** Field name. Describes the data, not the UI. */
    name: string;
    /** The range, or `null` for none. Always controlled. */
    value: DateRange | null;
    /** Called with the new range, or `null` when both ends are removed; set `value` from it. A range never ends before it starts. */
    onChange: (value: DateRange | null) => void;
    /** Shown in each input while it is empty, e.g. the expected format. */
    placeholder?: string;
    /**
     * How many months the calendar shows side by side.
     *
     * @defaultValue `2`
     */
    months?: 1 | 2;
    /** Texts of the inputs, the buttons, and the calendar, for translation. */
    labels?: Partial<DateRangePickerLabels>;
}

function toRange(start: IsoDate | null, end: IsoDate | null): DateRange | null {
    if (start == null && end == null) {
        return null;
    }
    return start != null && end != null && end < start ? { start: end, end: start } : { start, end };
}

/**
 * A range of days, typed in the locale's format or chosen in a calendar: the first click chooses the start, the second the end. Typed
 * text is read on blur or Enter; text that is no valid day, or lies outside `min` and `max`, stays in its input with an error and leaves
 * the value unchanged until it is corrected.
 */
export const DateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(function DateRangePicker(
    {
        disabled: disabledProp,
        readOnly: readOnlyProp,
        name,
        value,
        onChange,
        min,
        max,
        locale,
        weekStartsOn,
        clearable = false,
        placeholder,
        months = 2,
        labels: labelsProp,
        id,
        className,
        style,
        ...ariaProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const generatedId = useId();
    const startLabelId = `${generatedId}start`;
    const endLabelId = `${generatedId}end`;
    const [open, setOpen] = useState(false);
    // The start chosen in the calendar, until the end is chosen too
    const [pendingStart, setPendingStart] = useState<IsoDate | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const setInputRef = useCallback(
        (element: HTMLInputElement | null) => {
            inputRef.current = element;
            if (typeof ref === "function") {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
        },
        [ref],
    );

    const start = value != null && isIsoDate(value.start) ? value.start : null;
    const end = value != null && isIsoDate(value.end) ? value.end : null;
    const { disabled, readOnly } = useControlState(disabledProp, readOnlyProp);
    const editable = !disabled && !readOnly;

    const readDay = (text: string, apply: (day: IsoDate | null) => void) => {
        const typed = readTypedDay(text, { locale, min, max, labels });
        if (typed.error != null) {
            return typed.error;
        }
        apply(typed.day);
    };
    const startDraft = useTextDraft(start == null ? "" : formatDate(start, locale), (text) => readDay(text, (day) => onChange(toRange(day, end))));
    const endDraft = useTextDraft(end == null ? "" : formatDate(end, locale), (text) => readDay(text, (day) => onChange(toRange(start, day))));

    const draftError = startDraft.error ?? endDraft.error;

    const onKeyDown = (draft: typeof startDraft) => (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            draft.commit();
        } else if (event.key === "Escape") {
            draft.reset();
        } else if (event.key === "ArrowDown" && event.altKey && editable) {
            event.preventDefault();
            draft.commit();
            setOpen(true);
        }
    };

    return (
        <ControlFrame
            controlName="DateRangePicker"
            {...ariaProps}
            id={id}
            disabled={disabledProp}
            readOnly={readOnlyProp}
            error={draftError}
            className={className}
            style={style}
        >
            {(control, { nameId }) => (
                <>
                    <span id={startLabelId} hidden>
                        {labels.start}
                    </span>
                    <span id={endLabelId} hidden>
                        {labels.end}
                    </span>
                    <input
                        {...control}
                        ref={setInputRef}
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        className={styles.input}
                        value={startDraft.text}
                        placeholder={placeholder}
                        aria-labelledby={clsx(nameId, startLabelId)}
                        onChange={startDraft.onChange}
                        onBlur={startDraft.commit}
                        onKeyDown={onKeyDown(startDraft)}
                    />
                    <Icon name="arrow-right" className={styles.separator} />
                    <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        className={styles.input}
                        value={endDraft.text}
                        placeholder={placeholder}
                        disabled={control.disabled}
                        readOnly={control.readOnly}
                        aria-labelledby={clsx(nameId, endLabelId)}
                        aria-describedby={control["aria-describedby"]}
                        aria-invalid={control["aria-invalid"]}
                        aria-required={control["aria-required"]}
                        onChange={endDraft.onChange}
                        onBlur={endDraft.commit}
                        onKeyDown={onKeyDown(endDraft)}
                    />
                    <input type="hidden" name={`${name}.start`} value={start ?? ""} />
                    <input type="hidden" name={`${name}.end`} value={end ?? ""} />
                    {clearable && editable && (start != null || end != null) && (
                        <button
                            type="button"
                            className={styles.clear}
                            aria-label={labels.clear}
                            onClick={() => {
                                startDraft.reset();
                                endDraft.reset();
                                onChange(null);
                                inputRef.current?.focus();
                            }}
                        >
                            <Icon name="close" />
                        </button>
                    )}
                    <CalendarPopover
                        open={open}
                        onOpenChange={(nextOpen) => {
                            startDraft.commit();
                            endDraft.commit();
                            setPendingStart(null);
                            setOpen(nextOpen);
                        }}
                        triggerLabel={labels.openCalendar}
                        triggerClassName={styles.trigger}
                        disabled={!editable}
                        finalFocus={inputRef}
                        labelledBy={nameId}
                        start={pendingStart ?? start}
                        end={pendingStart == null ? end : null}
                        range
                        onSelect={(day) => {
                            if (pendingStart == null) {
                                setPendingStart(day);
                                return;
                            }
                            startDraft.reset();
                            endDraft.reset();
                            setPendingStart(null);
                            onChange(toRange(pendingStart, day));
                            setOpen(false);
                        }}
                        min={min}
                        max={max}
                        locale={locale}
                        weekStartsOn={weekStartsOn ?? localeWeekStart(locale)}
                        months={months}
                        showToday={false}
                        labels={labels}
                    />
                </>
            )}
        </ControlFrame>
    );
});
