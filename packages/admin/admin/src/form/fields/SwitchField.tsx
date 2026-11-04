import { FormControlLabel, type FormControlLabelProps } from "@mui/material";
import type { ReactNode } from "react";

import { Field, type FieldProps } from "../Field";
import { FinalFormSwitch, type FinalFormSwitchProps } from "../Switch";

export interface SwitchFieldProps extends Omit<FieldProps<string, HTMLInputElement>, "label"> {
    name: string;
    fieldLabel?: ReactNode;
    label?: ReactNode | ((checked?: boolean) => ReactNode);
    componentsProps?: {
        formControlLabel?: FormControlLabelProps;
        finalFormSwitch?: FinalFormSwitchProps;
    };
}

export const SwitchField = ({ fieldLabel, label, componentsProps = {}, ...restProps }: SwitchFieldProps) => {
    const { formControlLabel: formControlLabelProps, finalFormSwitch: finalFormSwitchProps } = componentsProps;
    return (
        <Field type="checkbox" label={fieldLabel} {...restProps}>
            {(props) => (
                <FormControlLabel
                    label={typeof label === "function" ? label(props.input.checked) : label}
                    control={<FinalFormSwitch {...props} {...finalFormSwitchProps} />}
                    {...formControlLabelProps}
                />
            )}
        </Field>
    );
};
