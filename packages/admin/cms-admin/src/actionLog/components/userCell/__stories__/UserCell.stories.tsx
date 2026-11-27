import type { Meta, StoryObj } from "@storybook/react-vite";

import { UserCell } from "../UserCell";

type Story = StoryObj<typeof UserCell>;
const meta: Meta<typeof UserCell> = {
    component: UserCell,
    title: "actionLog/components/userCell/UserCell",
};
export default meta;

export const MaxMustermann: Story = {
    args: {
        id: "abc-123",
        name: "Max Mustermann",
    },
};

export const OneName: Story = {
    args: {
        id: "abc-123",
        name: "Max",
    },
};

export const SystemUser: Story = {
    args: {
        id: "system-user",
        name: "system-user",
    },
};

export const UnknownUser: Story = {
    args: {
        id: "abc-123",
    },
};
