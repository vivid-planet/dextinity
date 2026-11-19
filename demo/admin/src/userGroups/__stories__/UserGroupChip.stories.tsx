import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { UserGroupChip } from "../UserGroupChip";

const meta: Meta<typeof UserGroupChip> = {
    title: "User Groups/UserGroupChip",
    component: UserGroupChip,
};

export default meta;
type Story = StoryObj<typeof UserGroupChip>;

export const Admin: Story = {
    args: {
        item: { userGroup: "admin" },
    },
};

// The `play` function runs as a test in CI (via @storybook/addon-vitest): it asserts on the rendered story.
export const All: Story = {
    args: {
        item: { userGroup: "all" },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.queryByText(/Show/)).not.toBeInTheDocument();
    },
};
