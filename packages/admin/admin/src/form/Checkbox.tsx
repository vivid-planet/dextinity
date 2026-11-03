import MuiCheckbox, { type CheckboxProps } from "@mui/material/Checkbox";
import { mergeSlotProps } from "@mui/material/utils";
import type { FieldRenderProps } from "react-final-form";

export type FinalFormCheckboxProps = CheckboxProps;

type FinalFormCheckboxInternalProps = FieldRenderProps<string, HTMLInputElement>;

/**
 * Final Form-compatible Checkbox component.
 *
 * @see {@link CheckboxField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export const FinalFormCheckbox = ({
    input: { checked, name, onChange, ...restInput },
    meta,
    ...rest
}: FinalFormCheckboxProps & FinalFormCheckboxInternalProps) => {
    return (
        <MuiCheckbox
            {...rest}
            name={name}
            onChange={onChange}
            checked={checked}
            slotProps={{
                ...rest.slotProps,
                input: mergeSlotProps(rest.slotProps?.input, restInput),
            }}
        />
    );
};
