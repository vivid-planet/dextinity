import { Edit } from "@dextinity/admin-icons";
import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { DateTimePicker } from "../DateTimePicker";

type Story = StoryObj<typeof DateTimePicker>;
const config: Meta<typeof DateTimePicker> = {
    component: DateTimePicker,
    title: "components/dateTime/DateTimePicker",
};

export default config;

/**
 * The basic DateTimePicker component allows users to select both a date and time from a calendar and time picker interface.
 *
 * Use this for date time input fields where users need to pick a specific date and time.
 */
export const Default: Story = {
    render: (args) => {
        const [value, setValue] = useState<Date | undefined>(new Date(2024, 0, 15, 14, 30));
        return <DateTimePicker {...args} value={value} onChange={setValue} />;
    },
};

export const FullWidth: Story = {
    render: (args) => {
        const [value, setValue] = useState<Date | undefined>(new Date(2024, 0, 15, 14, 30));
        return <DateTimePicker {...args} fullWidth value={value} onChange={setValue} />;
    },
};

/**
 * DateTimePicker in a required state.
 *
 * Use this when:
 * - The date and time selection is mandatory
 * - Form validation requires a date time value
 * - Users must select a date and time to proceed
 *
 * Note: The clear button is automatically hidden when the field is required.
 */
export const Required: Story = {
    render: (args) => {
        const [value, setValue] = useState<Date | undefined>(new Date(2024, 0, 15, 14, 30));
        return <DateTimePicker {...args} required value={value} onChange={setValue} />;
    },
};

/**
 * DateTimePicker in a disabled state.
 *
 * Use this when:
 * - The date and time cannot be changed due to permissions or state
 * - You want to show a date time value but prevent interaction
 * - Form logic requires the field to be temporarily disabled
 */
export const Disabled: Story = {
    render: (args) => {
        const [value, setValue] = useState<Date | undefined>(new Date(2024, 0, 15, 14, 30));
        return <DateTimePicker {...args} disabled value={value} onChange={setValue} />;
    },
};

/**
 * DateTimePicker in a read-only state.
 *
 * Use this when:
 * - The date and time should be visible but not editable
 * - You want to display a date time value that cannot be modified
 * - The field is used for reference only
 */
export const ReadOnly: Story = {
    render: (args) => {
        const [value, setValue] = useState<Date | undefined>(new Date(2024, 0, 15, 14, 30));
        return <DateTimePicker {...args} readOnly value={value} onChange={setValue} />;
    },
};

/**
 * DateTimePicker with a custom icon.
 *
 * Use this when:
 * - You want to match your brand's icon style
 * - The default calendar icon doesn't fit your design
 * - You need to indicate a specific type of date time selection
 */
export const WithCustomIcon: Story = {
    render: (args) => {
        const [value, setValue] = useState<Date | undefined>(new Date(2024, 0, 15, 14, 30));
        return (
            <DateTimePicker
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
 * DateTimePicker with date restrictions.
 *
 * Use this when:
 * - Only certain dates should be selectable
 * - You need to limit selection to future or past dates
 * - Business rules require date time range restrictions
 */
export const WithDateRestrictions: Story = {
    args: {
        minDate: new Date(),
    },
    argTypes: {
        minDate: { control: "date" },
    },
    render: (args) => {
        const [value, setValue] = useState<Date | undefined>();
        return <DateTimePicker {...args} label="Future Date Time Only" minDate={args.minDate} value={value} onChange={setValue} />;
    },
};

/**
 * Multiple DateTimePicker instances demonstrating different configurations.
 *
 * This example shows how DateTimePickers can be combined in forms or interfaces
 * to collect multiple date time values with different requirements and states.
 */
export const MultiplePickers: Story = {
    render: (args) => {
        const [startDateTime, setStartDateTime] = useState<Date | undefined>(new Date(2024, 0, 15, 9, 0));
        const [endDateTime, setEndDateTime] = useState<Date | undefined>(new Date(2024, 0, 15, 17, 0));

        return (
            <Box display="flex" flexDirection="column" gap={4}>
                <Typography variant="h5">Date Time Range Selection</Typography>
                <DateTimePicker {...args} label="Start Date Time" fullWidth value={startDateTime} onChange={setStartDateTime} />
                <DateTimePicker {...args} label="End Date Time" fullWidth value={endDateTime} onChange={setEndDateTime} />
            </Box>
        );
    },
};
