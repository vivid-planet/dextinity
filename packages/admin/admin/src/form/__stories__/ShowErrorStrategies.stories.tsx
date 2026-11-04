import { Stack, Typography } from "@mui/material";

import { Button } from "../../common/buttons/Button";
import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
import type { FinalFormContext } from "../../form/FinalFormContextProvider";
import { FinalFormInput } from "../../form/FinalFormInput";

interface FormValues {
    foo: string;
    bar: string;
}

function validate({ foo, bar }: FormValues) {
    const errors: Partial<Record<keyof FormValues, string>> = {};
    if (foo !== "foo") {
        errors.foo = `${foo} is not foo`;
    }
    if (bar !== "bar") {
        errors.bar = `${bar} is not bar`;
    }
    return errors;
}

type ShowStrategy = "always" | "while-typing" | "on-blur" | "when-submitted";
const strategies: Record<ShowStrategy, FinalFormContext["shouldShowFieldError"]> = {
    always: () => true,
    "on-blur": ({ touched }) => !!touched,
    "while-typing": ({ touched, active }) => !!(touched || active),
    "when-submitted": ({ submitFailed }) => !!submitFailed,
};

export default {
    title: "components/form",
    args: {
        strategy: "when-submitted",
    },
    argTypes: {
        strategy: {
            name: "Show Error Strategy",
            control: "select",
            options: ["always", "on-blur", "while-typing", "when-submitted"],
        },
    },
};

type Args = {
    strategy: ShowStrategy;
};

export const ShowErrorStrategies = {
    render: ({ strategy }: Args) => {
        const initialValues = {
            foo: "foo",
            bar: "",
        };

        const shouldShowFieldError = strategies[strategy];
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // noop
                }}
                initialValues={initialValues}
                validate={validate}
                formContext={{ shouldShowFieldError }}
            >
                {({ form }) => (
                    <>
                        <Typography variant="body1">
                            Demonstrates different implementations of &quot;shouldShowFieldError&quot;. Use Knob to switch strategies.
                        </Typography>

                        <Typography variant="h3">Show-Error-Strategy: &quot;{strategy}&quot;</Typography>
                        <Field label="Foo" name="foo" component={FinalFormInput} fullWidth />
                        <Field label="Bar" name="bar" component={FinalFormInput} fullWidth />
                        <Stack direction="row" spacing={2}>
                            <Button type="submit">Submit</Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    form.reset();
                                    form.resetFieldState("foo");
                                    form.resetFieldState("bar");
                                }}
                            >
                                Reset form and field state
                            </Button>
                        </Stack>
                    </>
                )}
            </FinalForm>
        );
    },
};
