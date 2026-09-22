import type { Meta, StoryObj } from "@storybook/react-vite";

import { NotFound } from "../NotFound";

type Story = StoryObj<typeof NotFound>;

const config: Meta<typeof NotFound> = {
    component: NotFound,
    title: "common/notFound/NotFound",
};

export default config;

/**
 * The `NotFound` component is used to display a not found page.
 */
export const Default: Story = {};
