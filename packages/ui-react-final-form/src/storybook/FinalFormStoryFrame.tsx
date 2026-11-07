import { Button, Typography } from "@dextinity/ui";
import type { Decorator } from "@storybook/react-vite";
import type { Mutator } from "final-form";
import { type CSSProperties, type PropsWithChildren, useState } from "react";
import { Form } from "react-final-form";

import { focusOnError } from "../focusOnError/focusOnError";

const formStyle: CSSProperties = { display: "grid", gap: "var(--dextinity-space-4)", maxWidth: 480 };

interface FinalFormStoryFrameProps {
    initialValues?: Record<string, unknown>;
    mutators?: Record<string, Mutator<Record<string, unknown>>>;
}

/**
 * A React Final Form form around a story, with a submit button, the current values, and the submitted values.
 */
function FinalFormStoryFrame({ initialValues, mutators, children }: PropsWithChildren<FinalFormStoryFrameProps>) {
    const [submittedValues, setSubmittedValues] = useState<Record<string, unknown>>();

    return (
        <Form<Record<string, unknown>>
            onSubmit={(values) => setSubmittedValues(values)}
            initialValues={initialValues}
            mutators={mutators}
            decorators={[focusOnError]}
        >
            {({ handleSubmit, values }) => (
                <form onSubmit={handleSubmit} noValidate style={formStyle}>
                    {children}
                    <div>
                        <Button type="submit">Submit</Button>
                    </div>
                    <Typography variant="mono" element="p">
                        Values: {JSON.stringify(values)}
                    </Typography>
                    {submittedValues !== undefined && (
                        <Typography variant="small" role="status">
                            Submitted: {JSON.stringify(submittedValues)}
                        </Typography>
                    )}
                </form>
            )}
        </Form>
    );
}

/**
 * Renders the story inside a React Final Form form, with the initial values from `parameters.initialValues` and the mutators from
 * `parameters.formMutators`.
 */
export const finalFormDecorator: Decorator = (Story, { parameters }) => (
    <FinalFormStoryFrame initialValues={parameters.initialValues} mutators={parameters.formMutators}>
        <Story />
    </FinalFormStoryFrame>
);
