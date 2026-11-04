import { Field, type FieldProps } from "@dextinity/admin";

import { FinalFormTimeRangePicker, type FinalFormTimeRangePickerProps } from "./FinalFormTimeRangePicker";
import type { TimeRange } from "./TimeRangePicker";

export type TimeRangeFieldProps = FieldProps<TimeRange, HTMLInputElement> & FinalFormTimeRangePickerProps;

/**
 * @deprecated Use `TimeRangePickerField` from `@dextinity/admin` instead.
 */
export const TimeRangeField = ({ ...restProps }: TimeRangeFieldProps) => {
    return <Field component={FinalFormTimeRangePicker} {...restProps} />;
};
