import { Field, type FieldProps } from "@dextinity/admin";

import type { DateRange } from "./DateRangePicker";
import { FinalFormDateRangePicker, type FinalFormDateRangePickerProps } from "./FinalFormDateRangePicker";

export type DateRangeFieldProps = FieldProps<DateRange, HTMLInputElement> & FinalFormDateRangePickerProps;

/**
 * @deprecated Use `DateRangePickerField` from `@dextinity/admin` instead.
 */
export const DateRangeField = ({ ...restProps }: DateRangeFieldProps) => {
    return <Field component={FinalFormDateRangePicker} {...restProps} />;
};
