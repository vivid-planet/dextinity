import { DateTimePicker, FieldContainer } from "@dextinity/admin";
import { Grid } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

type Story = StoryObj<typeof DateTimePicker>;

const config: Meta<typeof DateTimePicker> = {
    component: DateTimePicker,
    title: "@dextinity/admin/dateTime/DateTimePicker",
};
export default config;

export const Default: Story = {
    render: () => {
        const [dateTime, setDateTime] = useState<Date | undefined>(new Date("2025-07-23 14:30"));
        const [requiredDateTime, setRequiredDateTime] = useState<Date | undefined>(undefined);
        const [disabledDateTime, setDisabledDateTime] = useState<Date | undefined>(undefined);
        const [readOnlyDateTime, setReadOnlyDateTime] = useState<Date | undefined>(new Date("2025-07-23 14:30"));

        return (
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FieldContainer label="Date-Time Picker" fullWidth>
                        <DateTimePicker value={dateTime} onChange={setDateTime} fullWidth />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FieldContainer label="Required Date-Time Picker" fullWidth required>
                        <DateTimePicker value={requiredDateTime} onChange={setRequiredDateTime} fullWidth required />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FieldContainer label="Disabled Date-Time Picker" fullWidth disabled>
                        <DateTimePicker value={disabledDateTime} onChange={setDisabledDateTime} fullWidth disabled />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FieldContainer label="ReadOnly Date-Time Picker" fullWidth>
                        <DateTimePicker value={readOnlyDateTime} onChange={setReadOnlyDateTime} fullWidth readOnly />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <pre>{`values: ${JSON.stringify({ dateTime, requiredDateTime, disabledDateTime, readOnlyDateTime }, null, 2)}`}</pre>
                </Grid>
            </Grid>
        );
    },
};
