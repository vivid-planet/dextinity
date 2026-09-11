import { Alert, FinalForm } from "@dextinity/admin";
import { DateTimeField } from "@dextinity/admin-date-time";
import type { Meta, StoryObj } from "@storybook/react-vite";

type Story = StoryObj<typeof DateTimeField>;
const config: Meta<typeof DateTimeField> = {
    component: DateTimeField,
    title: "@dextinity/admin-date-time/dateTimePicker/DateTimeField",
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
                            <DateTimeField name="value" label="Date time field" fullWidth variant="horizontal" />

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
