import { Alert, FinalForm } from "@dextinity/admin";
import { DateField } from "@dextinity/admin-date-time";
import type { Meta, StoryObj } from "@storybook/react-vite";

type Story = StoryObj<typeof DateField>;
const config: Meta<typeof DateField> = {
    component: DateField,
    title: "@dextinity/admin/form/DateField",
    tags: ["deprecated"],
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
                            <DateField
                                name="value"
                                label="Date Field"
                                fullWidth
                                variant="horizontal"
                                formatDateOptions={{ month: "2-digit", day: "2-digit", year: "2-digit" }}
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
                            <DateField
                                name="value"
                                label="Date Field with Min/Max Date"
                                fullWidth
                                variant="horizontal"
                                maxDate={new Date("2025-12-31")}
                                minDate={new Date("2025-01-01")}
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

export const ShowMultipleMonths: Story = {
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
                            <DateField name="value" label="Date Field" fullWidth variant="horizontal" monthsToShow={2} />

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

export const WithFormatDateOptions: Story = {
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
                            <DateField
                                name="value"
                                label="Date Field"
                                fullWidth
                                variant="horizontal"
                                formatDateOptions={{ month: "2-digit", day: "2-digit", year: "2-digit" }}
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
