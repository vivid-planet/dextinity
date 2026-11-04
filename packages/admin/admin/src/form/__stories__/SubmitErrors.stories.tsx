import { Box, Card, CardContent } from "@mui/material";
import type { SubmissionErrors } from "final-form";

import { FinalForm } from "../../FinalForm";
import { FinalFormSaveCancelButtonsLegacy } from "../../FinalFormSaveCancelButtonsLegacy";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";

const onSubmit = ({ foo, bar }: { foo: string; bar: string }) => {
    const errors = [];
    if (foo !== "foo") {
        errors.push({ foo: `${foo} is not foo` });
    }
    if (bar !== "bar") {
        errors.push({ bar: `${bar} is not bar` });
    }
    return Promise.reject({ errors });
};

const resolveSubmitErrors = (error: SubmissionErrors) => {
    // error = { errors: [{fieldName: errorMessage},...] }
    const result = {};

    if (error) {
        for (const submitError of error.errors) {
            Object.assign(result, submitError);
        }
    }

    // result = {fieldName: errorMessage, ...}
    return result;
};

export default {
    title: "components/form",
};

export const SubmitErrors = {
    render: () => {
        const initialValues = {
            foo: "foo",
        };

        return (
            <FinalForm mode="edit" onSubmit={onSubmit} initialValues={initialValues} resolveSubmitErrors={resolveSubmitErrors}>
                <Box marginBottom={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Field label="Foo" name="foo" component={FinalFormInput} />
                        </CardContent>
                    </Card>
                </Box>
                <Box marginBottom={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Field label="Bar" name="bar" component={FinalFormInput} />
                        </CardContent>
                    </Card>
                </Box>
                <FinalFormSaveCancelButtonsLegacy />
            </FinalForm>
        );
    },

    name: "SubmitErrors",
};
