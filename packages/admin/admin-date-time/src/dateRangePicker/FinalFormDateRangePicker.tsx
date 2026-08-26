import type { FieldRenderProps } from "react-final-form";

import { type DateRange, DateRangePicker, type DateRangePickerProps } from "./DateRangePicker";

export type FinalFormDateRangePickerProps = DateRangePickerProps;
type FinalFormDateRangePickerInternalProps = FieldRenderProps<DateRange, HTMLInputElement | HTMLTextAreaElement>;

/**
 * @deprecated Use `DateRangePickerField` from `@dextinity/admin` instead.
 *
 * Final Form-compatible DateRangerPicker component.
 *
 * @see {@link DateRangeField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export const FinalFormDateRangePicker = ({ meta, input, ...restProps }: FinalFormDateRangePickerProps & FinalFormDateRangePickerInternalProps) => {
    return <DateRangePicker {...input} {...restProps} />;
};
