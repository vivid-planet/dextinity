import { Button, Field, FinalForm, FinalFormAsyncAutocomplete, FinalFormAutocomplete } from "@dextinity/admin";
import { useMemo } from "react";

interface Option {
    value: string;
    label: string;
}

export default {
    title: "Docs/Form/Components/FinalForm Fields/FinalForm Autocomplete",
};

export const Default = {
    render: () => {
        const options: Option[] = [
            { value: "chocolate", label: "Chocolate" },
            { value: "strawberry", label: "Strawberry" },
            { value: "vanilla", label: "Vanilla" },
        ];

        const initialValues = useMemo(
            // Why useMemo()?
            // FinalForm reinitializes the form every time initalValues changes. A shallow equality check is used.
            // Therefore, without useMemo() FinalForm would reinitialize on every render.
            // for alternative approaches to prevent this behavior, see https://final-form.org/docs/react-final-form/types/FormProps#initialvaluesequal
            //
            // In a real life application, useMemo() is probably not necessary:
            // Case 1: the initial values are provided via GraphQL API => GraphQL handles the state => useMemo() not necessary
            // Case 2: the initial values are hardcoded => hardcode them outside of React Component => useMemo() not necessary
            () => ({
                autocomplete: { value: "strawberry", label: "Strawberry" },
                autocompleteAsync: { value: "strawberry", label: "Strawberry" },
                autocompleteMultiple: [{ value: "strawberry", label: "Strawberry" }],
            }),
            [],
        );

        return (
            <FinalForm
                mode="add"
                onSubmit={(values) => {
                    alert(JSON.stringify(values, null, 4));
                }}
                initialValues={initialValues}
            >
                <Field
                    component={FinalFormAutocomplete}
                    getOptionLabel={(option: Option) => option.label}
                    isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                    options={options}
                    name="autocomplete"
                    label="Autocomplete"
                    fullWidth
                    required
                />
                <Field
                    component={FinalFormAutocomplete}
                    getOptionLabel={(option: Option) => option.label}
                    isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                    options={options}
                    name="autocompleteReadOnly"
                    label="Autocomplete (read only)"
                    fullWidth
                    readOnly
                />

                <Field
                    component={FinalFormAutocomplete}
                    getOptionLabel={(option: Option) => option.label}
                    isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                    options={options}
                    name="autocompleteDisabled"
                    label="Autocomplete (disabled)"
                    fullWidth
                    disabled
                />

                <Field
                    component={FinalFormAutocomplete}
                    getOptionLabel={(option: Option) => option.label}
                    isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                    options={options}
                    name="autocompleteOptional"
                    label="Autocomplete (optional)"
                    fullWidth
                />
                <Field
                    component={FinalFormAsyncAutocomplete}
                    loadOptions={async () => {
                        return new Promise((resolve) => setTimeout(() => resolve(options), 3000));
                    }}
                    getOptionLabel={(option: Option) => option.label}
                    isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                    name="autocompleteAsync"
                    label="AutocompleteAsync"
                    fullWidth
                    required
                />
                <Field
                    component={FinalFormAsyncAutocomplete}
                    loadOptions={async () => {
                        return new Promise((resolve) => setTimeout(() => resolve(options), 3000));
                    }}
                    getOptionLabel={(option: Option) => option.label}
                    isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                    name="autocompleteAsyncOptional"
                    label="AutocompleteAsync (optional)"
                    fullWidth
                />
                <Field
                    component={FinalFormAutocomplete}
                    multiple
                    getOptionLabel={(option: Option) => option.label}
                    isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                    options={options}
                    name="autocompleteMultiple"
                    label="Autocomplete multiple select"
                    fullWidth
                    required
                />
                <Field
                    component={FinalFormAutocomplete}
                    multiple
                    getOptionLabel={(option: Option) => option.label}
                    isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                    options={options}
                    name="autocompleteMultipleReadOnly"
                    label="Autocomplete multiple select (read only)"
                    fullWidth
                    required
                    defaultValue={initialValues.autocompleteMultiple}
                    readOnly
                />
                <Field
                    component={FinalFormAutocomplete}
                    multiple
                    getOptionLabel={(option: Option) => option.label}
                    isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                    options={options}
                    name="autocompleteMultipleDisabled"
                    label="Autocomplete multiple select (disabled)"
                    fullWidth
                    required
                    defaultValue={initialValues.autocompleteMultiple}
                    disabled
                />
                <Field
                    component={FinalFormAutocomplete}
                    multiple
                    getOptionLabel={(option: Option) => option.label}
                    isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                    options={options}
                    name="autocompleteMultipleOptional"
                    label="Autocomplete multiple select (optional)"
                    fullWidth
                />
                <Button type="submit">Submit</Button>
            </FinalForm>
        );
    },

    name: "FinalFormAutocomplete",
};
