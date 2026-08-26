import { Add } from "@dextinity/admin-icons";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { FullPageAlert } from "../FullPageAlert";

type Story = StoryObj<typeof FullPageAlert>;

const config: Meta<typeof FullPageAlert> = {
    component: FullPageAlert,
    title: "components/fullPageAlert/FullPageAlert",
};

export default config;

export const Default: Story = {};

export const Warning: Story = {
    args: {
        severity: "warning",
    },
};

export const Info: Story = {
    args: {
        severity: "info",
    },
};

export const CustomContent: Story = {
    args: {
        severity: "info",
        icon: <Add sx={{ fontSize: "48px" }} color="primary" />,
        title: "Custom Title",
        description: "Custom description text goes here.",
        detailDescription: "This is a custom detail description providing more information.",
        logo: null,
        actions: null,
    },
};
