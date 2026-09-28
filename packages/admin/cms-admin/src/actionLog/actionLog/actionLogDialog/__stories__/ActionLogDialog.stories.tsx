import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionLogDialog, type ActionLogDialogProps } from "../ActionLogDialog";

type Story = StoryObj<ActionLogDialogProps<Record<string, unknown>>>;

const meta: Meta<ActionLogDialogProps<Record<string, unknown>>> = {
    component: ActionLogDialog,
    tags: ["!autodocs"],
    title: "actionLog/actionLog/actionLogDialog/ActionLogDialog",
    args: {
        entityId: "550e8400-e29b-41d4-a716-446655440002",
        queryName: "newsActionLogs",
        name: "Release 9.0",
        open: true,
        onClose: () => undefined,
    },
};

export default meta;

export const Default: Story = {};
