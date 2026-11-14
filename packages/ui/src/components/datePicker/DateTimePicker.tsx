import { clsx } from "clsx";
import { forwardRef, type KeyboardEvent, useCallback, useId, useRef, useState } from "react";

import { ControlFrame, type PureControlProps, useControlState } from "../field/ControlFrame";
import type { FieldOwnerState } from "../field/Field";
import { Icon } from "../icon/Icon";
import { CalendarPopover } from "./CalendarPopover";
import { type DatePickerCalendarProps, type DatePickerLabels, defaultDatePickerLabels } from "./DatePicker";
import styles from "./DateTimePicker.module.scss";
import { formatDate, formatTime, type IsoDate, joinDateTime, localeWeekStart, parseTime, splitDateTime, type TimeOfDay } from "./dateValues";
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
    /** Texts of the inputs, the buttons, and the calendar, for translation. */
    labels?: Partial<DateTimePickerLabels>;
}

/**
 * A day and a time of day, typed in the locale's format or chosen in a calendar and a list of times. Choosing a day keeps the time; without
 * one, the time is midnight. Typed text is read on blur or Enter; text that can't be read, or a day outside `min` and `max`, stays in its
 * input with an error and leaves the value unchanged until it is corrected.
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
        locale,
        weekStartsOn,
        clearable = false,
        placeholder,
        timePlaceholder,
        timeStep = 15,
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
    const { disabled, readOnly } = useControlState(disabledProp, readOnlyProp);
    const editable = !disabled && !readOnly;

    const change = (date: IsoDate | null, nextTime: TimeOfDay | null) => {
        setPendingTime(null);
        onChange(date == null ? null : joinDateTime(date, nextTime ?? midnight));
    };

    const dateDraft = useTextDraft(current == null ? "" : formatDate(current.date, locale), (text) => {
        const typed = readTypedDay(text, { locale, min, max, labels });
        if (typed.error != null) {
            return typed.error;
        }
        change(typed.day, typed.day == null ? null : time);
    });
    const timeDraft = useTextDraft(time == null ? "" : formatTime(time, locale), (text) => {
        if (text.trim() === "" && current == null) {
            setPendingTime(null);
            return;
        }
        const parsed = text.trim() === "" ? midnight : parseTime(text);
        if (parsed == null) {
            return invalidTimeMessage(locale, labels);
        }
        if (current == null) {
            setPendingTime(parsed);
        } else {
            change(current.date, parsed);
        }
    });

    const draftError = dateDraft.error ?? timeDraft.error;

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
        if (current == null) {
            setPendingTime(nextTime);
        } else {
            change(current.date, nextTime);
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
                        start={current?.date ?? null}
                        end={null}
                        range={false}
                        onSelect={(day) => {
                            dateDraft.reset();
                            change(day, time);
                            setOpen(false);
                        }}
                        min={min}
                        max={max}
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
