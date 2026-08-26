import type { FieldRenderProps } from "react-final-form";

import { DatePicker as DatePicker, type DatePickerProps as DatePickerProps } from "./DatePicker";

export type FinalFormDatePickerProps = DatePickerProps;

type FinalFormDatePickerInternalProps = FieldRenderProps<string, HTMLInputElement | HTMLTextAreaElement>;

/**
 * @deprecated Use `DatePickerField` from `@dextinity/admin` instead.
 *
 * Final Form-compatible DatePicker component.
 *
 * @see {@link DateField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export const FinalFormDatePicker = ({ meta, input, ...restProps }: FinalFormDatePickerProps & FinalFormDatePickerInternalProps) => {
    return <DatePicker {...input} {...restProps} />;
};
