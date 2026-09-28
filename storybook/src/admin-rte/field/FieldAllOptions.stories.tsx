import { Button, Field, FormSection } from "@dextinity/admin";
import { createFinalFormRte } from "@dextinity/admin-rte";
import { Card, CardContent, Grid } from "@mui/material";
import { useState } from "react";
import { Form } from "react-final-form";

import { type ContentFormat, defaultContent, makeApiOptions, rteOptions } from "../RteAllOptions.stories";

const { RteField, RteReadOnly } = createFinalFormRte<ContentFormat>({
    rteApiOptions: makeApiOptions, // see ./RteAllOptions for details
    rteOptions, // see ./RteAllOptions for details
});

export default {
    title: "@dextinity/admin-rte/field",
};

export const FieldAllOptions = {
    render: () => {
        const [submittedValue, setSubmittedValue] = useState<{ rteContent: any }>({ rteContent: defaultContent });

        return (
            <Grid container spacing={4} style={{ maxWidth: 800 }}>
                <Grid size={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Form
                                initialValues={{
                                    rteContent: defaultContent,
                                }}
                                onSubmit={(values) => {
                                    setSubmittedValue({ rteContent: values.rteContent });
                                }}
                                render={({ handleSubmit }) => (
                                    <form onSubmit={handleSubmit}>
                                        <Field name="rteContent" label="Rich Text" component={RteField} fullWidth />
                                        <Button type="submit">Submit</Button>
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
    },

    name: "Field, all options",
};
