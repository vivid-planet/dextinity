import { Field } from "@dextinity/admin";
import { FinalFormTimeRangePicker, type TimeRange } from "@dextinity/admin-date-time";
import { Card, CardContent } from "@mui/material";
import { Form } from "react-final-form";

export default {
    title: "@dextinity/admin-date-time",
};

export const TimeRangePicker = () => {
    interface Values {
        timeRangeOne?: TimeRange;
        timeRangeTwo?: TimeRange;
    }

    const initialValues: Partial<Values> = {
        timeRangeOne: undefined,
        timeRangeTwo: {
            start: "11:30",
            end: "12:30",
        },
    };

    return (
        <div style={{ width: 500 }}>
            <Form<Values> onSubmit={() => {}} initialValues={initialValues}>
                {({ values }) => (
                    <form>
                        <Card>
                            <CardContent>
                                <Field name="timeRangeOne" label="Time range" fullWidth component={FinalFormTimeRangePicker} />
                                <Field name="timeRangeTwo" label="Required" fullWidth required component={FinalFormTimeRangePicker} />
                            </CardContent>
                        </Card>
                        <pre>{JSON.stringify(values, null, 4)}</pre>
                    </form>
                )}
            </Form>
        </div>
    );
};
