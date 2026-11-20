import { FinalFormAutocomplete, type FinalFormAutocompleteProps } from "../Autocomplete";
import { Field, type FieldProps } from "../Field";

export type AutocompleteFieldProps<
    T extends Record<string, any>,
    Multiple extends boolean | undefined,
    FreeSolo extends boolean | undefined,
> = FieldProps<T, HTMLInputElement | HTMLTextAreaElement> & FinalFormAutocompleteProps<T, Multiple, FreeSolo>;

export function AutocompleteField<
    T extends Record<string, any>,
    Multiple extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false,
>(props: AutocompleteFieldProps<T, Multiple, FreeSolo>) {
    return <Field component={FinalFormAutocomplete} {...props} />;
}
