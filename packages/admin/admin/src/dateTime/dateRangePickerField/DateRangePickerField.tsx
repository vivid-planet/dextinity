import type { FieldRenderProps } from "react-final-form";

import { Field, type FieldProps } from "../../form/Field";
import { type DateRange, DateRangePicker, type DateRangePickerProps } from "../dateRangePicker/DateRangePicker";

const FinalFormDateRangePicker = ({ meta, input, ...restProps }: DateRangePickerProps & FieldRenderProps<DateRange, HTMLInputElement>) => {
    return <DateRangePicker {...input} {...restProps} />;
};

export type DateRangePickerFieldProps = FieldProps<DateRange, HTMLInputElement>;

/**
 * A Final Form field wrapper for the DateRangePicker component. This integrates the DateRangePicker with react-final-form,
 * providing automatic form state management, validation, and error handling.
 *
 * Use this component when working with Final Form. For standalone usage, use `DateRangePicker` instead.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-datetime-daterangepickerfield--docs)
 */
export const DateRangePickerField = (props: DateRangePickerFieldProps) => {
    return <Field component={FinalFormDateRangePicker} {...props} />;
};
