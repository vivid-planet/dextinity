import { DateField, type DateRange, DateRangeField, DateTimeField, TimeField, type TimeRange, TimeRangeField } from "@dextinity/admin-date-time";
import { Box, Card, CardContent } from "@mui/material";
import { Form } from "react-final-form";

export default {
    title: "@dextinity/admin-date-time",
    args: {
        initialValues: false,
    },
    argTypes: {
        initialValues: {
            name: "Show Initial Values",
            control: "boolean",
        },
    },
};

type Args = {
    initialValues: boolean;
};

export const AllPickers = {
    render: ({ initialValues }: Args) => {
        type FormValues = {
            date: string;
            dateRange: DateRange;
            dateTime: Date;
            time: string;
            timeRange: TimeRange;
        };

        return (
            <Box width={550}>
                <Form<FormValues>
                    onSubmit={() => {}}
                    initialValues={
                        initialValues
                            ? {
                                  date: "2024-03-01",
                                  dateRange: {
                                      start: "2024-03-01",
                                      end: "2024-03-05",
                                  },
                                  dateTime: new Date(),
                                  time: "11:30",
                                  timeRange: {
                                      start: "11:30",
                                      end: "12:30",
                                  },
                              }
                            : {}
                    }
                >
                    {({ values }) => (
                        <form>
                            <Card>
                                <CardContent>
                                    <DateField name="date" label="Date" fullWidth helperText={`Stringified value: ${JSON.stringify(values.date)}`} />
                                    <DateRangeField
                                        name="dateRange"
                                        label="DateRange"
                                        fullWidth
                                        helperText={`Stringified value: ${JSON.stringify(values.dateRange)}`}
                                    />
                                    <DateTimeField
                                        name="dateTime"
                                        label="DateTime"
                                        fullWidth
                                        helperText={`Stringified value: ${JSON.stringify(values.dateTime)}`}
                                    />
                                    <TimeField name="time" label="Time" fullWidth helperText={`Stringified value: ${JSON.stringify(values.time)}`} />
                                    <TimeRangeField
                                        name="timeRange"
                                        label="TimeRange"
                                        fullWidth
                                        helperText={`Stringified value: ${JSON.stringify(values.timeRange)}`}
                                    />
                                </CardContent>
                            </Card>
                        </form>
                    )}
                </Form>
            </Box>
        );
    },
};
