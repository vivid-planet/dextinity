import { FieldContainer, TimePicker, TimePickerField } from "@dextinity/admin";
import { Grid } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Form } from "react-final-form";

type Story = StoryObj<typeof TimePicker>;

const config: Meta<typeof TimePicker> = {
    component: TimePicker,
    title: "@dextinity/admin/dateTime/TimePicker",
};
export default config;

export const Default: Story = {
    render: () => {
        const [time, setTime] = useState<string | undefined>("11:30");
        const [requiredTime, setRequiredTime] = useState<string | undefined>(undefined);
        const [disabledTime, setDisabledTime] = useState<string | undefined>(undefined);
        const [readOnlyTime, setReadOnlyTime] = useState<string | undefined>("11:30");

        return (
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FieldContainer label="Time Picker" fullWidth>
                        <TimePicker value={time} onChange={setTime} fullWidth />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FieldContainer label="Required Time Picker" fullWidth required>
                        <TimePicker value={requiredTime} onChange={setRequiredTime} fullWidth required />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FieldContainer label="Disabled Time Picker" fullWidth disabled>
                        <TimePicker value={disabledTime} onChange={setDisabledTime} fullWidth disabled />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FieldContainer label="ReadOnly Time Picker" fullWidth>
                        <TimePicker value={readOnlyTime} onChange={setReadOnlyTime} fullWidth readOnly />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <pre>{`values: ${JSON.stringify({ time, requiredTime, disabledTime, readOnlyTime }, null, 2)}`}</pre>
                </Grid>
            </Grid>
        );
    },
};

export const FinalForm: Story = {
    render: () => {
        type Values = {
            time: string;
            requiredTime: string;
            disabledTime: string;
            readOnlyTime: string;
        };

        return (
            <Form<Values>
                initialValues={{
                    time: "11:30",
                    readOnlyTime: "11:30",
                }}
                onSubmit={() => {}}
            >
                {({ values }) => (
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TimePickerField name="time" label="Time Picker" fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TimePickerField name="requiredTime" label="Required Time Picker" fullWidth required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TimePickerField name="disabledTime" label="Disabled Time Picker" fullWidth disabled />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TimePickerField name="readOnlyTime" label="ReadOnly Time Picker" fullWidth readOnly />
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
