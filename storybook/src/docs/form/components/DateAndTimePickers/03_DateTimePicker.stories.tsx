import { Field, FieldContainer } from "@dextinity/admin";
import { DateTimePicker, FinalFormDateTimePicker } from "@dextinity/admin-date-time";
import { Grid } from "@mui/material";
import { useState } from "react";
import { Form } from "react-final-form";

export default {
    title: "Docs/Form/Components/Date & Time Pickers/Date-Time Picker",
};

export const Basic = () => {
    const [dateTimeOne, setDateTimeOne] = useState<Date | undefined>();
    const [dateTimeTwo, setDateTimeTwo] = useState<Date | undefined>(new Date());
    const [dateTimeThree, setDateTimeThree] = useState<Date | undefined>();
    const [dateTimeFour, setDateFour] = useState<Date | undefined>(new Date());

    return (
        <Grid container spacing={4}>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}
            >
                <FieldContainer label="Date-Time Picker" fullWidth>
                    <DateTimePicker value={dateTimeOne} onChange={setDateTimeOne} />
                </FieldContainer>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}
            >
                <FieldContainer label="Required" fullWidth required>
                    <DateTimePicker value={dateTimeTwo} onChange={setDateTimeTwo} required />
                </FieldContainer>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}
            >
                <FieldContainer label="Custom placeholders" fullWidth>
                    <DateTimePicker
                        value={dateTimeThree}
                        onChange={setDateTimeThree}
                        slotProps={{
                            datePicker: { placeholder: "Date placeholder" },
                            timePicker: { placeholder: "Time Placeholder" },
                        }}
                    />
                </FieldContainer>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                }}
            >
                <FieldContainer label="Custom date format" fullWidth>
                    <DateTimePicker
                        value={dateTimeFour}
                        onChange={setDateFour}
                        slotProps={{
                            datePicker: {
                                formatDateOptions: {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                },
                            },
                        }}
                    />
                </FieldContainer>
            </Grid>
        </Grid>
    );
};

export const FinalForm = () => {
    type Values = {
        dateTimeOne?: Date;
        dateTimeTwo?: Date;
        dateTimeThree?: Date;
        dateTimeFour?: Date;
    };

    return (
        <Form<Values> initialValues={{ dateTimeTwo: new Date(), dateTimeFour: new Date() }} onSubmit={() => {}}>
            {() => (
                <Grid container spacing={4}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >
                        <Field name="dateTimeOne" label="Date Picker" fullWidth component={FinalFormDateTimePicker} />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >
                        <Field name="dateTimeTwo" label="Required" fullWidth required component={FinalFormDateTimePicker} />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >
                        <Field
                            name="dateTimeThree"
                            label="Custom placeholders"
                            fullWidth
                            component={FinalFormDateTimePicker}
                            componentsProps={{
                                datePicker: { placeholder: "Date placeholder" },
                                timePicker: { placeholder: "Time Placeholder" },
                            }}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >
                        <Field
                            name="dateTimeFour"
                            label="Custom date format"
                            fullWidth
                            component={FinalFormDateTimePicker}
                            componentsProps={{
                                datePicker: {
                                    formatDateOptions: {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    },
                                },
                            }}
                        />
                    </Grid>
                </Grid>
            )}
        </Form>
    );
};
