import type { Meta, StoryObj } from "@storybook/react-vite";

import { FinalForm } from "../../../FinalForm";
import { FinalFormDebug } from "../../../form/FinalFormDebug";
import { DatePickerField } from "../DatePickerField";

type Story = StoryObj<typeof DatePickerField>;
const config: Meta<typeof DatePickerField> = {
    component: DatePickerField,
    title: "components/dateTime/DatePickerField",
};

export default config;

/**
 * The basic DatePickerField component allows users to select a date.
 *
 * Use this when you need:
 * - A simple date input in a form
 * - Users to select a specific date from a calendar interface
 * - Date values to be stored as strings
 */
export const Default: Story = {
    render: () => {
        interface FormValues {
            value: string;
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }: { values: FormValues }) => {
                    return (
                        <>
                            <DatePickerField name="value" label="Date Picker" fullWidth variant="horizontal" />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * DatePickerField can be configured with minimum and maximum date constraints.
 *
 * Use this when:
 * - You need to restrict selectable dates to a specific range
 * - Business rules require date boundaries
 * - You want to prevent invalid date selections
 */
export const MinMaxDate: Story = {
    args: {
        minDate: new Date(2025, 0, 1),
        maxDate: new Date(2025, 11, 31),
    },
    argTypes: {
        minDate: {
            control: "date",
        },
        maxDate: {
            control: "date",
        },
    },
    render: (args) => {
        interface FormValues {
            value: string;
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }: { values: FormValues }) => {
                    return (
                        <>
                            <DatePickerField
                                name="value"
                                label="Date Picker with Min/Max Date"
                                fullWidth
                                variant="horizontal"
                                minDate={args.minDate}
                                maxDate={args.maxDate}
                            />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * DatePickerField with clearable functionality allows users to reset the selected date.
 *
 * Use this when:
 * - The date field is optional
 * - Users should be able to clear their selection
 * - You want to provide an easy way to reset the field
 */
export const Clearable: Story = {
    render: () => {
        interface FormValues {
            value: string;
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }: { values: FormValues }) => {
                    return (
                        <>
                            <DatePickerField clearable name="value" label="Clearable Date Picker" fullWidth variant="horizontal" />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * DatePickerField can be disabled to prevent user interaction.
 *
 * Use this when:
 * - The date should be displayed but not editable
 * - Form logic requires certain conditions before editing
 * - You want to show read-only date information
 */
export const Disabled: Story = {
    render: () => {
        interface FormValues {
            value: string;
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                initialValues={{ value: "2026-01-15" }}
                subscription={{ values: true }}
            >
                {({ values }: { values: FormValues }) => {
                    return (
                        <>
                            <DatePickerField disabled name="value" label="Disabled Date Picker" fullWidth variant="horizontal" />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * Before implementing custom validation, try to disable certain values using the props provided by MUI's DatePicker, such as `shouldDisableDate`, `disableFuture`, `disablePast`.
 *
 * Use this when:
 * - You need to validate the date against a custom rule, which cannot be achieved using the props provided by MUI's DatePicker
 * - You want to provide a custom error message
 * - You want to validate the date asynchronously
 */
export const CustomValidation: Story = {
    render: () => {
        interface FormValues {
            value: string;
        }

        const validateIsWeekday = async (value: string | undefined) => {
            if (!value) {
                return undefined;
            }
            const day = new Date(value).getDay();
            const isWeekday = day !== 0 && day !== 6;
            return isWeekday ? undefined : "Please select a weekday";
        };

        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {() => (
                    <>
                        <DatePickerField
                            name="value"
                            label="Date Picker"
                            helperText="Only weekdays are valid"
                            fullWidth
                            variant="horizontal"
                            validate={validateIsWeekday}
                        />

                        <FinalFormDebug />
                    </>
                )}
            </FinalForm>
        );
    },
};
