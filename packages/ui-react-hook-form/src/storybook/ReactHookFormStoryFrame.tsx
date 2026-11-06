import { Button, Typography } from "@dextinity/ui";
import type { Decorator } from "@storybook/react-vite";
import { type CSSProperties, type PropsWithChildren, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

const formStyle: CSSProperties = { display: "grid", gap: "var(--dextinity-space-4)", maxWidth: 480 };

function Values() {
    return (
        <Typography variant="mono" element="p">
            Values: {JSON.stringify(useWatch())}
        </Typography>
    );
}

interface ReactHookFormStoryFrameProps {
    initialValues?: Record<string, unknown>;
}

/**
 * A React Hook Form form around a story, validating on blur like React Final Form, with a submit button, the current values, and the
 * submitted values.
 */
function ReactHookFormStoryFrame({ initialValues, children }: PropsWithChildren<ReactHookFormStoryFrameProps>) {
    const form = useForm({ defaultValues: initialValues, mode: "onTouched" });
    const [submittedValues, setSubmittedValues] = useState<Record<string, unknown>>();

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(setSubmittedValues)} noValidate style={formStyle}>
                {children}
                <div>
                    <Button type="submit">Submit</Button>
                </div>
                <Values />
                {submittedValues !== undefined && (
                    <Typography variant="small" role="status">
                        Submitted: {JSON.stringify(submittedValues)}
                    </Typography>
                )}
            </form>
        </FormProvider>
    );
}

/**
 * Renders the story inside a React Hook Form form, with the default values from `parameters.initialValues`.
 */
export const reactHookFormDecorator: Decorator = (Story, { parameters }) => (
    <ReactHookFormStoryFrame initialValues={parameters.initialValues}>
        <Story />
    </ReactHookFormStoryFrame>
);
