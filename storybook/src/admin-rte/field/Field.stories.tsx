import { Button, Field, FinalFormInput, FormSection } from "@dextinity/admin";
import { createFinalFormRte } from "@dextinity/admin-rte";
import { Card, CardContent, Grid } from "@mui/material";
import { useReducer, useState } from "react";
import { Form } from "react-final-form";

const { RteField, RteReadOnly } = createFinalFormRte();

export default {
    title: "@dextinity/admin-rte/field",
};

export const _Field = () => {
    const [submittedValue, setSubmittedValue] = useState<{ rteContent: any }>({ rteContent: undefined });
    const [disabled, toggleDisabled] = useReducer((s) => !s, false);

    return (
        <Grid container spacing={4} style={{ maxWidth: 800 }}>
            <Grid size={12}>
                <Card variant="outlined">
                    <CardContent>
                        <Form
                            onSubmit={(values: { rteContent: any }) => {
                                setSubmittedValue({ rteContent: values.rteContent });
                            }}
                            render={({ handleSubmit }) => (
                                <form onSubmit={handleSubmit}>
                                    <Field name="rteContent" label="Rich Text" component={RteField} disabled={disabled} />
                                    <Field name="somethingElse" label="Something else" component={FinalFormInput} disabled={disabled} />
                                    <Grid container spacing={4}>
                                        <Grid>
                                            <Button variant="secondary" onClick={toggleDisabled}>
                                                {disabled ? "Enable" : "Disable"} inputs
                                            </Button>
                                        </Grid>
                                        <Grid>
                                            <Button type="submit">Submit</Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            )}
                        />
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={12}>
                <Card variant="outlined">
                    <CardContent>
                        <FormSection title="Readonly Component" disableMarginBottom>
                            <RteReadOnly content={submittedValue.rteContent} />
                        </FormSection>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};
