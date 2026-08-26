import { Lock } from "@dextinity/admin-icons";
import { InputAdornment } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert } from "../../alert/Alert";
import { FinalForm } from "../../FinalForm";
import { SelectField } from "../../form/fields/SelectField";

type Story = StoryObj<typeof SelectField>;
const config: Meta<typeof SelectField> = {
    component: SelectField,
    title: "components/form/SelectField",
};
export default config;

export const Default: Story = {
    render: () => {
        interface FormValues {
            type: string;
        }
        return (
            <FinalForm<FormValues>
                initialValues={{ type: "value-1" }}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <SelectField
                                name="type"
                                label="SelectField"
                                fullWidth
                                variant="horizontal"
                                options={[
                                    {
                                        value: "value-1",
                                        label: "Value 1",
                                    },
                                    {
                                        value: "value-2",
                                        label: "Value 2",
                                    },
                                    {
                                        value: "value-3",
                                        label: "Value 3",
                                    },
                                ]}
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

export const Readonly: Story = {
    render: () => {
        interface FormValues {
            type: string;
        }
        return (
            <FinalForm<FormValues>
                initialValues={{ type: "value-1" }}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <SelectField
                                name="type"
                                label="SelectField"
                                fullWidth
                                variant="horizontal"
                                disabled
                                endAdornment={
                                    <InputAdornment position="end">
                                        <Lock />
                                    </InputAdornment>
                                }
                                options={[
                                    {
                                        value: "value-1",
                                        label: "Value 1",
                                    },
                                    {
                                        value: "value-2",
                                        label: "Value 2",
                                    },
                                    {
                                        value: "value-3",
                                        label: "Value 3",
                                    },
                                ]}
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
