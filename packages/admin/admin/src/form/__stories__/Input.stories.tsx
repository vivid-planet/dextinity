import { Card, CardContent } from "@mui/material";
import { Form } from "react-final-form";

import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";

export default {
    title: "components/form",
};

export const Input = () => {
    return (
        <div style={{ width: 300 }}>
            <Form
                onSubmit={(values) => {
                    //
                }}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Card variant="outlined">
                            <CardContent>
                                <Field name="name" label="Foo" component={FinalFormInput} fullWidth />
                            </CardContent>
                        </Card>
                    </form>
                )}
            />
        </div>
    );
};
