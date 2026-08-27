import { Edit } from "@dextinity/admin-icons";
import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { TimePicker } from "../TimePicker";

type Story = StoryObj<typeof TimePicker>;
const config: Meta<typeof TimePicker> = {
    component: TimePicker,
    title: "components/dateTime/TimePicker",
};

export default config;

/**
 * The basic TimePicker component allows users to select a time from a time picker interface.
 *
 * Use this for time input fields where users need to pick a specific time.
 */
export const Default: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>("14:30");
        return <TimePicker {...args} value={value} onChange={setValue} />;
    },
};

export const FullWidth: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>("14:30");
        return <TimePicker {...args} fullWidth value={value} onChange={setValue} />;
    },
};

/**
 * TimePicker in a required state.
 *
 * Use this when:
 * - The time selection is mandatory
 * - Form validation requires a time value
 * - Users must select a time to proceed
 *
 * Note: The clear button is automatically hidden when the field is required.
 */
export const Required: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>("14:30");
        return <TimePicker {...args} required value={value} onChange={setValue} />;
    },
};

/**
 * TimePicker in a disabled state.
 *
 * Use this when:
 * - The time cannot be changed due to permissions or state
 * - You want to show a time value but prevent interaction
 * - Form logic requires the field to be temporarily disabled
 */
export const Disabled: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>("14:30");
        return <TimePicker {...args} disabled value={value} onChange={setValue} />;
    },
};

/**
 * TimePicker in a read-only state.
 *
 * Use this when:
 * - The time should be visible but not editable
 * - You want to display a time value that cannot be modified
 * - The field is used for reference only
 */
export const ReadOnly: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>("14:30");
        return <TimePicker {...args} readOnly value={value} onChange={setValue} />;
    },
};

/**
 * TimePicker with a custom icon.
 *
 * Use this when:
 * - You want to match your brand's icon style
 * - The default time icon doesn't fit your design
 * - You need to indicate a specific type of time selection
 */
export const WithCustomIcon: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | undefined>("14:30");
        return (
            <TimePicker
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
 * TimePicker with time restrictions.
 *
 * Use this when:
 * - Only certain times should be selectable
 * - You need to limit selection to business hours
 * - Business rules require time range restrictions
 */
export const WithTimeRestrictions: Story = {
    args: {
        minTime: new Date(2000, 0, 1, 9, 0),
        maxTime: new Date(2000, 0, 1, 17, 0),
    },
    argTypes: {
        minTime: { control: "date" },
        maxTime: { control: "date" },
    },
    render: (args) => {
        const [value, setValue] = useState<string | undefined>();
        return <TimePicker {...args} label="Business Hours Only" minTime={args.minTime} maxTime={args.maxTime} value={value} onChange={setValue} />;
    },
};

/**
 * Multiple TimePicker instances demonstrating different configurations.
 *
 * This example shows how TimePickers can be combined in forms or interfaces
 * to collect multiple time values with different requirements and states.
 */
export const MultiplePickers: Story = {
    render: (args) => {
        const [startTime, setStartTime] = useState<string | undefined>("09:00");
        const [endTime, setEndTime] = useState<string | undefined>("17:00");

        return (
            <Box display="flex" flexDirection="column" gap={4}>
                <Typography variant="h5">Work Hours</Typography>
                <TimePicker {...args} label="Start Time" fullWidth value={startTime} onChange={setStartTime} />
                <TimePicker {...args} label="End Time" fullWidth value={endTime} onChange={setEndTime} />
            </Box>
        );
    },
};
