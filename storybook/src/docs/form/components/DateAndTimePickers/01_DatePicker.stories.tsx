import { Field, FieldContainer } from "@dextinity/admin";
import { DatePicker, FinalFormDatePicker } from "@dextinity/admin-date-time";
import { Grid } from "@mui/material";
import { useState } from "react";
import { Form } from "react-final-form";

export default {
    title: "Docs/Form/Components/Date & Time Pickers/Date Picker",
};

export const Basic = () => {
    const [dateOne, setDateOne] = useState<string | undefined>();
    const [dateTwo, setDateTwo] = useState<string | undefined>();
    const [dateThree, setDateThree] = useState<string | undefined>("2024-03-10");
    const [dateFour, setDateFour] = useState<string | undefined>("2024-03-10");

    return (
        <Grid container spacing={4}>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}
            >
                <FieldContainer label="Date Picker" fullWidth>
                    <DatePicker fullWidth value={dateOne} onChange={setDateOne} />
                </FieldContainer>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}
            >
                <FieldContainer label="Show two months" fullWidth>
                    <DatePicker fullWidth value={dateTwo} onChange={setDateTwo} monthsToShow={2} />
                </FieldContainer>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}
            >
                <FieldContainer label="Required" fullWidth required>
                    <DatePicker fullWidth value={dateThree} onChange={setDateThree} required />
                </FieldContainer>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 3,
                }}
            >
                <FieldContainer label="Formatted date" fullWidth>
                    <DatePicker
                        fullWidth
                        value={dateFour}
                        onChange={setDateFour}
                        formatDateOptions={{ month: "long", day: "numeric", year: "numeric" }}
                    />
                </FieldContainer>
            </Grid>
        </Grid>
    );
};

export const FinalForm = () => {
    type Values = {
        dateOne: string;
        dateTwo: string;
        dateThree: string;
        dateFour: string;
    };

    return (
        <Form<Values> initialValues={{ dateThree: "2024-03-10", dateFour: "2024-03-10" }} onSubmit={() => {}}>
            {() => (
                <Grid container spacing={4}>
                    <Grid
                        size={{
                            xs: 6,
                            md: 3,
                        }}
                    >
                        <Field name="dateOne" label="Date Picker" fullWidth component={FinalFormDatePicker} />
                    </Grid>
                    <Grid
                        size={{
                            xs: 6,
                            md: 3,
                        }}
                    >
                        <Field name="dateTwo" label="Show two months" fullWidth component={FinalFormDatePicker} monthsToShow={2} />
                    </Grid>
                    <Grid
                        size={{
                            xs: 6,
                            md: 3,
                        }}
                    >
                        <Field name="dateThree" label="Required" fullWidth component={FinalFormDatePicker} required />
                    </Grid>
                    <Grid
                        size={{
                            xs: 6,
                            md: 3,
                        }}
                    >
                        <Field
                            name="dateFour"
                            label="Formatted date"
                            fullWidth
                            component={FinalFormDatePicker}
                            formatDateOptions={{ month: "long", day: "numeric", year: "numeric" }}
                        />
                    </Grid>
                </Grid>
            )}
        </Form>
    );
};
