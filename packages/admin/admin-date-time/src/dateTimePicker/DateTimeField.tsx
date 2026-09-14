import { Field, type FieldProps } from "@dextinity/admin";

import { FinalFormDateTimePicker, type FinalFormDateTimePickerProps } from "./FinalFormDateTimePicker";

export type DateTimeFieldProps = FieldProps<Date, HTMLInputElement> & FinalFormDateTimePickerProps;

/**
 * @deprecated Use `DateTimePickerField` from `@dextinity/admin` instead.
 */
export const DateTimeField = ({ ...restProps }: DateTimeFieldProps) => {
    return <Field component={FinalFormDateTimePicker} {...restProps} />;
};
