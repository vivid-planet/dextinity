import { clsx } from "clsx";
import { forwardRef, type KeyboardEvent, useCallback, useEffect, useId, useRef, useState } from "react";

import { ControlFrame, type PureControlProps, useControlState } from "../field/ControlFrame";
import type { FieldOwnerState } from "../field/Field";
import { Icon } from "../icon/Icon";
import { CalendarPopover } from "./CalendarPopover";
import { type DatePickerCalendarProps, type DatePickerLabels, defaultDatePickerLabels } from "./DatePicker";
import styles from "./DateTimePicker.module.scss";
import {
    formatDate,
    formatTime,
    type IsoDate,
    joinDateTime,
    localeWeekStart,
    parseTime,
    splitDateTime,
    type TimeOfDay,
    toIsoTime,
} from "./dateValues";
import { TimePopover } from "./TimePopover";
import { invalidTimeMessage, readTypedDay } from "./typedDay";
import { useTextDraft } from "./useTextDraft";

/**
 * Texts of the date and time picker, for translation.
 */
export interface DateTimePickerLabels extends DatePickerLabels {
    /** Accessible name of the time input, read after the field's label. */
    time: string;
    /** Accessible name of the button that opens the list of times. */
    openTimeList: string;
}

const defaultLabels: DateTimePickerLabels = { ...defaultDatePickerLabels, time: "Time", openTimeList: "Choose time" };

const midnight: TimeOfDay = { hours: 0, minutes: 0 };

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type DateTimePickerOwnerState = FieldOwnerState & {
    clearable: boolean;
};

export interface DateTimePickerProps extends DatePickerCalendarProps, PureControlProps {
    /** Field name. Describes the data, not the UI. */
    name: string;
    /**
     * The instant as an ISO 8601 date-time, e.g. `2026-11-06T08:30:00.000Z`, or `null` for none. It is shown and edited in the local time
     * zone. Always controlled.
     */
    value: string | null;
    /** Called with the new instant as an ISO 8601 date-time in UTC, or `null` when the value is removed; set `value` from it. */
    onChange: (value: string | null) => void;
    /** Shown in the date input while there is no value, e.g. the expected format. */
    placeholder?: string;
    /** Shown in the time input while there is no value. */
    timePlaceholder?: string;
    /**
     * Minutes between two times in the list of times. Any other time can still be typed.
     *
     * @defaultValue `15`
     */
    timeStep?: number;
    /**
     * Disables times of a day, e.g. outside office hours. Called with the time as `HH:mm` and the local day as `YYYY-MM-DD`, so each day
     * can have its own times. A `value` it disables shows no error; validate the value in the form.
     */
    isTimeDisabled?: (time: string, date: string) => boolean;
    /** Texts of the inputs, the buttons, and the calendar, for translation. */
    labels?: Partial<DateTimePickerLabels>;
}

/**
 * A day and a time of day, typed in the locale's format or chosen in a calendar and a list of times. Choosing a day keeps the time; without
 * one, the time is midnight. Typed text is read on blur or Enter; text that can't be read, or a day or time that can't be chosen, stays in
 * its input with an error and leaves the value unchanged until it is corrected. A typed time that can't be chosen is checked again when
 * the day changes. A kept time that can't be chosen on the new day shows an error too, until the time is changed or `isTimeDisabled`
 * allows it; without a time, a day on which midnight can't be chosen waits for a time without an error.
 */
