import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionLogsGrid, type ActionLogsGridProps } from "../ActionLogsGrid";

type Story = StoryObj<ActionLogsGridProps<Record<string, unknown>>>;

const meta: Meta<ActionLogsGridProps<Record<string, unknown>>> = {
    component: ActionLogsGrid,
    tags: ["!autodocs"],
    title: "actionLog/actionLog/actionLogsGrid/ActionLogsGrid",
    args: {
        queryName: "newsActionLogs",
    },
};
export default meta;

export const Default: Story = {};
