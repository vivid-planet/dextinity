import type { Meta, StoryObj } from "@storybook/react-vite";

import type { GQLActionLogRowFragment } from "../../actionLogsQuery.generated";
import { ActionLogShowVersionDialog, type ActionLogShowVersionDialogProps } from "../ActionLogShowVersionDialog";

const mockUpdatedRow: GQLActionLogRowFragment = {
    __typename: "ActionLog",
    id: "log3",
    user: { __typename: "ActionLogsUser", id: "bob", name: "Bob" },
    entityName: "News",
    entityId: "550e8400-e29b-41d4-a716-446655440002",
    version: 3,
    type: "Updated" as GQLActionLogRowFragment["type"],
    createdAt: "2026-05-27T15:30:00Z",
    scope: [{ domain: "main", language: "en" }],
    snapshot: { title: "Release 9.0", slug: "release-9-0" },
    previousVersion: { __typename: "ActionLog", snapshot: { title: "Release 9.0 (draft)", slug: "release-9-0" } },
};

const mockCreatedRow: GQLActionLogRowFragment = {
    ...mockUpdatedRow,
    id: "log1",
    version: 1,
    type: "Created" as GQLActionLogRowFragment["type"],
    snapshot: { title: "Release", slug: "release" },
    previousVersion: null,
    createdAt: "2026-05-27T13:00:00Z",
};

type Story = StoryObj<ActionLogShowVersionDialogProps<Record<string, unknown>>>;

const meta: Meta<ActionLogShowVersionDialogProps<Record<string, unknown>>> = {
    component: ActionLogShowVersionDialog,
    tags: ["!autodocs"],
    title: "actionLog/actionLog/actionLogShowVersionDialog/ActionLogShowVersionDialog",
    args: {
        queryName: "newsActionLogs",
        open: true,
        onClose: () => undefined,
    },
};
export default meta;

export const WithDiff: Story = {
    args: { row: mockUpdatedRow },
};

export const Created: Story = {
    args: { row: mockCreatedRow },
};
