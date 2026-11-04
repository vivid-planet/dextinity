import { Typography } from "@mui/material";
import { useState } from "react";

import { Button } from "../../common/buttons/Button";
import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
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

export default {
    title: "components/form",
};

export const ScrollToErrorField = () => {
    const initialValues = {
        foo: "foo",
        bar: "",
    };

    const [open, setOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setOpen((s) => !s)}>Click to Render Form</Button>
            <Typography>The page then scrolls to the 2nd field which has an error.</Typography>
            {open && (
                <FinalForm<FormValues>
                    mode="edit"
                    onSubmit={() => {
                        // noop
                    }}
                    initialValues={initialValues}
                    validate={validate}
                    formContext={{ shouldScrollToField: ({ touched }) => !touched, shouldShowFieldError: () => true }}
                >
                    <Field label="Foo" name="foo" component={FinalFormInput} fullWidth />
                    <div style={{ height: "2000px", borderLeft: "1px solid black" }} />
                    <Field label="Bar" name="bar" component={FinalFormInput} fullWidth />
                </FinalForm>
            )}
        </>
    );
};
