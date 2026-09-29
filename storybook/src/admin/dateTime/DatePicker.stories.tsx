import { DatePicker, DatePickerField, FieldContainer } from "@dextinity/admin";
import { Grid } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Form } from "react-final-form";

type Story = StoryObj<typeof DatePicker>;

const config: Meta<typeof DatePicker> = {
    component: DatePicker,
    title: "@dextinity/admin/dateTime/DatePicker",
};
export default config;

export const Default: Story = {
    render: () => {
        const [date, setDate] = useState<string | undefined>("2025-07-23");
        const [requiredDate, setRequiredDate] = useState<string | undefined>(undefined);
        const [disabledDate, setDisabledDate] = useState<string | undefined>(undefined);
        const [readOnlyDate, setReadOnlyDate] = useState<string | undefined>("2025-07-23");

        return (
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FieldContainer label="Date Picker" fullWidth>
                        <DatePicker value={date} onChange={setDate} fullWidth />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FieldContainer label="Required Date Picker" fullWidth required>
                        <DatePicker value={requiredDate} onChange={setRequiredDate} fullWidth required />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FieldContainer label="Disabled Date Picker" fullWidth disabled>
                        <DatePicker value={disabledDate} onChange={setDisabledDate} fullWidth disabled />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FieldContainer label="ReadOnly Date Picker" fullWidth>
                        <DatePicker value={readOnlyDate} onChange={setReadOnlyDate} fullWidth readOnly />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <pre>{`values: ${JSON.stringify({ date, requiredDate, disabledDate, readOnlyDate }, null, 2)}`}</pre>
                </Grid>
            </Grid>
        );
    },
};

export const FinalForm: Story = {
    render: () => {
        type Values = {
            date: string;
            requiredDate: string;
            disabledDate: string;
            readOnlyDate: string;
        };

        return (
            <Form<Values>
                initialValues={{
                    date: "2025-07-23",
                    readOnlyDate: "2025-07-23",
                }}
                onSubmit={() => {}}
            >
                {({ values }) => (
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <DatePickerField name="date" label="Date Picker" fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <DatePickerField name="requiredDate" label="Required Date Picker" fullWidth required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <DatePickerField name="disabledDate" label="Disabled Date Picker" fullWidth disabled />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <DatePickerField name="readOnlyDate" label="ReadOnly Date Picker" fullWidth readOnly />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <pre>{`values: ${JSON.stringify(values, null, 2)}`}</pre>
                        </Grid>
                    </Grid>
                )}
            </Form>
        );
    },
};
