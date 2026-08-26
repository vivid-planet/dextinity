import { Field } from "@dextinity/admin";
import { FinalFormDateTimePicker } from "@dextinity/admin-date-time";
import { Card, CardContent } from "@mui/material";
import { Form } from "react-final-form";

export default {
    title: "@dextinity/admin-date-time",
};

export const DateTimePicker = {
    render: () => {
        interface Values {
            dateTimeOne?: Date;
            dateTimeTwo?: Date;
            dateTimeThree?: Date;
        }

        const initialValues: Partial<Values> = {
            dateTimeOne: undefined,
            dateTimeTwo: new Date(),
            dateTimeThree: new Date(),
        };

        return (
            <div style={{ width: 500 }}>
                <Form<Values> onSubmit={() => {}} initialValues={initialValues}>
                    {({ values, form: { change } }) => (
                        <form>
                            <Card>
                                <CardContent>
                                    <Field name="dateTimeOne" label="Date-Time" fullWidth component={FinalFormDateTimePicker} />
                                    <Field name="dateTimeTwo" label="Required" fullWidth required component={FinalFormDateTimePicker} />
                                    <Field name="dateTimeThree" label="Disabled" fullWidth disabled component={FinalFormDateTimePicker} />
                                </CardContent>
                            </Card>
                            <pre>{JSON.stringify(values, null, 4)}</pre>
                        </form>
                    )}
                </Form>
            </div>
        );
    },

    name: "Date-Time Picker",
};
