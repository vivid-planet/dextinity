import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert } from "../../alert/Alert";
import { FinalForm } from "../../FinalForm";
import { TextAreaField } from "../../form/fields/TextAreaField";

type Story = StoryObj<typeof TextAreaField>;
const config: Meta<typeof TextAreaField> = {
    component: TextAreaField,
    title: "components/form/TextAreaField",
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
                            <TextAreaField name="value" label="Text Area Field" fullWidth variant="horizontal" />

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
