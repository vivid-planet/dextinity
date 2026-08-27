import { InfoFilled } from "@dextinity/admin-icons";
import { Grid } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { DashboardWidgetRoot } from "../DashboardWidgetRoot";

type Story = StoryObj<typeof DashboardWidgetRoot>;

const config: Meta<typeof DashboardWidgetRoot> = {
    component: DashboardWidgetRoot,
    title: "dashboard/widgets/DashboardWidgetRoot",
};

export default config;
export const Default: Story = {
    args: {
        header: "Widget Header",
        children: <div style={{ padding: "20px" }}>Some content goes here</div>,
    },
};

export const WithIcon: Story = {
    args: {
        header: "Widget Header",
        icon: <InfoFilled />,
        children: <div style={{ padding: "20px" }}>Some content goes here</div>,
    },
};

export const WidgetInGrid: Story = {
    args: {
        header: "Widget Header",
        children: <div style={{ padding: "20px" }}>Some content goes here</div>,
    },
    render: (args, context) => {
        return (
            <Grid
                container
                spacing={4}
                columns={{
                    xs: 1,
                    sm: 6,
                    lg: 12,
                }}
            >
                <Grid size={12}>
                    <DashboardWidgetRoot {...args} />
                </Grid>
                <Grid size={6}>
                    <DashboardWidgetRoot {...args} />
                </Grid>
                <Grid size={6}>
                    <DashboardWidgetRoot {...args} />
                </Grid>

                <Grid size={3}>
                    <DashboardWidgetRoot {...args} />
                </Grid>
                <Grid size={3}>
                    <DashboardWidgetRoot {...args} />
                </Grid>
                <Grid size={3}>
                    <DashboardWidgetRoot {...args} />
                </Grid>
                <Grid size={3}>
                    <DashboardWidgetRoot {...args} />
                </Grid>
            </Grid>
        );
    },
};
