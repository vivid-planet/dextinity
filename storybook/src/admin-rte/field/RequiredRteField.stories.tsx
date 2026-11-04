import { Button, FieldSet, TextField } from "@dextinity/admin";
import { createRteField } from "@dextinity/admin-rte";
import { Box, Grid } from "@mui/material";
import { Form } from "react-final-form";

const { RteField } = createRteField();

export default {
    title: "@dextinity/admin-rte/field",
};

type FormValues = {
    rteContent: string;
    rteContentRequired: string;
    plainText: string;
    plainTextRequired: string;
};

export const RequiredRteField = () => {
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
                                    <RteField name="rteContent" label="Rich Text" fullWidth />
                                    <TextField name="plainText" label="TextField for comparison" fullWidth />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <RteField name="rteContentRequired" label="Rich Text (required)" fullWidth required />
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
