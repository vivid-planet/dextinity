import { type DateRange, DateRangePicker, DateRangePickerField, FieldContainer } from "@dextinity/admin";
import { Grid } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Form } from "react-final-form";

type Story = StoryObj<typeof DateRangePicker>;

const config: Meta<typeof DateRangePicker> = {
    component: DateRangePicker,
    title: "@dextinity/admin/dateTime/DateRangePicker",
};
export default config;

export const Default: Story = {
    render: () => {
        const [dateRange, setDateRange] = useState<DateRange | undefined>({ start: "2025-07-23", end: "2025-07-25" });
        const [requiredDateRange, setRequiredDateRange] = useState<DateRange | undefined>(undefined);
        const [disabledDateRange, setDisabledDateRange] = useState<DateRange | undefined>(undefined);
        const [readOnlyDateRange, setReadOnlyDateRange] = useState<DateRange | undefined>({ start: "2025-07-23", end: "2025-07-25" });

        return (
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldContainer label="Date Range Picker" fullWidth>
                        <DateRangePicker value={dateRange} onChange={setDateRange} fullWidth />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldContainer label="Required Date Range Picker" fullWidth required>
                        <DateRangePicker value={requiredDateRange} onChange={setRequiredDateRange} fullWidth required />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldContainer label="Disabled Date Range Picker" fullWidth disabled>
                        <DateRangePicker value={disabledDateRange} onChange={setDisabledDateRange} fullWidth disabled />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldContainer label="ReadOnly Date Range Picker" fullWidth>
                        <DateRangePicker value={readOnlyDateRange} onChange={setReadOnlyDateRange} fullWidth readOnly />
                    </FieldContainer>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <pre>{`values: ${JSON.stringify({ dateRange, requiredDateRange, disabledDateRange, readOnlyDateRange }, null, 2)}`}</pre>
                </Grid>
            </Grid>
        );
    },
};

export const FinalForm: Story = {
    render: () => {
        type Values = {
            dateRange: DateRange;
            requiredDateRange: DateRange;
            disabledDateRange: DateRange;
            readOnlyDateRange: DateRange;
        };

        return (
            <Form<Values>
                initialValues={{
                    dateRange: { start: "2025-07-23", end: "2025-07-25" },
                    readOnlyDateRange: { start: "2025-07-23", end: "2025-07-25" },
                }}
                onSubmit={() => {}}
            >
                {({ values }) => (
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DateRangePickerField name="dateRange" label="Date Range Picker" fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DateRangePickerField name="requiredDateRange" label="Required Date Range Picker" fullWidth required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DateRangePickerField name="disabledDateRange" label="Disabled Date Range Picker" fullWidth disabled />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DateRangePickerField name="readOnlyDateRange" label="ReadOnly Date Range Picker" fullWidth readOnly />
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
