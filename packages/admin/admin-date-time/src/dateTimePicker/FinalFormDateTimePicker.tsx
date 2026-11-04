import type { FieldRenderProps } from "react-final-form";

import { DateTimePicker, type DateTimePickerProps } from "./DateTimePicker";

export type FinalFormDateTimePickerProps = DateTimePickerProps;
type FinalFormDateTimePickerInternalProps = FieldRenderProps<Date, HTMLInputElement | HTMLTextAreaElement>;

/**
 * @deprecated Use `DateTimePickerField` from `@dextinity/admin` instead.
 *
 * Final Form-compatible DateTimePicker component.
 *
 * @see {@link DateTimeField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export const FinalFormDateTimePicker = ({ meta, input, ...restProps }: FinalFormDateTimePickerProps & FinalFormDateTimePickerInternalProps) => {
    return <DateTimePicker {...input} {...restProps} />;
};
