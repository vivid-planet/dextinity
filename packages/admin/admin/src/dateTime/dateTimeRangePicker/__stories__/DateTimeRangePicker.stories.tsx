import { Edit } from "@dextinity/admin-icons";
import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { type DateTimeRange, DateTimeRangePicker } from "../DateTimeRangePicker";

type Story = StoryObj<typeof DateTimeRangePicker>;
const config: Meta<typeof DateTimeRangePicker> = {
    component: DateTimeRangePicker,
    title: "components/dateTime/DateTimeRangePicker",
};

export default config;

/**
 * The basic DateTimeRangePicker component allows users to select a date time range from calendar and time picker interfaces.
 *
 * Use this for date time range input fields where users need to pick a start and end date with time.
 */
export const Default: Story = {
    render: (args) => {
        const [value, setValue] = useState<DateTimeRange | undefined>({
            start: new Date(2024, 0, 15, 9, 0),
            end: new Date(2024, 0, 15, 17, 0),
        });
        return <DateTimeRangePicker {...args} value={value} onChange={setValue} />;
    },
};

export const FullWidth: Story = {
    render: (args) => {
        const [value, setValue] = useState<DateTimeRange | undefined>({
            start: new Date(2024, 0, 15, 9, 0),
            end: new Date(2024, 0, 15, 17, 0),
        });
        return <DateTimeRangePicker {...args} fullWidth value={value} onChange={setValue} />;
    },
};

/**
 * DateTimeRangePicker in a required state.
 *
 * Use this when:
 * - The date time range selection is mandatory
 * - Form validation requires date time range values
 * - Users must select a date time range to proceed
 *
 * Note: The clear button is automatically hidden when the field is required.
 */
export const Required: Story = {
    render: (args) => {
        const [value, setValue] = useState<DateTimeRange | undefined>({
            start: new Date(2024, 0, 15, 9, 0),
            end: new Date(2024, 0, 15, 17, 0),
        });
        return <DateTimeRangePicker {...args} required value={value} onChange={setValue} />;
    },
};

/**
 * DateTimeRangePicker in a disabled state.
 *
 * Use this when:
 * - The date time range cannot be changed due to permissions or state
 * - You want to show date time range values but prevent interaction
 * - Form logic requires the field to be temporarily disabled
 */
export const Disabled: Story = {
    render: (args) => {
        const [value, setValue] = useState<DateTimeRange | undefined>({
            start: new Date(2024, 0, 15, 9, 0),
            end: new Date(2024, 0, 15, 17, 0),
        });
        return <DateTimeRangePicker {...args} disabled value={value} onChange={setValue} />;
    },
};

/**
 * DateTimeRangePicker in a read-only state.
 *
 * Use this when:
 * - The date time range should be visible but not editable
 * - You want to display date time range values that cannot be modified
 * - The field is used for reference only
 */
export const ReadOnly: Story = {
    render: (args) => {
        const [value, setValue] = useState<DateTimeRange | undefined>({
            start: new Date(2024, 0, 15, 9, 0),
            end: new Date(2024, 0, 15, 17, 0),
        });
        return <DateTimeRangePicker {...args} readOnly value={value} onChange={setValue} />;
    },
};

/**
 * DateTimeRangePicker with a custom icon.
 *
 * Use this when:
 * - You want to match your brand's icon style
 * - The default calendar icon doesn't fit your design
 * - You need to indicate a specific type of date time range selection
 */
export const WithCustomIcon: Story = {
    render: (args) => {
        const [value, setValue] = useState<DateTimeRange | undefined>({
            start: new Date(2024, 0, 15, 9, 0),
            end: new Date(2024, 0, 15, 17, 0),
        });
        return (
            <DateTimeRangePicker
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
 * DateTimeRangePicker with date restrictions.
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
        const [value, setValue] = useState<DateTimeRange | undefined>();
        return <DateTimeRangePicker {...args} label="Future Date Time Range Only" minDate={args.minDate} value={value} onChange={setValue} />;
    },
};

/**
 * Multiple DateTimeRangePicker instances demonstrating different configurations.
 *
 * This example shows how DateTimeRangePickers can be combined in forms or interfaces
 * to collect multiple date time range values with different requirements and states.
 */
export const MultiplePickers: Story = {
    render: (args) => {
        const [shift1, setShift1] = useState<DateTimeRange | undefined>({
            start: new Date(2024, 0, 15, 8, 0),
            end: new Date(2024, 0, 15, 16, 0),
        });
        const [shift2, setShift2] = useState<DateTimeRange | undefined>({
            start: new Date(2024, 0, 15, 16, 0),
            end: new Date(2024, 0, 16, 0, 0),
        });

        return (
            <Box display="flex" flexDirection="column" gap={4}>
                <Typography variant="h5">Shift Schedule</Typography>
                <DateTimeRangePicker {...args} label="Morning Shift" fullWidth value={shift1} onChange={setShift1} />
                <DateTimeRangePicker {...args} label="Evening Shift" fullWidth value={shift2} onChange={setShift2} />
            </Box>
        );
    },
};
