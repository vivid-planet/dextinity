import { Field, type FieldProps } from "@dextinity/admin";

import { FinalFormColorPicker, type FinalFormColorPickerProps } from "./FinalFormColorPicker";

export type ColorFieldProps = FieldProps<string, HTMLInputElement> & FinalFormColorPickerProps;

export const ColorField = ({ ...restProps }: ColorFieldProps) => {
    return <Field component={FinalFormColorPicker} {...restProps} />;
};
