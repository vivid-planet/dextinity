import type { FieldRenderProps } from "react-final-form";

import { FinalFormAutocomplete, type FinalFormAutocompleteProps } from "./Autocomplete";
import { useAsyncAutocompleteOptionsProps } from "./useAsyncAutocompleteOptionsProps";

export interface FinalFormAsyncAutocompleteProps<
    T extends Record<string, any>,
    Multiple extends boolean | undefined,
    FreeSolo extends boolean | undefined,
> extends FinalFormAutocompleteProps<T, Multiple, FreeSolo> {
    loadOptions: () => Promise<T[]>;
}

type FinalFormAsyncAutocompleteInternalProps<T extends Record<string, any>> = FieldRenderProps<T, HTMLInputElement | HTMLTextAreaElement>;

/**
 * Final Form-compatible AsyncAutocomplete component.
 *
 * @see {@link AsyncAutocompleteField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export function FinalFormAsyncAutocomplete<
    T extends Record<string, any>,
    Multiple extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false,
>({ loadOptions, ...rest }: FinalFormAsyncAutocompleteProps<T, Multiple, FreeSolo> & FinalFormAsyncAutocompleteInternalProps<T>) {
    return (
        <FinalFormAutocomplete<T, Multiple, FreeSolo>
            {...useAsyncAutocompleteOptionsProps(loadOptions)}
            // disable the built-in filtering of the Autocomplete component by overriding the filterOptions prop when search as you type
            // see: https://mui.com/material-ui/react-autocomplete/#search-as-you-type
            filterOptions={(x) => x}
            {...rest}
        />
    );
}
