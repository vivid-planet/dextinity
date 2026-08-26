import type { FieldRenderProps } from "react-final-form";

import { Field, type FieldProps } from "../../form/Field";
import { type DateTimeRange, DateTimeRangePicker, type DateTimeRangePickerProps } from "../dateTimeRangePicker/DateTimeRangePicker";

const FinalFormDateTimeRangePicker = ({
    meta,
    input,
    ...restProps
}: DateTimeRangePickerProps & FieldRenderProps<DateTimeRange, HTMLInputElement>) => {
    return <DateTimeRangePicker {...input} {...restProps} />;
};

export type DateTimeRangePickerFieldProps = FieldProps<DateTimeRange, HTMLInputElement>;

/**
 * A Final Form field wrapper for the DateTimeRangePicker component. This integrates the DateTimeRangePicker with react-final-form,
 * providing automatic form state management, validation, and error handling.
 *
 * Use this component when working with Final Form. For standalone usage, use `DateTimeRangePicker` instead.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-datetime-datetimerangepickerfield--docs)
 */
export const DateTimeRangePickerField = (props: DateTimeRangePickerFieldProps) => {
    return <Field component={FinalFormDateTimeRangePicker} {...props} />;
};
