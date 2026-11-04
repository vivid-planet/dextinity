import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { DateTime } from "../DateTime";

const config: Meta<typeof DateTime> = {
    component: DateTime,
    title: "dashboard/DateTime",
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        await waitFor(() => expect(canvasElement.textContent).toMatch(/\d/));
    },
};
