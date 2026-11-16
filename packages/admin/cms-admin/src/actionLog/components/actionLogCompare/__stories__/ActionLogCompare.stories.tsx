import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionLogCompare } from "../ActionLogCompare";

const mockVersion1 = {
    __typename: "ActionLog" as const,
    id: "log1",
    version: 1,
    snapshot: { title: "My Page", slug: "my-page", createdAt: "2023-10-01T12:00:00Z" },
    createdAt: "2023-10-01T12:00:00Z",
    user: { __typename: "ActionLogsUser" as const, id: "1", name: "Max Mustermann" },
    entityName: "TestEntity",
};

const mockVersion2 = {
    __typename: "ActionLog" as const,
    id: "log2",
    version: 2,
    snapshot: { title: "My Page (updated)", slug: "my-page", createdAt: "2023-10-01T12:00:00Z" },
    createdAt: "2023-10-02T12:00:00Z",
    user: { __typename: "ActionLogsUser" as const, id: "2", name: "Jane Doe" },
    entityName: "TestEntity",
};

type Story = StoryObj<typeof ActionLogCompare>;
const meta: Meta<typeof ActionLogCompare> = {
    component: ActionLogCompare,
    tags: ["!autodocs"],
    title: "actionLog/components/actionLogCompare/ActionLogCompare",
    args: {
        onClickShowVersionHistory: () => undefined,
    },
};
export default meta;

export const Standard: Story = {
    args: {
        beforeVersion: mockVersion1,
        afterVersion: mockVersion2,
        id: "550e8400-e29b-41d4-a716-446655440000",
        loading: false,
        name: "My Page",
    },
};

export const Loading: Story = {
    args: {
        beforeVersion: undefined,
        afterVersion: undefined,
        id: "550e8400-e29b-41d4-a716-446655440000",
        loading: true,
    },
};

export const NotFound: Story = {
    args: {
        beforeVersion: undefined,
        afterVersion: undefined,
        id: "550e8400-e29b-41d4-a716-446655440000",
        loading: false,
    },
};

export const Error: Story = {
    args: {
        beforeVersion: undefined,
        afterVersion: undefined,
        error: true,
        id: "550e8400-e29b-41d4-a716-446655440000",
        loading: false,
    },
};
