import { Card, CardContent, Divider, Typography } from "@mui/material";
import { Form } from "react-final-form";
import { FormattedDate } from "react-intl";

import { Field } from "../../form/Field";
import { FieldContainer } from "../../form/FieldContainer";

export default {
    title: "components/form",
};

export const TypographyStaticTextInForm = {
    render: () => {
        const initialValues = {
            foo: "FooValue",
            bar: "BarValue",
        };
        return (
            <div style={{ width: "500px" }}>
                <Form
                    onSubmit={(values) => {
                        //
                    }}
                    initialValues={initialValues}
                    render={({ handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography>Render field value as static text (using MUI Typography)</Typography>
                                    <Field name="foo" label="Foo">
                                        {(fieldRenderProps) => <Typography>{fieldRenderProps.input.value}</Typography>}
                                    </Field>
                                </CardContent>

                                <Divider />

                                <CardContent>
                                    <Typography>
                                        Or, simpler, if the value isn&apos;t part of the form (doesn&apos;t change), render it without final-form:
                                    </Typography>
                                    <FieldContainer label="Bar">
                                        <Typography>{initialValues.bar}</Typography>
                                    </FieldContainer>
                                </CardContent>

                                <Divider />

                                <CardContent>
                                    <Typography>Of course you can use any formatting:</Typography>
                                    <FieldContainer label="Today">
                                        <Typography>
                                            <FormattedDate value={new Date()} />
                                        </Typography>
                                    </FieldContainer>
                                </CardContent>
                            </Card>
                        </form>
                    )}
                />
            </div>
        );
    },

    name: "Typography Static Text in Form",
};
