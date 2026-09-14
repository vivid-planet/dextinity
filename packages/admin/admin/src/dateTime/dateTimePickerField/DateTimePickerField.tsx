import type { FieldRenderProps } from "react-final-form";

import { Field, type FieldProps } from "../../form/Field";
import { DateTimePicker as DateTimePicker, type DateTimePickerProps as DateTimePickerProps } from "../dateTimePicker/DateTimePicker";

const FinalFormDateTimePicker = ({ meta, input, ...restProps }: DateTimePickerProps & FieldRenderProps<Date, HTMLInputElement>) => {
    return <DateTimePicker {...input} {...restProps} />;
};

export type DateTimePickerFieldProps = FieldProps<Date, HTMLInputElement>;

/**
 * A Final Form field wrapper for the DateTimePicker component. This integrates the DateTimePicker with react-final-form,
 * providing automatic form state management, validation, and error handling.
 *
 * Use this component when working with Final Form. For standalone usage, use `DateTimePicker` instead.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-datetime-datetimepickerfield--docs)
 */
export const DateTimePickerField = (props: DateTimePickerFieldProps) => {
    return <Field component={FinalFormDateTimePicker} {...props} />;
};
