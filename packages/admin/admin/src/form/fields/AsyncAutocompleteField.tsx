import type { AutocompleteProps } from "@mui/material";

import { Field, type FieldProps } from "../Field";
import { FinalFormAsyncAutocomplete } from "../FinalFormAsyncAutocomplete";

export type AsyncAutocompleteFieldProps<
    T extends Record<string, any>,
    Multiple extends boolean | undefined,
    FreeSolo extends boolean | undefined,
> = FieldProps<T, HTMLInputElement | HTMLTextAreaElement> & {
    loadOptions: (search?: string) => Promise<T[]>;
} & Omit<AutocompleteProps<T, Multiple, true, FreeSolo>, "options" | "renderInput" | "disableClearable"> & {
        clearable?: boolean;
    };

export function AsyncAutocompleteField<
    T extends Record<string, any>,
    Multiple extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false,
>(props: AsyncAutocompleteFieldProps<T, Multiple, FreeSolo>) {
    return <Field component={FinalFormAsyncAutocomplete} {...props} />;
}
