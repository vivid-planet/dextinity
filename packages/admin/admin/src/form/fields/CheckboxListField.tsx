import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import type { ReactNode } from "react";

import { Field, type FieldProps } from "../Field";

type CheckboxListFieldOption<Value extends string> = {
    label: ReactNode;
    value: Value;
    disabled?: boolean;
};

export type CheckboxListFieldProps<Value extends string> = FieldProps<[Value], HTMLInputElement> & {
    options: CheckboxListFieldOption<Value>[];
    layout?: "row" | "column";
};

export const CheckboxListField = <Value extends string>({ options, layout = "row", required, ...restProps }: CheckboxListFieldProps<Value>) => {
    return (
        <Field<[Value]> required={required} {...restProps}>
            {({ input: { value, onBlur, onFocus, onChange, name, ...restInput } }) => (
                <FormGroup row={layout === "row"} {...restInput}>
                    {options.map((option) => (
                        <FormControlLabel
                            key={option.value}
                            label={option.label}
                            value={option.value}
                            disabled={option.disabled}
                            name={name}
                            checked={value.includes(option.value)}
                            onChange={(_, checked) => {
                                if (checked) {
                                    onChange([...value, option.value]);
                                } else if (value.length > 1) {
                                    onChange(value.filter((v) => v !== option.value));
                                } else {
                                    onChange(undefined);
                                }
                            }}
                            control={<Checkbox />}
                        />
                    ))}
                </FormGroup>
            )}
        </Field>
    );
};
