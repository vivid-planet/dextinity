import type { Meta, StoryObj } from "@storybook/react-vite";

import { FinalForm } from "../../../FinalForm";
import { FinalFormDebug } from "../../../form/FinalFormDebug";
import { DateTimeRangePickerField } from "../DateTimeRangePickerField";

type Story = StoryObj<typeof DateTimeRangePickerField>;
const config: Meta<typeof DateTimeRangePickerField> = {
    component: DateTimeRangePickerField,
    title: "components/dateTime/DateTimeRangePickerField",
};

export default config;

/**
 * The basic DateTimeRangePickerField component allows users to select a date and time range.
 *
 * Use this when you need:
 * - A date time range input in a form
 * - Users to select a start and end date with time from calendar and time picker interfaces
 * - DateTime range values to be stored as objects with start and end Date properties
 */
export const Default: Story = {
    render: () => {
        interface FormValues {
            value: { start: Date | null; end: Date | null };
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
                            <DateTimeRangePickerField name="value" label="Date Time Range Picker" fullWidth variant="horizontal" />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * DateTimeRangePickerField can be configured with minimum and maximum date constraints.
 *
 * Use this when:
 * - You need to restrict selectable dates to a specific range
 * - Business rules require date boundaries
 * - You want to prevent invalid date and time selections
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
            value: { start: Date | null; end: Date | null };
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
                            <DateTimeRangePickerField
                                name="value"
                                label="Date Time Range Picker with Min/Max Date"
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
 * DateTimeRangePickerField with clearable functionality allows users to reset the selected date time range.
 *
 * Use this when:
 * - The date time range field is optional
 * - Users should be able to clear their selection
 * - You want to provide an easy way to reset the field
 */
export const Clearable: Story = {
    render: () => {
        interface FormValues {
            value: { start: Date | null; end: Date | null };
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
                            <DateTimeRangePickerField
                                clearable
                                name="value"
                                label="Clearable Date Time Range Picker"
                                fullWidth
                                variant="horizontal"
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
 * DateTimeRangePickerField can be disabled to prevent user interaction.
 *
 * Use this when:
 * - The date time range should be displayed but not editable
 * - Form logic requires certain conditions before editing
 * - You want to show read-only date time range information
 */
export const Disabled: Story = {
    render: () => {
        interface FormValues {
            value: { start: Date | null; end: Date | null };
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                initialValues={{ value: { start: new Date(2026, 0, 15, 10, 0), end: new Date(2026, 0, 20, 18, 0) } }}
                subscription={{ values: true }}
            >
                {({ values }: { values: FormValues }) => {
                    return (
                        <>
                            <DateTimeRangePickerField disabled name="value" label="Disabled Date Time Range Picker" fullWidth variant="horizontal" />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * Before implementing custom validation, try to disable certain values using the props provided by MUI's DateTimeRangePicker, such as `shouldDisableDate`, `shouldDisableTime`, `disableFuture`, `disablePast`.
 *
 * Use this when:
 * - You need to validate the date time range against a custom rule, which cannot be achieved using the props provided by MUI's DateTimeRangePicker
 * - You want to provide a custom error message
 * - You want to validate the date time range asynchronously
 */
export const CustomValidation: Story = {
    render: () => {
        interface FormValues {
            value: { start: Date | null; end: Date | null };
        }

        const validateMaxThirtyDayRange = async (value: { start: Date | null; end: Date | null } | undefined) => {
            if (!value?.start || !value?.end) {
                return undefined;
            }
            const millisecondsDifference = value.end.getTime() - value.start.getTime();
            const daysDifference = millisecondsDifference / (1000 * 60 * 60 * 24);
            return daysDifference <= 30 ? undefined : "Please select a range no longer than 30 days";
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
                        <DateTimeRangePickerField
                            name="value"
                            label="Date Time Range Picker"
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