export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(function DateTimePicker(
    {
        disabled: disabledProp,
        readOnly: readOnlyProp,
        name,
        value,
        onChange,
        min,
        max,
        isDateDisabled,
        locale,
        weekStartsOn,
        clearable = false,
        placeholder,
        timePlaceholder,
        timeStep = 15,
        isTimeDisabled,
        labels: labelsProp,
        id,
        className,
        style,
        ...ariaProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const timeLabelId = `${useId()}time`;
    const [open, setOpen] = useState(false);
    const [timeListOpen, setTimeListOpen] = useState(false);
    // A time typed before there is a day, used once a day is chosen
    const [pendingTime, setPendingTime] = useState<TimeOfDay | null>(null);
    // A day chosen while the kept time is disabled on it, used once an allowed time is set
    const [pendingDay, setPendingDay] = useState<{ date: IsoDate; value: string | null } | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const timeInputRef = useRef<HTMLInputElement>(null);
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

    const current = splitDateTime(value);
    const time = current?.time ?? pendingTime;
    if (pendingDay != null && pendingDay.value !== value) {
        setPendingDay(null);
    }
    const pendingDate = pendingDay?.date ?? null;
    const date = pendingDate ?? current?.date ?? null;
    const { disabled, readOnly } = useControlState(disabledProp, readOnlyProp);
    const editable = !disabled && !readOnly;

    const isTimeDisabledOn = (day: IsoDate, timeOfDay: TimeOfDay) => isTimeDisabled?.(toIsoTime(timeOfDay), day) === true;

    const change = (day: IsoDate | null, nextTime: TimeOfDay | null) => {
        setPendingTime(null);
        setPendingDay(null);
        onChange(day == null ? null : joinDateTime(day, nextTime ?? midnight));
    };

    const timeDraft = useTextDraft(time == null ? "" : formatTime(time, locale), (text) => {
        if (text.trim() === "" && date == null) {
            setPendingTime(null);
            return;
        }
        const parsed = text.trim() === "" ? midnight : parseTime(text);
        if (parsed == null) {
            return invalidTimeMessage(locale, labels);
        }
        if (date == null) {
            setPendingTime(parsed);
        } else if (isTimeDisabledOn(date, parsed)) {
            return labels.timeDisabled(formatTime(parsed, locale));
        } else {
            change(date, parsed);
        }
    });

    const rejectedTimeAllowedOn = (day: IsoDate) => {
        const rejectedTime = timeDraft.error == null ? null : parseTime(timeDraft.text);
        return rejectedTime != null && !isTimeDisabledOn(day, rejectedTime) ? rejectedTime : null;
    };

    const chooseDay = (day: IsoDate | null) => {
        if (day == null) {
            change(null, null);
            return;
        }
        const rejectedTime = rejectedTimeAllowedOn(day);
        if (rejectedTime != null) {
            timeDraft.reset();
            change(day, rejectedTime);
        } else if (isTimeDisabledOn(day, time ?? midnight)) {
            setPendingDay({ date: day, value });
        } else {
            change(day, time);
        }
    };

    const dateDraft = useTextDraft(date == null ? "" : formatDate(date, locale), (text) => {
        const typed = readTypedDay(text, { locale, min, max, isDateDisabled, labels });
        if (typed.error != null) {
            return typed.error;
        }
        chooseDay(typed.day);
    });

    const isPendingDayAllowed = pendingDate != null && !isTimeDisabledOn(pendingDate, time ?? midnight);
    useEffect(() => {
        if (isPendingDayAllowed) {
            change(pendingDate, time);
        }
    });

    const keptTimeError =
        pendingDate != null && time != null && isTimeDisabledOn(pendingDate, time) ? labels.timeDisabled(formatTime(time, locale)) : undefined;
    const draftError = dateDraft.error ?? timeDraft.error ?? keptTimeError;

    const onKeyDown = (draft: typeof dateDraft, openPopup: (open: boolean) => void) => (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            draft.commit();
        } else if (event.key === "Escape") {
            draft.reset();
        } else if (event.key === "ArrowDown" && event.altKey && editable) {
            event.preventDefault();
            draft.commit();
            openPopup(true);
        }
    };

    const chooseTime = (nextTime: TimeOfDay) => {
        timeDraft.reset();
        if (date == null) {
            setPendingTime(nextTime);
        } else {
            change(date, nextTime);
        }
        setTimeListOpen(false);
    };

    return (
        <ControlFrame
            controlName="DateTimePicker"
            {...ariaProps}
            id={id}
            disabled={disabledProp}
            readOnly={readOnlyProp}
            error={draftError}
            errorInput={dateDraft.error != null ? inputRef : timeInputRef}
            className={className}
            style={style}
        >
            {(control, { nameId }) => (
                <>
                    <input
                        {...control}
                        ref={setInputRef}
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        className={styles.dateInput}
                        value={dateDraft.text}
                        placeholder={placeholder}
                        onChange={dateDraft.onChange}
                        onBlur={dateDraft.commit}
                        onKeyDown={onKeyDown(dateDraft, setOpen)}
                    />
                    <CalendarPopover
                        open={open}
                        onOpenChange={(nextOpen) => {
                            dateDraft.commit();
                            timeDraft.commit();
                            setOpen(nextOpen);
                        }}
                        triggerLabel={labels.openCalendar}
                        triggerClassName={styles.trigger}
                        disabled={!editable}
                        finalFocus={inputRef}
                        labelledBy={nameId}
                        start={date}
                        end={null}
                        range={false}
                        onSelect={(day) => {
                            dateDraft.reset();
                            chooseDay(day);
                            setOpen(false);
                        }}
                        min={min}
                        max={max}
                        isDateDisabled={isDateDisabled}
                        locale={locale}
                        weekStartsOn={weekStartsOn ?? localeWeekStart(locale)}
                        months={1}
                        showToday
                        labels={labels}
                    />
                    <span className={styles.separator} aria-hidden />
                    <span id={timeLabelId} hidden>
                        {labels.time}
                    </span>
                    <input
                        ref={timeInputRef}
                        type="text"
                        autoComplete="off"
                        className={styles.timeInput}
                        value={timeDraft.text}
                        placeholder={timePlaceholder}
                        disabled={control.disabled}
                        readOnly={control.readOnly}
                        aria-labelledby={clsx(nameId, timeLabelId)}
                        aria-describedby={control["aria-describedby"]}
                        aria-invalid={control["aria-invalid"]}
                        onChange={timeDraft.onChange}
                        onBlur={timeDraft.commit}
                        onKeyDown={onKeyDown(timeDraft, setTimeListOpen)}
                    />
                    <TimePopover
                        open={timeListOpen}
                        onOpenChange={(nextOpen) => {
                            dateDraft.commit();
                            timeDraft.commit();
                            setTimeListOpen(nextOpen);
                        }}
                        value={time}
                        onSelect={chooseTime}
                        isTimeDisabled={(timeOfDay) => date != null && isTimeDisabledOn(date, timeOfDay)}
                        step={timeStep}
                        locale={locale}
                        triggerLabel={labels.openTimeList}
                        triggerClassName={styles.trigger}
                        disabled={!editable}
                        finalFocus={timeInputRef}
                        labelledBy={clsx(nameId, timeLabelId)}
                    />
                    <input type="hidden" name={name} value={current == null ? "" : (value ?? "")} />
                    {clearable && editable && current != null && (
                        <button
                            type="button"
                            className={styles.clear}
                            aria-label={labels.clear}
                            onClick={() => {
                                dateDraft.reset();
                                timeDraft.reset();
                                change(null, null);
                                inputRef.current?.focus();
                            }}
                        >
                            <Icon name="close" />
                        </button>
                    )}
                </>
            )}
        </ControlFrame>
    );
});
