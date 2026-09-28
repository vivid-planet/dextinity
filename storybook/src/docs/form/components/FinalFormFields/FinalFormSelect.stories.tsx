import { Button, Field, FinalForm, FinalFormAsyncSelect, FinalFormSelect } from "@dextinity/admin";
import { useMemo } from "react";

interface Option {
    value: string;
    label: string;
}

export default {
    title: "Docs/Form/Components/FinalForm Fields/FinalForm Select",
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
            // see "FinalFormAutocomplete" story
            () => ({
                select: { value: "strawberry", label: "Strawberry" },
                selectAsync: { value: "strawberry", label: "Strawberry" },
                selectMultiple: [{ value: "strawberry", label: "Strawberry" }],
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
                    component={FinalFormAsyncSelect}
                    getOptionLabel={(option: Option) => option.label}
                    loadOptions={async () => {
                        return new Promise((resolve) => setTimeout(() => resolve(options), 500));
                    }}
                    name="selectAsync"
                    label="SelectAsync"
                    fullWidth
                />
                <Field
                    component={FinalFormSelect}
                    multiple
                    getOptionLabel={(option: Option) => option.label}
                    getOptionSelected={(option: Option, value: Option) => {
                        return option.value === value.value;
                    }}
                    options={options}
                    name="selectMultiple"
                    label="Select multiple values"
                    fullWidth
                />

                <Field
                    component={FinalFormSelect}
                    getOptionLabel={(option: Option) => option.label}
                    getOptionSelected={(option: Option, value: Option) => {
                        return option.value === value.value;
                    }}
                    options={options}
                    name="selectDisabled"
                    label="Select disabled"
                    fullWidth
                    disabled
                />

                <Button type="submit">Submit</Button>
            </FinalForm>
        );
    },

    name: "FinalFormSelect",
};
