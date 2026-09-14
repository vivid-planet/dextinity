import { Alert, DatePickerField, FinalForm } from "@dextinity/admin";
import type { Meta, StoryObj } from "@storybook/react-vite";

type Story = StoryObj<typeof DatePickerField>;
const config: Meta<typeof DatePickerField> = {
    component: DatePickerField,
    title: "@dextinity/admin/datePicker/DatePickerField",
};
export default config;

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
                {({ values }) => {
                    return (
                        <>
                            <DatePickerField name="value" label="Date Picker" fullWidth variant="horizontal" />

                            <Alert title="FormState">
                                <pre>{JSON.stringify(values, null, 2)}</pre>
                            </Alert>
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

export const MinMaxDate: Story = {
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
                {({ values }) => {
                    return (
                        <>
                            <DatePickerField
                                name="value"
                                label="Date Picker with Min/Max Date"
                                fullWidth
                                variant="horizontal"
                                minDate={new Date(2025, 0, 1)}
                                maxDate={new Date(2025, 11, 31)}
                            />

                            <Alert title="FormState">
                                <pre>{JSON.stringify(values, null, 2)}</pre>
                            </Alert>
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};
