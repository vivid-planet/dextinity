import type { Meta, StoryObj } from "@storybook/react-vite";

import { DiffHeader } from "../DiffHeader";

type Story = StoryObj<typeof DiffHeader>;
const meta: Meta<typeof DiffHeader> = {
    component: DiffHeader,
    title: "actionLog/components/diffHeader/DiffHeader",
};
export default meta;

export const StandardDiffHeader: Story = {
    args: {
        createdAt: "2023-10-01T12:00:00Z",
        userId: "abc-123",
        userName: "Max Mustermann",
        version: 1,
    },
};

export const SystemUser: Story = {
    args: {
        createdAt: "2023-10-01T12:00:00Z",
        userId: "system-user",
        userName: "system-user",
        version: 1,
    },
};

export const UnknownUser: Story = {
    args: {
        createdAt: "2023-10-01T12:00:00Z",
        userId: "abc-123",
        version: 1,
    },
};
