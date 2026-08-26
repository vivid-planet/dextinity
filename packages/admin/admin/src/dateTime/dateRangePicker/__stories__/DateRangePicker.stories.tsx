import { Edit } from "@dextinity/admin-icons";
import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { type DateRange, DateRangePicker } from "../DateRangePicker";

type Story = StoryObj<typeof DateRangePicker>;
const config: Meta<typeof DateRangePicker> = {
    component: DateRangePicker,
    title: "components/dateTime/DateRangePicker",
};

export default config;

/**
 * The basic DateRangePicker component allows users to select a date range from a calendar interface.
 *
 * Use this for date range input fields where users need to pick a start and end date.
 */
export const Default: Story = {
    render: (args) => {
        const [value, setValue] = useState<DateRange | undefined>({ start: "2024-01-15", end: "2024-01-30" });
        return <DateRangePicker {...args} value={value} onChange={setValue} />;
    },
};

export const FullWidth: Story = {
    render: (args) => {
        const [value, setValue] = useState<DateRange | undefined>({ start: "2024-01-15", end: "2024-01-30" });
        return <DateRangePicker {...args} fullWidth value={value} onChange={setValue} />;
    },
};

/**
 * DateRangePicker in a required state.
 *
 * Use this when:
 * - The date range selection is mandatory
 * - Form validation requires date range values
 * - Users must select a date range to proceed
 *
 * Note: The clear button is automatically hidden when the field is required.
 */
export const Required: Story = {
    render: (args) => {
        const [value, setValue] = useState<DateRange | undefined>({ start: "2024-01-15", end: "2024-01-30" });
        return <DateRangePicker {...args} required value={value} onChange={setValue} />;
    },
};

/**
 * DateRangePicker in a disabled state.
 *
 * Use this when:
 * - The date range cannot be changed due to permissions or state
 * - You want to show date range values but prevent interaction
 * - Form logic requires the field to be temporarily disabled
 */
export const Disabled: Story = {
    render: (args) => {
        const [value, setValue] = useState<DateRange | undefined>({ start: "2024-01-15", end: "2024-01-30" });
        return <DateRangePicker {...args} disabled value={value} onChange={setValue} />;
    },
};

/**
 * DateRangePicker in a read-only state.
 *
 * Use this when:
 * - The date range should be visible but not editable
 * - You want to display date range values that cannot be modified
 * - The field is used for reference only
 */
export const ReadOnly: Story = {
    render: (args) => {
        const [value, setValue] = useState<DateRange | undefined>({ start: "2024-01-15", end: "2024-01-30" });
        return <DateRangePicker {...args} readOnly value={value} onChange={setValue} />;
    },
};

/**
 * DateRangePicker with a custom icon.
 *
 * Use this when:
 * - You want to match your brand's icon style
 * - The default calendar icon doesn't fit your design
 * - You need to indicate a specific type of date range selection
 */
export const WithCustomIcon: Story = {
    render: (args) => {
        const [value, setValue] = useState<DateRange | undefined>({ start: "2024-01-15", end: "2024-01-30" });
        return (
            <DateRangePicker
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
 * DateRangePicker with date restrictions.
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
        const [value, setValue] = useState<DateRange | undefined>();
        return <DateRangePicker {...args} label="Future Date Range Only" minDate={args.minDate} value={value} onChange={setValue} />;
    },
};

/**
 * Multiple DateRangePicker instances demonstrating different configurations.
 *
 * This example shows how DateRangePickers can be combined in forms or interfaces
 * to collect multiple date range values with different requirements and states.
 */
export const MultiplePickers: Story = {
    render: (args) => {
        const [vacation, setVacation] = useState<DateRange | undefined>({ start: "2024-07-01", end: "2024-07-15" });
        const [project, setProject] = useState<DateRange | undefined>({ start: "2024-08-01", end: "2024-09-30" });

        return (
            <Box display="flex" flexDirection="column" gap={4}>
                <Typography variant="h5">Date Range Selection</Typography>
                <DateRangePicker {...args} label="Vacation Period" fullWidth value={vacation} onChange={setVacation} />
                <DateRangePicker {...args} label="Project Duration" fullWidth value={project} onChange={setProject} />
            </Box>
        );
    },
};
