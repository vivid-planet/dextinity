import type { DatePickerLabels, DateRangePickerLabels, DateTimePickerLabels } from "@dextinity/ui";
import { useMemo } from "react";
import { useIntl } from "react-intl";

/**
 * Translated `labels` for a `DatePicker` of `@dextinity/ui` or its `DateField`: the calendar's buttons and the messages for typed text
 * that isn't a day or lies outside `min` and `max`.
 */
export function useDatePickerLabels(): DatePickerLabels {
    const intl = useIntl();
    return useMemo(
        () => ({
            openCalendar: intl.formatMessage({ id: "dextinity.datePicker.openCalendar", defaultMessage: "Choose date" }),
            clear: intl.formatMessage({ id: "dextinity.datePicker.clear", defaultMessage: "Clear" }),
            previousMonth: intl.formatMessage({ id: "dextinity.datePicker.previousMonth", defaultMessage: "Previous month" }),
            nextMonth: intl.formatMessage({ id: "dextinity.datePicker.nextMonth", defaultMessage: "Next month" }),
            previousYear: intl.formatMessage({ id: "dextinity.datePicker.previousYear", defaultMessage: "Previous year" }),
            nextYear: intl.formatMessage({ id: "dextinity.datePicker.nextYear", defaultMessage: "Next year" }),
            chooseMonth: intl.formatMessage({ id: "dextinity.datePicker.chooseMonth", defaultMessage: "Choose month and year" }),
            year: intl.formatMessage({ id: "dextinity.datePicker.year", defaultMessage: "Year" }),
            today: intl.formatMessage({ id: "dextinity.datePicker.today", defaultMessage: "Today" }),
            invalidDate: (example) =>
                intl.formatMessage({ id: "dextinity.datePicker.invalidDate", defaultMessage: "Enter a date like {example}." }, { example }),
            dateOutOfRange: (min, max) => {
                if (min != null && max != null) {
                    return intl.formatMessage(
                        { id: "dextinity.datePicker.dateOutOfRange.between", defaultMessage: "Choose a date from {min} to {max}." },
                        { min, max },
                    );
                }
                if (min != null) {
                    return intl.formatMessage({ id: "dextinity.datePicker.dateOutOfRange.min", defaultMessage: "Choose {min} or later." }, { min });
                }
                return intl.formatMessage({ id: "dextinity.datePicker.dateOutOfRange.max", defaultMessage: "Choose {max} or earlier." }, { max });
            },
            invalidTime: (example) =>
                intl.formatMessage({ id: "dextinity.datePicker.invalidTime", defaultMessage: "Enter a time like {example}." }, { example }),
        }),
        [intl],
    );
}

/**
 * Translated `labels` for a `DateTimePicker` of `@dextinity/ui` or its `DateTimeField`.
 */
export function useDateTimePickerLabels(): DateTimePickerLabels {
    const intl = useIntl();
    const datePickerLabels = useDatePickerLabels();
    return useMemo(
        () => ({
            ...datePickerLabels,
            time: intl.formatMessage({ id: "dextinity.dateTimePicker.time", defaultMessage: "Time" }),
            openTimeList: intl.formatMessage({ id: "dextinity.dateTimePicker.openTimeList", defaultMessage: "Choose time" }),
        }),
        [datePickerLabels, intl],
    );
}

/**
 * Translated `labels` for a `DateRangePicker` of `@dextinity/ui` or its `DateRangeField`. Spread them before labels of the field's own,
 * e.g. a more specific `start` and `end`.
 */
export function useDateRangePickerLabels(): DateRangePickerLabels {
    const intl = useIntl();
    const datePickerLabels = useDatePickerLabels();
    return useMemo(
        () => ({
            ...datePickerLabels,
            openCalendar: intl.formatMessage({ id: "dextinity.dateRangePicker.openCalendar", defaultMessage: "Choose dates" }),
            start: intl.formatMessage({ id: "dextinity.dateRangePicker.start", defaultMessage: "Start" }),
            end: intl.formatMessage({ id: "dextinity.dateRangePicker.end", defaultMessage: "End" }),
        }),
        [datePickerLabels, intl],
    );
}
