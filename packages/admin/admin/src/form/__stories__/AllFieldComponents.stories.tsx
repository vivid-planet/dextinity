import { Box, Link, MenuItem } from "@mui/material";
import { useMemo } from "react";
import { Form } from "react-final-form";

import { ColorField } from "../../colorPicker/ColorField";
import { Button } from "../../common/buttons/Button";
import { FieldSet } from "../../common/FieldSet";
import { DatePickerField } from "../../dateTime/datePickerField/DatePickerField";
import { DateRangePickerField } from "../../dateTime/dateRangePickerField/DateRangePickerField";
import { DateTimePickerField } from "../../dateTime/dateTimePickerField/DateTimePickerField";
import { TimePickerField } from "../../dateTime/timePickerField/TimePickerField";
import { TimeRangePickerField } from "../../dateTime/timeRangePickerField/TimeRangePickerField";
import { Field } from "../Field";
import { AsyncAutocompleteField } from "../fields/AsyncAutocompleteField";
import { AsyncSelectField } from "../fields/AsyncSelectField";
import { AutocompleteField } from "../fields/AutocompleteField";
import { CheckboxField } from "../fields/CheckboxField";
import { CheckboxListField } from "../fields/CheckboxListField";
import { NumberField } from "../fields/NumberField";
import { RadioGroupField } from "../fields/RadioGroupField";
import { SearchField } from "../fields/SearchField";
import { SelectField } from "../fields/SelectField";
import { SwitchField } from "../fields/SwitchField";
import { TextAreaField } from "../fields/TextAreaField";
import { TextField } from "../fields/TextField";
import { FinalFormRangeInput } from "../FinalFormRangeInput";
import { FormSection } from "../FormSection";

export default {
    title: "components/form",
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
                        <Box
                            sx={{
                                maxWidth: 1024,
                            }}
                        >
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
                            <FieldSet title="Date and Time" supportText="@dextinity/admin">
                                <DatePickerField name="date" label="Date" variant={fieldVariant} fullWidth />
                                <DateRangePickerField name="dateRange" label="Date Range" variant={fieldVariant} fullWidth />
                                <TimePickerField name="time" label="Time" variant={fieldVariant} fullWidth />
                                <TimeRangePickerField name="timeRange" label="Time Range" variant={fieldVariant} fullWidth />
                                <DateTimePickerField name="dateTime" label="Date Time" variant={fieldVariant} fullWidth />
                            </FieldSet>
                            <FieldSet title="Color" supportText="@dextinity/admin">
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
