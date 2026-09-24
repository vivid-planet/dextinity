import { FormControlLabel, type FormControlLabelProps } from "@mui/material";
import type { ReactNode } from "react";

import { FinalFormCheckbox, type FinalFormCheckboxProps } from "../Checkbox";
import { Field, type FieldProps } from "../Field";

export interface CheckboxFieldProps extends FieldProps<string, HTMLInputElement> {
    checkboxLabel?: ReactNode;
    componentsProps?: {
        formControlLabel?: FormControlLabelProps;
        finalFormCheckbox?: FinalFormCheckboxProps;
    };
}

export const CheckboxField = ({ checkboxLabel, componentsProps = {}, ...restProps }: CheckboxFieldProps) => {
    const { formControlLabel: formControlLabelProps, finalFormCheckbox: finalFormCheckboxProps } = componentsProps;
    return (
        <Field type="checkbox" {...restProps}>
            {(props) => (
                <FormControlLabel
                    label={checkboxLabel}
                    control={<FinalFormCheckbox {...props} {...finalFormCheckboxProps} />}
                    {...formControlLabelProps}
                />
            )}
        </Field>
    );
};
