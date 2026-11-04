import type { Meta, StoryObj } from "@storybook/react-vite";

import { NoContentScopeFallback } from "../NoContentScopeFallback";

type Story = StoryObj<typeof NoContentScopeFallback>;

const config: Meta<typeof NoContentScopeFallback> = {
    component: NoContentScopeFallback,
    title: "contentScope/noContentScopeFallback/NoContentScopeFallback",
};

export default config;
export const Default: Story = {};
