import { Card, CardContent, FormControlLabel, Grid } from "@mui/material";
import { Form } from "react-final-form";

import { Field } from "../../form/Field";
import { FieldContainer } from "../../form/FieldContainer";
import { FinalFormRadio } from "../../form/Radio";

export default {
    title: "components/form",
};

export const Radio = () => {
    return (
        <div style={{ width: 600 }}>
            <Form
                initialValues={{
                    foo1: "bar2",
                    foo2: "bar2",
                    foo3: "bar2",
                    foo4: "bar2",
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
                                        <FieldContainer label="Radios">
                                            <Field name="foo1" type="radio" value="bar1" fullWidth>
                                                {(props) => <FormControlLabel label="Unchecked" control={<FinalFormRadio {...props} />} />}
                                            </Field>
                                            <Field name="foo1" type="radio" value="bar2" fullWidth>
                                                {(props) => <FormControlLabel label="Checked" control={<FinalFormRadio {...props} />} />}
                                            </Field>
                                            <Field name="foo2" type="radio" value="bar1" fullWidth disabled>
                                                {(props) => <FormControlLabel label="Disabled" control={<FinalFormRadio {...props} />} />}
                                            </Field>
                                            <Field name="foo2" type="radio" value="bar2" fullWidth disabled>
                                                {(props) => <FormControlLabel label="Disabled & Checked" control={<FinalFormRadio {...props} />} />}
                                            </Field>
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
