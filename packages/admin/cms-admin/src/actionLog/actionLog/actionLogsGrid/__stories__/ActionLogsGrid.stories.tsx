import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionLogsGrid, type ActionLogsGridProps } from "../ActionLogsGrid";

type Story = StoryObj<ActionLogsGridProps>;

const meta: Meta<ActionLogsGridProps> = {
    component: ActionLogsGrid,
    tags: ["!autodocs"],
    title: "actionLog/actionLog/actionLogsGrid/ActionLogsGrid",
    args: {
        entity: "News",
    },
};
export default meta;

export const Default: Story = {};

export const CustomDisplayName: Story = {
    args: {
        getDisplayName: (snapshot) => `${snapshot.title} (${snapshot.slug})`,
    },
};
