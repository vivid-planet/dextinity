import type { FieldRenderProps } from "react-final-form";

import { type TimeRange, TimeRangePicker, type TimeRangePickerProps } from "./TimeRangePicker";

export type FinalFormTimeRangePickerProps = TimeRangePickerProps;
type FinalFormTimeRangePickerInternalProps = FieldRenderProps<TimeRange, HTMLInputElement | HTMLTextAreaElement>;

/**
 * @deprecated Use `TimeRangePickerField` from `@dextinity/admin` instead.
 *
 * Final Form-compatible TimeRangePicker component.
 *
 * @see {@link TimeRangeField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export const FinalFormTimeRangePicker = ({ meta, input, ...restProps }: FinalFormTimeRangePickerProps & FinalFormTimeRangePickerInternalProps) => {
    return <TimeRangePicker {...input} {...restProps} />;
};
