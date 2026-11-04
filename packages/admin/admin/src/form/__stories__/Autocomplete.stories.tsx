import { Form } from "react-final-form";

import { Button } from "../../common/buttons/Button";
import { FinalFormAutocomplete } from "../../form/Autocomplete";
import { Field } from "../../form/Field";
import { FinalFormSelect } from "../../form/FinalFormSelect";
import { useAsyncOptionsProps } from "../../hooks/useAsyncOptionsProps";

interface Option {
    value: string;
    label: string;
}

const options: Option[] = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
];

const initialValues = {
    autocomplete: { value: "strawberry", label: "Strawberry" },
    autocompleteAsync: { value: "strawberry", label: "Strawberry" },
    select: { value: "strawberry", label: "Strawberry" },
    selectAsync: { value: "strawberry", label: "Strawberry" },
    selectAsyncMultiple: [
        { value: "strawberry", label: "Strawberry" },
        { value: "chocolate", label: "Chocolate" },
    ],
};

export default {
    title: "components/form",
};

export const AutocompleteAsyncSelect = {
    render: () => {
        const acAsyncProps = useAsyncOptionsProps<Option>(async () => {
            return new Promise((resolve) => setTimeout(() => resolve(options), 500));
        });
        const selectAsyncProps = useAsyncOptionsProps<Option>(async () => {
            return new Promise((resolve) => setTimeout(() => resolve(options), 500));
        });
        const selectAsyncMultipleProps = useAsyncOptionsProps<Option>(async () => {
            return new Promise((resolve) => setTimeout(() => resolve(options), 500));
        });
        return (
            <div style={{ maxWidth: "800px" }}>
                <p>
                    FinalFormAutocomplete provides a select with a search field. It can also be used asynchronously with the
                    useAsyncOptionsProps-Hook. It expects the value to be an object to be able to display the current value without having to load the
                    async options.
                </p>
                <p>Furthermore FinalFormSelect can also be used like FinalFormAutocomplete (e.g. when no search field is needed).</p>
                <div style={{ width: "300px" }}>
                    <Form
                        mode="edit"
                        onSubmit={(values) => {
                            alert(JSON.stringify(values, null, 4));
                        }}
                        initialValues={initialValues}
                        render={({ handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <Field
                                    component={FinalFormAutocomplete}
                                    getOptionLabel={(option: Option) => option.label}
                                    getOptionSelected={(option: Option, value: Option) => {
                                        return option.value === value.value;
                                    }}
                                    options={options}
                                    name="autocomplete"
                                    label="Autocomplete"
                                    fullWidth
                                />
                                <Field
                                    component={FinalFormAutocomplete}
                                    {...acAsyncProps}
                                    getOptionLabel={(option: Option) => option.label}
                                    getOptionSelected={(option: Option, value: Option) => {
                                        return option.value === value.value;
                                    }}
                                    name="autocompleteAsync"
                                    label="AutocompleteAsync"
                                    fullWidth
                                />
                                <Field
                                    component={FinalFormSelect}
                                    getOptionLabel={(option: Option) => option.label}
                                    getOptionSelected={(option: Option, value: Option) => {
                                        return option.value === value.value;
                                    }}
                                    options={options}
                                    name="select"
                                    label="Select"
                                    fullWidth
                                />
                                <Field
                                    component={FinalFormSelect}
                                    getOptionLabel={(option: Option) => option.label}
                                    getOptionSelected={(option: Option, value: Option) => {
                                        return option.value === value.value;
                                    }}
                                    {...selectAsyncProps}
                                    name="selectAsync"
                                    label="SelectAsync"
                                    fullWidth
                                />
                                <Field
                                    component={FinalFormSelect}
                                    getOptionLabel={(option: Option) => option.label}
                                    getOptionSelected={(option: Option, value: Option) => {
                                        return option.value === value.value;
                                    }}
                                    {...selectAsyncMultipleProps}
                                    name="selectAsyncMultiple"
                                    label="SelectAsyncMultiple"
                                    multiple
                                    fullWidth
                                />
                                <Button type="submit">Submit</Button>
                            </form>
                        )}
                    />
                </div>
            </div>
        );
    },

    name: "Autocomplete / Async Select",
};
