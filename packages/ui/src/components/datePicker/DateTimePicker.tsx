import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type KeyboardEvent, useCallback, useId, useRef, useState } from "react";

import { Field, type FieldBaseProps, type FieldOwnerState, type FieldProps } from "../field/Field";
import { Icon } from "../icon/Icon";
import { CalendarPopover } from "./CalendarPopover";
import { type DatePickerCalendarProps, type DatePickerLabels, defaultDatePickerLabels } from "./DatePicker";
import styles from "./DateTimePicker.module.scss";
import {
    formatDate,
    formatTime,
    type IsoDate,
    isWithin,
    joinDateTime,
    localeWeekStart,
    parseDate,
    parseTime,
    splitDateTime,
    type TimeOfDay,
} from "./dateValues";
import { useTextDraft } from "./useTextDraft";

/**
 * Texts of the date and time picker, for translation.
 */
export interface DateTimePickerLabels extends DatePickerLabels {
    /** Accessible name of the time input, read after the field's label. */
    time: string;
}

const defaultLabels: DateTimePickerLabels = { ...defaultDatePickerLabels, time: "Time" };

const midnight: TimeOfDay = { hours: 0, minutes: 0 };

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type DateTimePickerOwnerState = FieldOwnerState & {
    clearable: boolean;
};

export interface DateTimePickerProps
    extends
        FieldBaseProps,
        DatePickerCalendarProps,
        Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "prefix" | "onChange" | "defaultValue"> {
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
    /** Texts of the inputs, the buttons, and the calendar, for translation. */
    labels?: Partial<DateTimePickerLabels>;
    /** The id of the date input, used to connect it with the label. */
    id?: string;
    /** Added alongside the component's own classes, on the root. */
    className?: string;
    /** Props for each slot of the field frame, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldProps["slotProps"];
}

/**
 * A day and a time of day, typed in the locale's format or with the day chosen in a calendar. Choosing a day keeps the time; without
 * one, the time is midnight. Typed text is read on blur or Enter; text that can't be read is discarded.
 */
export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(function DateTimePicker(
    {
        label,
        required,
        helperText,
        validationMessage,
        state,
        disabled = false,
        readOnly = false,
        loading,
        size,
        prefix,
        suffix,
        actions,
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
        labels: labelsProp,
        id,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const timeLabelId = `${useId()}time`;
    const [open, setOpen] = useState(false);
    // A time typed before there is a day, used once a day is chosen
    const [pendingTime, setPendingTime] = useState<TimeOfDay | null>(null);
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

    const current = splitDateTime(value);
    const time = current?.time ?? pendingTime;
    const editable = !disabled && !readOnly;

    const change = (date: IsoDate | null, nextTime: TimeOfDay | null) => {
        if (date == null) {
            setPendingTime(null);
            onChange(null);
        } else {
            onChange(joinDateTime(date, nextTime ?? midnight));
        }
    };

    const dateDraft = useTextDraft(current == null ? "" : formatDate(current.date, locale), (text) => {
        if (text.trim() === "") {
            change(null, null);
            return;
        }
        const parsed = parseDate(text, locale);
        if (parsed != null && isWithin(parsed, min, max)) {
            change(parsed, time);
        }
    });
    const timeDraft = useTextDraft(time == null ? "" : formatTime(time, locale), (text) => {
        if (text.trim() === "" && current == null) {
            setPendingTime(null);
            return;
        }
        const parsed = text.trim() === "" ? midnight : parseTime(text);
        if (parsed == null) {
            return;
        }
        if (current == null) {
            setPendingTime(parsed);
        } else {
            change(current.date, parsed);
        }
    });

    const onKeyDown = (draft: typeof dateDraft) => (event: KeyboardEvent<HTMLInputElement>) => {
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
        <Field
            {...restProps}
            className={clsx(styles.root, className)}
            data-clearable={clearable ? "" : undefined}
            controlId={id}
            label={label}
            required={required}
            helperText={helperText}
            validationMessage={validationMessage}
            state={state}
            disabled={disabled}
            readOnly={readOnly}
            loading={loading}
            size={size}
            prefix={prefix}
            suffix={suffix}
            actions={actions}
            slotProps={slotProps}
        >
            {(control) => (
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
                        onKeyDown={onKeyDown(dateDraft)}
                    />
                    <span className={styles.separator} aria-hidden />
                    <span id={timeLabelId} hidden>
                        {labels.time}
                    </span>
                    <input
                        type="text"
                        autoComplete="off"
                        className={styles.timeInput}
                        value={timeDraft.text}
                        placeholder={timePlaceholder}
                        disabled={control.disabled}
                        readOnly={control.readOnly}
                        aria-labelledby={`${control["aria-labelledby"]} ${timeLabelId}`}
                        aria-describedby={control["aria-describedby"]}
                        aria-invalid={control["aria-invalid"]}
                        onChange={timeDraft.onChange}
                        onBlur={timeDraft.commit}
                        onKeyDown={onKeyDown(timeDraft)}
                    />
                    <input type="hidden" name={name} value={current == null ? "" : joinDateTime(current.date, current.time)} />
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
                        labelledBy={control["aria-labelledby"]}
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
                </>
            )}
        </Field>
    );
});
