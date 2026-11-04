import MuiRadio, { type RadioProps } from "@mui/material/Radio";
import type { FieldRenderProps } from "react-final-form";

export type FinalFormRadioProps = RadioProps & FieldRenderProps<string, HTMLInputElement>;

/**
 * Final Form-compatible RadioGroup component.
 *
 * @see {@link RadioGroupField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export const FinalFormRadio = ({ input: { checked, value, name, onChange, ...restInput }, meta, ...rest }: FinalFormRadioProps) => (
    <MuiRadio {...rest} name={name} inputProps={restInput} onChange={onChange} checked={!!checked} value={value} />
);
