import { Field, type FieldProps } from "@dextinity/admin";

import { FinalFormDatePicker, type FinalFormDatePickerProps } from "./FinalFormDatePicker";

export type DateFieldProps = FieldProps<Date, HTMLInputElement> & FinalFormDatePickerProps;

/**
 * @deprecated Use `DatePickerField` from `@dextinity/admin` instead.
 */
export const DateField = ({ ...restProps }: DateFieldProps) => {
    return <Field component={FinalFormDatePicker} {...restProps} />;
};
