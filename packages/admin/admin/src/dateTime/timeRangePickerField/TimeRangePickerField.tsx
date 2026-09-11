import type { FieldRenderProps } from "react-final-form";

import { Field, type FieldProps } from "../../form/Field";
import { type TimeRange, TimeRangePicker, type TimeRangePickerProps } from "../timeRangePicker/TimeRangePicker";

const FinalFormTimeRangePicker = ({ meta, input, ...restProps }: TimeRangePickerProps & FieldRenderProps<TimeRange, HTMLInputElement>) => {
    return <TimeRangePicker {...input} {...restProps} />;
};

export type TimeRangePickerFieldProps = FieldProps<TimeRange, HTMLInputElement>;

/**
 * A Final Form field wrapper for the TimeRangePicker component. This integrates the TimeRangePicker with react-final-form,
 * providing automatic form state management, validation, and error handling.
 *
 * Use this component when working with Final Form. For standalone usage, use `TimeRangePicker` instead.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-datetime-timerangepickerfield--docs)
 */
export const TimeRangePickerField = (props: TimeRangePickerFieldProps) => {
    return <Field component={FinalFormTimeRangePicker} {...props} />;
};
