import type { Meta, StoryObj } from "@storybook/react-vite";

import { FinalForm } from "../../../FinalForm";
import { FinalFormDebug } from "../../../form/FinalFormDebug";
import type { TimeRange } from "../../timeRangePicker/TimeRangePicker";
import { TimeRangePickerField } from "../TimeRangePickerField";

type Story = StoryObj<typeof TimeRangePickerField>;
const config: Meta<typeof TimeRangePickerField> = {
    component: TimeRangePickerField,
    title: "components/dateTime/TimeRangePickerField",
};

export default config;

interface FormValues {
    value: TimeRange;
}

/**
 * The basic TimeRangePickerField component allows users to select a time range.
 *
 * Use this when you need:
 * - A time range input in a form
 * - Users to select a start and end time from a time picker interface
 * - Time range values to be stored as objects with start and end properties in 24-hour format (HH:mm)
 */
export const Default: Story = {
    render: () => {
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
                        <TimeRangePickerField name="value" label="Time Range Picker" fullWidth variant="horizontal" />

                        <FinalFormDebug />
                    </>
                )}
            </FinalForm>
        );
    },
};

/**
 * TimeRangePickerField with clearable functionality allows users to reset the selected time range.
 *
 * Use this when:
 * - The time range field is optional
 * - Users should be able to clear their selection
 * - You want to provide an easy way to reset the field
 */
export const Clearable: Story = {
    render: () => {
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
                        <TimeRangePickerField clearable name="value" label="Clearable Time Range Picker" fullWidth variant="horizontal" />

                        <FinalFormDebug />
                    </>
                )}
            </FinalForm>
        );
    },
};

/**
 * TimeRangePickerField can be disabled to prevent user interaction.
 *
 * Use this when:
 * - The time range should be displayed but not editable
 * - Form logic requires certain conditions before editing
 * - You want to show read-only time range information
 */
export const Disabled: Story = {
    render: () => {
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                initialValues={{ value: { start: "09:00", end: "17:00" } }}
                subscription={{ values: true }}
            >
                {() => (
                    <>
                        <TimeRangePickerField disabled name="value" label="Disabled Time Range Picker" fullWidth variant="horizontal" />

                        <FinalFormDebug />
                    </>
                )}
            </FinalForm>
        );
    },
};
