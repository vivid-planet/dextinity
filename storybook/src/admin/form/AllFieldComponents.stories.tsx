import {
    AsyncAutocompleteField,
    AsyncSelectField,
    AutocompleteField,
    Button,
    CheckboxField,
    CheckboxListField,
    Field,
    FieldSet,
    FinalFormRangeInput,
    FormSection,
    NumberField,
    RadioGroupField,
    SearchField,
    SelectField,
    SwitchField,
    TextAreaField,
    TextField,
} from "@dextinity/admin";
import { ColorField } from "@dextinity/admin-color-picker";
import { DateField, DateRangeField, DateTimeField, TimeField, TimeRangeField } from "@dextinity/admin-date-time";
import { Box, Link, MenuItem } from "@mui/material";
import { useMemo } from "react";
import { Form } from "react-final-form";

export default {
    title: "@dextinity/admin/form",
    args: {
        fieldVariant: "horizontal",
    },
    argTypes: {
        fieldVariant: {
            name: "Field Variant",
            control: "select",
            options: ["horizontal", "vertical"],
        },
    },
};

type Args = {
    fieldVariant: "horizontal" | "vertical";
};

export const AllFieldComponents = {
    render: ({ fieldVariant }: Args) => {
        type Option = { value: string; label: string };

        const options = [
            { value: "chocolate", label: "Chocolate" },
            { value: "strawberry", label: "Strawberry" },
            { value: "vanilla", label: "Vanilla" },
            {
                value: "fruit salad",
                label: "Strawberries, Raspberries, Bananas, Mangos, Pineapples, Apples, Pears, Melons, Grapes, Blueberries, Peaches",
            },
        ];

        const initalValues = useMemo(() => ({ multiSelect: [] }), []);

        return (
            <Form
                onSubmit={(values) => {
                    alert(JSON.stringify(values, undefined, 2));
                }}
                initialValues={initalValues}
                render={({ handleSubmit, values }) => (
                    <form onSubmit={handleSubmit}>
                        <Box maxWidth={1024}>
                            <FieldSet title="Common Field-Components">
                                <TextField name="text" label="Text" variant={fieldVariant} fullWidth />
                                <TextAreaField name="textarea" label="TextArea" variant={fieldVariant} fullWidth />
                                <SearchField name="search" label="Search" variant={fieldVariant} fullWidth />
                                <SelectField name="select" label="Select" variant={fieldVariant} fullWidth>
                                    {options.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </SelectField>
                                <NumberField name="number" label="Number" variant={fieldVariant} fullWidth />
                                <AsyncSelectField
                                    name="asyncSelect"
                                    label="Async Select"
                                    loadOptions={async () => {
                                        return new Promise<typeof options>((resolve) => setTimeout(() => resolve(options), 1000));
                                    }}
                                    getOptionLabel={(option) => option.label}
                                    variant={fieldVariant}
                                    fullWidth
                                />
                                <AutocompleteField
                                    name="autocomplete"
                                    label="Autocomplete"
                                    options={options}
                                    getOptionLabel={(option: Option) => option.label}
                                    isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                                    variant={fieldVariant}
                                    fullWidth
                                />
                                <AsyncAutocompleteField
                                    name="asyncAutocomplete"
                                    label="Async Autocomplete"
                                    loadOptions={async (search) => {
                                        return new Promise<typeof options>((resolve) =>
                                            setTimeout(() => {
                                                return resolve(
                                                    options.filter((value) => {
                                                        return value.label.toLowerCase().includes(search?.toLowerCase() ?? "");
                                                    }),
                                                );
                                            }, 1000),
                                        );
                                    }}
                                    getOptionLabel={(option: Option) => option.label}
                                    isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
                                    variant={fieldVariant}
                                    fullWidth
                                />
                                <SwitchField name="switch" label={(checked) => (checked ? "On" : "Off")} fieldLabel="Switch" variant={fieldVariant} />
                            </FieldSet>
                            <FieldSet title="Checkboxes">
                                <FormSection title="Individual Checkboxes">
                                    <CheckboxField name="requiredCheckbox" fieldLabel="Required Checkbox" variant={fieldVariant} required fullWidth />
                                    <CheckboxField
                                        name="checkboxWithAdditionalLabel"
                                        fieldLabel="Checkbox with additional label"
                                        label={
                                            <>
                                                This label has a{" "}
                                                <Link href="https://www.dextinity.com" target="_blank">
                                                    link
                                                </Link>{" "}
                                                inside of it.
                                            </>
                                        }
                                        variant={fieldVariant}
                                        fullWidth
                                    />
                                    <CheckboxField
                                        name="checkboxWithoutFieldLabel"
                                        label="Checkbox without a field label"
                                        variant={fieldVariant}
                                        fullWidth
                                    />
                                </FormSection>
                                <FormSection title="Checkbox Lists">
                                    <CheckboxListField
                                        label="Required"
                                        name="requiredCheckboxList"
                                        variant={fieldVariant}
                                        fullWidth
                                        required
                                        options={[
                                            {
                                                label: "Option One",
                                                value: "option-one",
                                            },
                                            {
                                                label: "Option Two",
                                                value: "option-two",
                                            },
                                        ]}
                                    />
                                    <CheckboxListField
                                        label="Many Options"
                                        name="checkboxListManyOptions"
                                        variant={fieldVariant}
                                        fullWidth
                                        options={[
                                            {
                                                label: "Option One",
                                                value: "option-one",
                                            },
                                            {
                                                label: "Option Two",
                                                value: "option-two",
                                            },
                                            {
                                                label: "Option Three",
                                                value: "option-three",
                                            },
                                            {
                                                label: "Option Four",
                                                value: "option-four",
                                            },
                                            {
                                                label: "Option Five",
                                                value: "option-five",
                                            },
                                            {
                                                label: "Option Six",
                                                value: "option-six",
                                            },
                                        ]}
                                    />
                                    <CheckboxListField
                                        label="Column Layout"
                                        name="checkboxListColumnLayout"
                                        variant={fieldVariant}
                                        layout="column"
                                        fullWidth
                                        options={[
                                            {
                                                label: "Option One",
                                                value: "option-one",
                                            },
                                            {
                                                label: "Option Two",
                                                value: "option-two",
                                            },
                                            {
                                                label: "Option Three",
                                                value: "option-three",
                                            },
                                        ]}
                                    />
                                </FormSection>
                            </FieldSet>
                            <FieldSet title="Radio Groups">
                                <RadioGroupField
                                    label="Required"
                                    name="radio"
                                    variant={fieldVariant}
                                    fullWidth
                                    required
                                    options={[
                                        {
                                            label: "Option One",
                                            value: "option-one",
                                        },
                                        {
                                            label: "Option Two",
                                            value: "option-two",
                                        },
                                    ]}
                                />
                                <RadioGroupField
                                    label="Many Options"
                                    name="radioGroupManyOptions"
                                    variant={fieldVariant}
                                    fullWidth
                                    options={[
                                        {
                                            label: "Option One",
                                            value: "option-one",
                                        },
                                        {
                                            label: "Option Two",
                                            value: "option-two",
                                        },
                                        {
                                            label: "Option Three",
                                            value: "option-three",
                                        },
                                        {
                                            label: "Option Four",
                                            value: "option-four",
                                        },
                                        {
                                            label: "Option Five",
                                            value: "option-five",
                                        },
                                        {
                                            label: "Option Six",
                                            value: "option-six",
                                        },
                                    ]}
                                />
                                <RadioGroupField
                                    label="Column Layout"
                                    name="radioGroupColumnLayout"
                                    variant={fieldVariant}
                                    layout="column"
                                    fullWidth
                                    options={[
                                        {
                                            label: "Option One",
                                            value: "option-one",
                                        },
                                        {
                                            label: "Option Two",
                                            value: "option-two",
                                        },
                                        {
                                            label: "Option Three",
                                            value: "option-three",
                                        },
                                    ]}
                                />
                            </FieldSet>
                            <FieldSet title="Number Range">
                                <Field
                                    name="numberRange"
                                    label="Range Input"
                                    component={FinalFormRangeInput}
                                    min={-100}
                                    max={100}
                                    variant={fieldVariant}
                                    fullWidth
                                />
                                <Field
                                    name="numberRangeWithoutSlider"
                                    label="Without Slider"
                                    component={FinalFormRangeInput}
                                    min={100}
                                    max={1000}
                                    disableSlider
                                    variant={fieldVariant}
                                    fullWidth
                                />
                            </FieldSet>
                            <FieldSet title="Date and Time" supportText="@dextinity/admin-date-time">
                                <DateField name="date" label="Date" variant={fieldVariant} fullWidth />
                                <DateRangeField name="dateRange" label="Date Range" variant={fieldVariant} fullWidth />
                                <TimeField name="time" label="Time" variant={fieldVariant} fullWidth />
                                <TimeRangeField name="timeRange" label="Time Range" variant={fieldVariant} fullWidth />
                                <DateTimeField name="dateTime" label="Date Time" variant={fieldVariant} fullWidth />
                            </FieldSet>
                            <FieldSet title="Color" supportText="@dextinity/admin-color-picker">
                                <ColorField name="hexColor" label="Color (hex)" variant={fieldVariant} fullWidth />
                                <ColorField name="rgbaColor" label="Color (rgba)" colorFormat="rgba" variant={fieldVariant} fullWidth />
                            </FieldSet>
                            <div>
                                <Button onClick={handleSubmit}>Submit</Button>
                            </div>
                        </Box>
                        <pre>{JSON.stringify(values, undefined, 2)}</pre>
                    </form>
                )}
            />
        );
    },

    name: "AllFieldComponents",
};
