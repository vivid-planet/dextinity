import { Button, Field, FieldSet, TextField } from "@dextinity/admin";
import { createFinalFormRte, requiredValidator } from "@dextinity/admin-rte";
import { Box, Grid } from "@mui/material";
import { Form } from "react-final-form";

const { RteField } = createFinalFormRte();

export default {
    title: "@dextinity/admin-rte/field",
};

type FormValues = {
    rteContent: string;
    rteContentRequired: string;
    plainText: string;
    plainTextRequired: string;
};

export const RequiredFinalFormRte = () => {
    return (
        <Box maxWidth={800} p={4}>
            <FieldSet>
                <Form<FormValues>
                    onSubmit={(values) => {
                        console.log("Submitted values:", values);
                    }}
                    render={({ handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field name="rteContent" label="Rich Text" component={RteField} fullWidth />
                                    <TextField name="plainText" label="TextField for comparison" fullWidth />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field
                                        name="rteContentRequired"
                                        label="Rich Text (required)"
                                        component={RteField}
                                        fullWidth
                                        required
                                        validate={requiredValidator}
                                    />
                                    <TextField name="plainTextRequired" label="TextField for comparison (required)" fullWidth required />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Button type="submit">Submit</Button>
                                </Grid>
                            </Grid>
                        </form>
                    )}
                />
            </FieldSet>
        </Box>
    );
};
