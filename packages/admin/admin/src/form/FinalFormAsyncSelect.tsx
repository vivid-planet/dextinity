import type { SelectProps } from "@mui/material";
import type { FieldRenderProps } from "react-final-form";

import { useAsyncOptionsProps } from "../hooks/useAsyncOptionsProps";
import { FinalFormSelect, type FinalFormSelectProps } from "./FinalFormSelect";

export interface FinalFormAsyncSelectProps<T> extends FinalFormSelectProps<T>, Omit<SelectProps, "input" | "variant"> {
    loadOptions: () => Promise<T[]>;
}

type FinalFormAsyncSelectInternalProps<T> = FieldRenderProps<T, HTMLInputElement | HTMLTextAreaElement>;
/**
 * Final Form-compatible AsyncSelect component.
 *
 * @see {@link AsyncSelectField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export function FinalFormAsyncSelect<T>({ loadOptions, ...rest }: FinalFormAsyncSelectProps<T> & FinalFormAsyncSelectInternalProps<T>) {
    return <FinalFormSelect<T> {...useAsyncOptionsProps(loadOptions)} {...rest} />;
}
