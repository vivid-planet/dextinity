import { Edit } from "@dextinity/admin-icons";
import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { type TimeRange, TimeRangePicker } from "../TimeRangePicker";

type Story = StoryObj<typeof TimeRangePicker>;
const config: Meta<typeof TimeRangePicker> = {
    component: TimeRangePicker,
    title: "components/dateTime/TimeRangePicker",
};

export default config;

/**
 * The basic TimeRangePicker component allows users to select a time range from a time picker interface.
 *
 * Use this for time range input fields where users need to pick a start and end time.
 */
export const Default: Story = {
    render: (args) => {
        const [value, setValue] = useState<TimeRange | undefined>({ start: "09:00", end: "17:00" });
        return <TimeRangePicker {...args} value={value} onChange={setValue} />;
    },
};

export const FullWidth: Story = {
    render: (args) => {
        const [value, setValue] = useState<TimeRange | undefined>({ start: "09:00", end: "17:00" });
        return <TimeRangePicker {...args} fullWidth value={value} onChange={setValue} />;
    },
};

/**
 * TimeRangePicker in a required state.
 *
 * Use this when:
 * - The time range selection is mandatory
 * - Form validation requires time range values
 * - Users must select a time range to proceed
 *
 * Note: The clear button is automatically hidden when the field is required.
 */
export const Required: Story = {
    render: (args) => {
        const [value, setValue] = useState<TimeRange | undefined>({ start: "09:00", end: "17:00" });
        return <TimeRangePicker {...args} required value={value} onChange={setValue} />;
    },
};

/**
 * TimeRangePicker in a disabled state.
 *
 * Use this when:
 * - The time range cannot be changed due to permissions or state
 * - You want to show time range values but prevent interaction
 * - Form logic requires the field to be temporarily disabled
 */
export const Disabled: Story = {
    render: (args) => {
        const [value, setValue] = useState<TimeRange | undefined>({ start: "09:00", end: "17:00" });
        return <TimeRangePicker {...args} disabled value={value} onChange={setValue} />;
    },
};

/**
 * TimeRangePicker in a read-only state.
 *
 * Use this when:
 * - The time range should be visible but not editable
 * - You want to display time range values that cannot be modified
 * - The field is used for reference only
 */
export const ReadOnly: Story = {
    render: (args) => {
        const [value, setValue] = useState<TimeRange | undefined>({ start: "09:00", end: "17:00" });
        return <TimeRangePicker {...args} readOnly value={value} onChange={setValue} />;
    },
};

/**
 * TimeRangePicker with a custom icon.
 *
 * Use this when:
 * - You want to match your brand's icon style
 * - The default time icon doesn't fit your design
 * - You need to indicate a specific type of time range selection
 */
export const WithCustomIcon: Story = {
    render: (args) => {
        const [value, setValue] = useState<TimeRange | undefined>({ start: "09:00", end: "17:00" });
        return (
            <TimeRangePicker
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
 * Multiple TimeRangePicker instances demonstrating different configurations.
 *
 * This example shows how TimeRangePickers can be combined in forms or interfaces
 * to collect multiple time range values with different requirements and states.
 */
export const MultiplePickers: Story = {
    render: (args) => {
        const [morning, setMorning] = useState<TimeRange | undefined>({ start: "08:00", end: "12:00" });
        const [afternoon, setAfternoon] = useState<TimeRange | undefined>({ start: "13:00", end: "17:00" });

        return (
            <Box display="flex" flexDirection="column" gap={4}>
                <Typography variant="h5">Opening Hours</Typography>
                <TimeRangePicker {...args} label="Morning" fullWidth value={morning} onChange={setMorning} />
                <TimeRangePicker {...args} label="Afternoon" fullWidth value={afternoon} onChange={setAfternoon} />
            </Box>
        );
    },
};
