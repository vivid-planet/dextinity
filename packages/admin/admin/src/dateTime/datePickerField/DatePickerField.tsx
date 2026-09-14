import type { FieldRenderProps } from "react-final-form";

import { Field, type FieldProps } from "../../form/Field";
import { DatePicker, type DatePickerProps } from "../datePicker/DatePicker";

type FinalFormDatePickerProps = DatePickerProps;
const FinalFormDatePicker = ({ meta, input, ...restProps }: FinalFormDatePickerProps & FieldRenderProps<string, HTMLInputElement>) => {
    return <DatePicker {...input} {...restProps} />;
};

export type DatePickerFieldProps = FinalFormDatePickerProps & FieldProps<string, HTMLInputElement>;

/**
 * A Final Form field wrapper for the DatePicker component. This integrates the DatePicker with react-final-form,
 * providing automatic form state management, validation, and error handling.
 *
 * Use this component when working with Final Form. For standalone usage, use `DatePicker` instead.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-datetime-datepickerfield--docs)
 */
export const DatePickerField = (props: DatePickerFieldProps) => {
    return <Field component={FinalFormDatePicker} {...props} />;
};
