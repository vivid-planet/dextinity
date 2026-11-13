import { forwardRef, type KeyboardEvent, useCallback, useRef, useState } from "react";

import { ControlFrame, type PureControlProps, useControlState } from "../field/ControlFrame";
import type { FieldOwnerState } from "../field/Field";
import { Icon } from "../icon/Icon";
import { type CalendarLabels, defaultCalendarLabels } from "./Calendar";
import { CalendarPopover } from "./CalendarPopover";
import styles from "./DatePicker.module.scss";
import { formatDate, isIsoDate, localeWeekStart } from "./dateValues";
import { type DateInputErrorLabels, defaultDateInputErrorLabels, readTypedDay } from "./typedDay";
import { useTextDraft } from "./useTextDraft";

/**
 * Texts of the date picker, for translation.
 */
export interface DatePickerLabels extends CalendarLabels, DateInputErrorLabels {
    /** Accessible name of the button that opens the calendar. */
    openCalendar: string;
    /** Accessible name of the button that removes the value. */
    clear: string;
}

export const defaultDatePickerLabels: DatePickerLabels = {
    ...defaultCalendarLabels,
    ...defaultDateInputErrorLabels,
    openCalendar: "Choose date",
    clear: "Clear",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type DatePickerOwnerState = FieldOwnerState & {
    clearable: boolean;
};

/**
 * The calendar options shared by the date pickers.
 */
export interface DatePickerCalendarProps {
    /** The earliest day that can be chosen, as `YYYY-MM-DD`. */
    min?: string;
    /** The latest day that can be chosen, as `YYYY-MM-DD`. */
    max?: string;
    /**
     * The locale that formats and reads typed dates, and names months and weekdays, e.g. `de-AT`.
     *
     * @defaultValue the browser's locale
     */
    locale?: string;
    /**
     * The first day of the week in the calendar, 0 for Sunday to 6 for Saturday.
     *
     * @defaultValue the locale's, or Monday where the browser doesn't tell
     */
    weekStartsOn?: number;
    /**
     * Shows a button that removes the value while there is one.
     *
     * @defaultValue `false`
     */
    clearable?: boolean;
}

export interface DatePickerProps extends DatePickerCalendarProps, PureControlProps {
    /** Field name. Describes the data, not the UI. */
    name: string;
    /** The day as `YYYY-MM-DD`, or `null` for none. A day has no time zone, so it never shifts. Always controlled. */
    value: string | null;
    /** Called with the chosen day as `YYYY-MM-DD`, or `null` when the value is removed; set `value` from it. */
    onChange: (value: string | null) => void;
    /** Shown while there is no value, e.g. the expected format. */
    placeholder?: string;
    /** Texts of the buttons and the calendar, for translation. */
    labels?: Partial<DatePickerLabels>;
}

/**
 * A day, typed in the locale's format or chosen in a calendar. Typed text is read on blur or Enter; text that is no valid day, or lies
 * outside `min` and `max`, stays in the field with an error and leaves the value unchanged until it is corrected.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
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
        labels: labelsProp,
        id,
        className,
        style,
        ...ariaProps
    },
    ref,
) {
    const labels = { ...defaultDatePickerLabels, ...labelsProp };
    const [open, setOpen] = useState(false);
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

    const date = isIsoDate(value) ? value : null;
    const draft = useTextDraft(date == null ? "" : formatDate(date, locale), (text) => {
        const typed = readTypedDay(text, { locale, min, max, labels });
        if (typed.error != null) {
            return typed.error;
        }
        onChange(typed.day);
    });
    const { disabled, readOnly } = useControlState(disabledProp, readOnlyProp);
    const editable = !disabled && !readOnly;

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
        <ControlFrame {...ariaProps} id={id} disabled={disabledProp} readOnly={readOnlyProp} error={draft.error} className={className} style={style}>
            {(control, { nameId }) => (
                <>
                    <input
                        {...control}
                        ref={setInputRef}
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        className={styles.input}
                        value={draft.text}
                        placeholder={placeholder}
                        onChange={draft.onChange}
                        onBlur={draft.commit}
                        onKeyDown={onKeyDown}
                    />
                    <input type="hidden" name={name} value={date ?? ""} />
                    {clearable && editable && date != null && (
                        <button
                            type="button"
                            className={styles.clear}
                            aria-label={labels.clear}
                            onClick={() => {
                                draft.reset();
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
                            draft.commit();
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
                            draft.reset();
                            onChange(day);
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
        </ControlFrame>
    );
});
