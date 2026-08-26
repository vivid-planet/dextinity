import { ArrowRight } from "@dextinity/admin-icons";
import { Box, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Button } from "../../common/buttons/Button";
import { Alert } from "../Alert";

type Story = StoryObj<typeof Alert>;
const config: Meta<typeof Alert> = {
    component: Alert,
    title: "components/alert/Alert",
};

export default config;

/**
 * The basic Alert component displays a simple informative message.
 *
 * Use this for general notifications that don't require additional context or user action.
 */
export const Default: Story = {
    args: {
        children: "Description",
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText("Description")).toBeInTheDocument();
    },
};

/**
 * Alert with a title and longer description.
 * - The message requires more context or hierarchy
 * - You need to separate the main message (title) from supporting details
 * - The information needs to be more structured
 */
export const WithTitle: Story = {
    args: {
        title: "Title",
        children:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vel vehicula est. Nunc congue velit sem, ac porttitor massa semper nec. Proin quis volutpat magna. Mauris eget libero et mi imperdiet ultrices. Donec eget interdum odio. Maecenas blandit ipsum et eros tempus porttitor. Aliquam erat volutpat.",
    },
};

/**
 * The Alert supports different severity levels to convey the importance and nature of the message.
 *
 * Use "warning" severity when:
 * - The user should be cautioned about a potential issue
 * - An action might have unexpected consequences
 * - Something requires the user's attention but isn't critical
 *
 * Each severity level uses distinct colors and icons to help users quickly recognize the message type.
 */
export const SeverityWarning: Story = {
    args: {
        title: "Warning",
        children: "Description",
        severity: "warning",
    },
};

/**
 * Use "error" severity to communicate:
 * - Critical issues that need immediate attention
 * - Failed operations or validation errors
 * - Problems that prevent the user from proceeding
 */
export const SeverityError: Story = {
    args: {
        title: "Error",
        children: "Description",
        severity: "error",
    },
};

/**
 * Use "success" severity to provide positive feedback:
 * - Successful form submissions
 * - Completed operations
 * - Confirmed actions
 */
export const SeveritySuccess: Story = {
    args: {
        title: "Success",
        children: "Description",
        severity: "success",
    },
};

/**
 * Alerts can include interactive elements through the action prop.
 *
 * Use this when:
 * - The user needs to take a specific action
 * - You want to provide a direct link to related content
 * - Additional options need to be presented
 */
export const WithAction: Story = {
    args: {
        children: "Description",
        action: (
            <Button variant="textDark" startIcon={<ArrowRight />}>
                Action Text
            </Button>
        ),
    },
};

/**
 * Closeable alerts give users control over their interface.
 * Use this when:
 * - The alert information is temporary
 * - Users should be able to dismiss notifications
 * - You want to reduce interface clutter
 */
export const WithClose: Story = {
    args: {
        children: "Description",
        onClose: () => {
            alert("Close clicked");
        },
    },
};

/**
 * The Alert component supports custom content as children.
 *
 * Use this when you need to:
 * - Display complex information hierarchies
 * - Include images or custom layouts
 * - Create more engaging notifications
 */
export const WithCustomContent: Story = {
    args: {
        children: (
            <Box display="flex" gap={4}>
                <Box sx={{ width: 150, height: 150 }} component="img" src="https://picsum.photos/id/38/300/300" />
                <Stack gap={2}>
                    <Typography variant="h4" component="span">
                        Custom Title
                    </Typography>
                    <Typography>
                        This is a <strong>custom content</strong> inside the Alert.
                    </Typography>
                </Stack>
            </Box>
        ),
    },
};
