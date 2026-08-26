import { Edit } from "@dextinity/admin-icons";
import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { DatePicker } from "../DatePicker";

type Story = StoryObj<typeof DatePicker>;
const config: Meta<typeof DatePicker> = {
    component: DatePicker,
    title: "components/dateTime/DatePicker",
};

export default config;

/**
 * The basic DatePicker component allows users to select a date from a calendar interface.
 *
 * Use this for date input fields where users need to pick a specific date.
 */
export const Default: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>("2024-01-15");
        return <DatePicker {...args} value={value} onChange={setValue} />;
    },
};

export const FullWidth: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>("2024-01-15");
        return <DatePicker {...args} fullWidth value={value} onChange={setValue} />;
    },
};

/**
 * DatePicker in a required state.
 *
 * Use this when:
 * - The date selection is mandatory
 * - Form validation requires a date value
 * - Users must select a date to proceed
 *
 * Note: The clear button is automatically hidden when the field is required.
 */
export const Required: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>("2024-01-15");
        return <DatePicker {...args} required value={value} onChange={setValue} />;
    },
};

/**
 * DatePicker in a disabled state.
 *
 * Use this when:
 * - The date cannot be changed due to permissions or state
 * - You want to show a date value but prevent interaction
 * - Form logic requires the field to be temporarily disabled
 */
export const Disabled: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>("2024-01-15");
        return <DatePicker {...args} disabled value={value} onChange={setValue} />;
    },
};

/**
 * DatePicker in a read-only state.
 *
 * Use this when:
 * - The date should be visible but not editable
 * - You want to display a date value that cannot be modified
 * - The field is used for reference only
 */
export const ReadOnly: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>("2024-01-15");
        return <DatePicker {...args} readOnly value={value} onChange={setValue} />;
    },
};

/**
 * DatePicker with a custom icon.
 *
 * Use this when:
 * - You want to match your brand's icon style
 * - The default calendar icon doesn't fit your design
 * - You need to indicate a specific type of date selection
 */
export const WithCustomIcon: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>("2024-01-15");
        return (
            <DatePicker
                {...args}
                value={value}
                onChange={setValue}
                iconMapping={{
                    openPicker: <Edit />,
                }}
            />
        );
    },
};

/**
 * DatePicker with date restrictions.
 *
 * Use this when:
 * - Only certain dates should be selectable
 * - You need to limit selection to future or past dates
 * - Business rules require date range restrictions
 */
export const WithDateRestrictions: Story = {
    args: {
        minDate: new Date(),
    },
    argTypes: {
        minDate: { control: "date" },
    },
    render: (args) => {
        const [value, setValue] = useState<string | undefined>();
        return <DatePicker {...args} label="Future Date Only" minDate={args.minDate} value={value} onChange={setValue} />;
    },
};

/**
 * Multiple DatePicker instances demonstrating different configurations.
 *
 * This example shows how DatePickers can be combined in forms or interfaces
 * to collect multiple date values with different requirements and states.
 */
export const MultiplePickers: Story = {
    render: (args) => {
        const [startDate, setStartDate] = useState<string | undefined>("2024-01-15");
        const [endDate, setEndDate] = useState<string | undefined>("2024-01-30");

        return (
            <Box display="flex" flexDirection="column" gap={4}>
                <Typography variant="h5">Date Range Selection</Typography>
                <DatePicker {...args} label="Start Date" fullWidth value={startDate} onChange={setStartDate} />
                <DatePicker {...args} label="End Date" fullWidth value={endDate} onChange={setEndDate} />
            </Box>
        );
    },
};
