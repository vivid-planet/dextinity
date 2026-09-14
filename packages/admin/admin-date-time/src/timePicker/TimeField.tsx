import { Field, type FieldProps } from "@dextinity/admin";

import { FinalFormTimePicker, type FinalFormTimePickerProps } from "./FinalFormTimePicker";

export type TimeFieldProps = FieldProps<string, HTMLInputElement> & FinalFormTimePickerProps;

/**
 * @deprecated Use `TimePickerField` from `@dextinity/admin` instead.
 */
export const TimeField = ({ ...restProps }: TimeFieldProps) => {
    return <Field component={FinalFormTimePicker} {...restProps} />;
};
