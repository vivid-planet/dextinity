import { Field } from "@dextinity/admin";
import { FinalFormDatePicker } from "@dextinity/admin-date-time";
import { Card, CardContent } from "@mui/material";
import { Form } from "react-final-form";

export default {
    title: "@dextinity/admin-date-time",
};

export const DatePicker = () => {
    type Values = {
        dateOne: string;
        dateTwo: string;
    };

    return (
        <div style={{ width: 500 }}>
            <Form<Values>
                onSubmit={() => {}}
                initialValues={{
                    dateTwo: "2024-04-01",
                }}
            >
                {({ values }) => (
                    <form>
                        <Card>
                            <CardContent>
                                <Field name="dateOne" label="Date" fullWidth component={FinalFormDatePicker} />
                                <Field name="dateTwo" label="Required" fullWidth required component={FinalFormDatePicker} />
                            </CardContent>
                        </Card>
                        <pre>{JSON.stringify(values, null, 4)}</pre>
                    </form>
                )}
            </Form>
        </div>
    );
};
