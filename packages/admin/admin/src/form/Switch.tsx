import MuiSwitch, { type SwitchProps } from "@mui/material/Switch";
import type { FieldRenderProps } from "react-final-form";

export type FinalFormSwitchProps = SwitchProps;
type FinalFormSwitchInternalProps = FieldRenderProps<string, HTMLInputElement>;

/**
 * Final Form-compatible Switch component.
 *
 * @see {@link SwitchField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export const FinalFormSwitch = ({
    input: { checked, name, onChange, ...restInput },
    meta,
    ...rest
}: FinalFormSwitchProps & FinalFormSwitchInternalProps) => {
    return <MuiSwitch {...rest} name={name} inputProps={restInput} onChange={onChange} checked={checked} />;
};
