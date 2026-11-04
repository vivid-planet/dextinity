import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert } from "../../alert/Alert";
import { FinalForm } from "../../FinalForm";
import { TextField } from "../../form/fields/TextField";
import { SaveBoundary } from "../../saveBoundary/SaveBoundary";
import { SaveBoundarySaveButton } from "../../saveBoundary/SaveBoundarySaveButton";

type Story = StoryObj;
const config: Meta = {
    title: "components/form/FormValidation",
};
export default config;

export const FormValidation: Story = {
    render: () => {
        interface FormValues {
            text: string;
            text2: string;
            text3: string;
        }
        return (
            <SaveBoundary>
                <FinalForm<FormValues>
                    initialValues={{ text: "", text2: "", text3: "" }}
                    mode="edit"
                    onSubmit={() => {
                        // not handled
                    }}
                    subscription={{
                        values: true,
                        errors: true,
                        submitError: true,
                        submitFailed: true,
                        submitSucceeded: true,
                        hasSubmitErrors: true,
                        touched: true,
                    }}
                >
                    {({ values, errors, touched, submitError, submitFailed, submitSucceeded, hasSubmitErrors }) => {
                        return (
                            <>
                                <TextField name="text" label="Text" fullWidth required />
                                <TextField
                                    name="text2"
                                    label="Text"
                                    helperText="Text must be more than 5 characters"
                                    fullWidth
                                    required
                                    validate={(value) => {
                                        if (value != null && value.length < 5) {
                                            return "Text must be more than 5 characters";
                                        }
                                    }}
                                />
                                <TextField name="text3" label="Text" fullWidth required />

                                <SaveBoundarySaveButton />
                                <Alert title="FormState">
                                    <pre>
                                        {JSON.stringify(
                                            { submitError, submitFailed, submitSucceeded, hasSubmitErrors, touched, values, errors },
                                            null,
                                            2,
                                        )}
                                    </pre>
                                </Alert>
                            </>
                        );
                    }}
                </FinalForm>
            </SaveBoundary>
        );
    },
};
