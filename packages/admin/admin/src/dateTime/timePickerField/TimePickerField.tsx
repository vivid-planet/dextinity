import type { FieldRenderProps } from "react-final-form";

import { Field, type FieldProps } from "../../form/Field";
import { TimePicker as TimePicker, type TimePickerProps as TimePickerProps } from "../timePicker/TimePicker";

const FinalFormTimePicker = ({ meta, input, ...restProps }: TimePickerProps & FieldRenderProps<string, HTMLInputElement>) => {
    return <TimePicker {...input} {...restProps} />;
};

export type TimePickerFieldProps = FieldProps<string, HTMLInputElement>;

/**
 * A Final Form field wrapper for the TimePicker component. This integrates the TimePicker with react-final-form,
 * providing automatic form state management, validation, and error handling.
 *
 * Use this component when working with Final Form. For standalone usage, use `TimePicker` instead.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-datetime-timepickerfield--docs)
 */
export const TimePickerField = (props: TimePickerFieldProps) => {
    return <Field component={FinalFormTimePicker} {...props} />;
};
