import { Card, CardContent, Grid } from "@mui/material";
import { Form } from "react-final-form";

import { FieldContainer } from "../../form/FieldContainer";
import { CheckboxField } from "../../form/fields/CheckboxField";

export default {
    title: "components/form",
};

export const Checkbox = () => {
    return (
        <div style={{ width: 600 }}>
            <Form
                initialValues={{
                    unchecked: false,
                    checked: true,
                    disabledUnchecked: false,
                    disabledChecked: true,
                    uncheckedSecondary: false,
                    checkedSecondary: true,
                    disabledUncheckedSecondary: false,
                    disabledCheckedSecondary: true,
                }}
                onSubmit={(values) => {
                    //
                }}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={4}>
                            <Grid size={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <FieldContainer label="Checkboxes">
                                            <CheckboxField name="unchecked" label="Unchecked" fullWidth />
                                            <CheckboxField name="checked" label="Checked" fullWidth />
                                            <CheckboxField name="disabledUnchecked" label="Disabled" fullWidth disabled />
                                            <CheckboxField name="disabledChecked" label="Disabled & Checked" fullWidth disabled />
                                        </FieldContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </form>
                )}
            />
        </div>
    );
};
