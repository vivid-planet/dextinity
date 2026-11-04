import type { Meta, StoryObj } from "@storybook/react-vite";

import { FinalForm } from "../../../FinalForm";
import { FinalFormDebug } from "../../../form/FinalFormDebug";
import { TimePickerField } from "../TimePickerField";

type Story = StoryObj<typeof TimePickerField>;
const config: Meta<typeof TimePickerField> = {
    component: TimePickerField,
    title: "components/dateTime/TimePickerField",
};

export default config;

/**
 * The basic TimePickerField component allows users to select a time.
 *
 * Use this when you need:
 * - A time input in a form
 * - Users to select a specific time from a time picker interface
 * - Time values to be stored as strings
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
                            <TimePickerField name="value" label="Time Picker" fullWidth variant="horizontal" />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * TimePickerField can be configured with minimum and maximum time constraints.
 *
 * Use this when:
 * - You need to restrict selectable times to a specific range
 * - Business rules require time boundaries (e.g., business hours)
 * - You want to prevent invalid time selections
 */
export const MinMaxTime: Story = {
    args: {
        minTime: new Date(2000, 0, 1, 9, 0),
        maxTime: new Date(2000, 0, 1, 17, 0),
    },
    argTypes: {
        minTime: { control: "date" },
        maxTime: { control: "date" },
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
                            <TimePickerField
                                name="value"
                                label="Time Picker with Min/Max Time"
                                fullWidth
                                variant="horizontal"
                                minTime={args.minTime}
                                maxTime={args.maxTime}
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
 * TimePickerField with clearable functionality allows users to reset the selected time.
 *
 * Use this when:
 * - The time field is optional
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
                            <TimePickerField clearable name="value" label="Clearable Time Picker" fullWidth variant="horizontal" />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * TimePickerField can be disabled to prevent user interaction.
 *
 * Use this when:
 * - The time should be displayed but not editable
 * - Form logic requires certain conditions before editing
 * - You want to show read-only time information
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
                initialValues={{ value: "14:30" }}
                subscription={{ values: true }}
            >
                {({ values }: { values: FormValues }) => {
                    return (
                        <>
                            <TimePickerField disabled name="value" label="Disabled Time Picker" fullWidth variant="horizontal" />

                            <FinalFormDebug />
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * Before implementing custom validation, try to disable certain values using the props provided by MUI's TimePicker, such as `shouldDisableTime`, `minTime`, `maxTime`.
 *
 * Use this when:
 * - You need to validate the time against a custom rule, which cannot be achieved using the props provided by MUI's TimePicker
 * - You want to provide a custom error message
 * - You want to validate the time asynchronously
 */
export const CustomValidation: Story = {
    render: () => {
        interface FormValues {
            value: string;
        }

        const validateIsNotLunchBreak = async (value: string | undefined) => {
            if (!value) {
                return undefined;
            }
            const [hours, minutes] = value.split(":").map(Number);
            const totalMinutes = hours * 60 + minutes;
            const lunchStartMinutes = 12 * 60;
            const lunchEndMinutes = 13 * 60;
            const isDuringLunchBreak = totalMinutes >= lunchStartMinutes && totalMinutes < lunchEndMinutes;
            return isDuringLunchBreak ? "Please select a time outside of lunch break (12:00-13:00)" : undefined;
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
                        <TimePickerField
                            name="value"
                            label="Time Picker"
                            helperText="Lunch break (12:00-13:00) is not allowed"
                            fullWidth
                            variant="horizontal"
                            validate={validateIsNotLunchBreak}
                        />

                        <FinalFormDebug />
                    </>
                )}
            </FinalForm>
        );
    },
};
