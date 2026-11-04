import { Card, CardContent, Grid } from "@mui/material";
import type { FieldValidator } from "final-form";

import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";

const validateWarning = (value: number | undefined) => {
    if (value === undefined) {
        return undefined;
    }

    if (value < 10) {
        return "Value should be >= 10";
    }
};

const validateWarningAsync = (value: number | undefined) => {
    return new Promise<string | undefined>((resolve) => {
        setTimeout(() => {
            resolve(validateWarning(value));
        }, 5000);
    });
};

const validateError: FieldValidator<number | undefined> = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value < 5) {
        return "Value must be >= 5";
    }
};

export default {
    title: "components/form",
};

export const TwoLevelValidationWarningAndError = {
    render: () => {
        return (
            <Grid container spacing={4} style={{ maxWidth: 800 }}>
                <Grid size={6}>
                    <FinalForm
                        mode="add"
                        onSubmit={() => {}}
                        render={({ handleSubmit }) => (
                            <Card variant="outlined">
                                <CardContent>
                                    <form onSubmit={handleSubmit}>
                                        <Field
                                            name="input1"
                                            type="number"
                                            label="Required only validation"
                                            placeholder="Must be >= 5, should be >= 10"
                                            component={FinalFormInput}
                                            required
                                            fullWidth
                                        />
                                        <Field
                                            name="input2"
                                            type="number"
                                            label="Error only validation"
                                            placeholder="Must be >= 5, should be >= 10"
                                            component={FinalFormInput}
                                            required
                                            validate={validateError}
                                            fullWidth
                                        />
                                        <Field
                                            name="input3"
                                            type="number"
                                            label="Warning only validation"
                                            placeholder="Must be >= 5, should be >= 10"
                                            component={FinalFormInput}
                                            required
                                            validateWarning={validateWarning}
                                            fullWidth
                                        />
                                        <Field
                                            name="input4"
                                            type="number"
                                            label="Error and warning validation"
                                            placeholder="Must be >= 5, should be >= 10"
                                            component={FinalFormInput}
                                            required
                                            validate={validateError}
                                            validateWarning={validateWarning}
                                            fullWidth
                                        />
                                        <Field
                                            name="input5"
                                            type="number"
                                            label="Async warning validation"
                                            placeholder="Must be >= 5, should be >= 10"
                                            component={FinalFormInput}
                                            required
                                            validateWarning={validateWarningAsync}
                                            fullWidth
                                        />
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    />
                </Grid>
                <Grid size={6}>
                    <FinalForm<{ input1: number }>
                        mode="add"
                        onSubmit={() => {}}
                        render={({ handleSubmit }) => (
                            <Card variant="outlined">
                                <CardContent>
                                    <form onSubmit={handleSubmit}>
                                        <Field
                                            name="input1"
                                            type="number"
                                            label="Record level validation"
                                            placeholder="Must be >= 5, should be >= 10"
                                            component={FinalFormInput}
                                            required
                                            fullWidth
                                        />
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                        validate={(values) => {
                            return {
                                input1: validateError(values.input1, values),
                            };
                        }}
                        validateWarning={async (values) => {
                            const warning = await validateWarningAsync(values.input1);

                            if (!warning) {
                                return undefined;
                            }

                            return {
                                input1: warning,
                            };
                        }}
                    />
                </Grid>
            </Grid>
        );
    },

    name: "Two level validation (warning and error)",
};
