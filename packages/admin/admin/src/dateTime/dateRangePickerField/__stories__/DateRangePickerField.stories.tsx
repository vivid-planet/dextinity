import type { Meta, StoryObj } from "@storybook/react-vite";

import { FinalForm } from "../../../FinalForm";
import { FinalFormDebug } from "../../../form/FinalFormDebug";
import { DateRangePickerField } from "../DateRangePickerField";

type Story = StoryObj<typeof DateRangePickerField>;
const config: Meta<typeof DateRangePickerField> = {
    component: DateRangePickerField,
    title: "components/dateTime/DateRangePickerField",
};

export default config;

/**
 * The basic DateRangePickerField component allows users to select a date range.
 *
 * Use this when you need:
 * - A date range input in a form
 * - Users to select a start and end date from a calendar interface
 * - Date range values to be stored as objects with start and end properties
 */
export const Default: Story = {
    render: () => {
        interface FormValues {
            value: { start: string | null; end: string | null };
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
                            <DateRangePickerField name="value" label="Date Range Picker" fullWidth variant="horizontal" />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * DateRangePickerField can be configured with minimum and maximum date constraints.
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
        minDate: { control: "date" },
        maxDate: { control: "date" },
    },
    render: (args) => {
        interface FormValues {
            value: { start: string | null; end: string | null };
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
                            <DateRangePickerField
                                name="value"
                                label="Date Range Picker with Min/Max Date"
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
 * DateRangePickerField with clearable functionality allows users to reset the selected date range.
 *
 * Use this when:
 * - The date range field is optional
 * - Users should be able to clear their selection
 * - You want to provide an easy way to reset the field
 */
export const Clearable: Story = {
    render: () => {
        interface FormValues {
            value: { start: string | null; end: string | null };
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
                            <DateRangePickerField clearable name="value" label="Clearable Date Range Picker" fullWidth variant="horizontal" />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * DateRangePickerField can be disabled to prevent user interaction.
 *
 * Use this when:
 * - The date range should be displayed but not editable
 * - Form logic requires certain conditions before editing
 * - You want to show read-only date range information
 */
export const Disabled: Story = {
    render: () => {
        interface FormValues {
            value: { start: string | null; end: string | null };
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                initialValues={{ value: { start: "2026-01-15", end: "2026-01-20" } }}
                subscription={{ values: true }}
            >
                {({ values }: { values: FormValues }) => {
                    return (
                        <>
                            <DateRangePickerField disabled name="value" label="Disabled Date Range Picker" fullWidth variant="horizontal" />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * Before implementing custom validation, try to disable certain values using the props provided by MUI's DateRangePicker, such as `shouldDisableDate`, `disableFuture`, `disablePast`.
 *
 * Use this when:
 * - You need to validate the date range against a custom rule, which cannot be achieved using the props provided by MUI's DateRangePicker
 * - You want to provide a custom error message
 * - You want to validate the date range asynchronously
 */
export const CustomValidation: Story = {
    render: () => {
        interface FormValues {
            value: { start: string | null; end: string | null };
        }

        const validateMaxThirtyDayRange = async (value: { start: string | null; end: string | null } | undefined) => {
            if (!value?.start || !value?.end) {
                return undefined;
            }
            const startDate = new Date(value.start);
            const endDate = new Date(value.end);
            const differenceInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
            return differenceInDays <= 30 ? undefined : "Please select a range no longer than 30 days";
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
                        <DateRangePickerField
                            name="value"
                            label="Date Range Picker"
                            helperText="The selected range must not exceed 30 days"
                            fullWidth
                            variant="horizontal"
                            validate={validateMaxThirtyDayRange}
                        />

                        <FinalFormDebug />
                    </>
                )}
            </FinalForm>
        );
    },
};
