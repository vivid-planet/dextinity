import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionLogShowVersionDialog, type ActionLogShowVersionDialogProps } from "../ActionLogShowVersionDialog";
import type { GQLActionLogShowVersionDialogFragment } from "../ActionLogShowVersionDialog.gql.generated";

const mockUpdatedRow: GQLActionLogShowVersionDialogFragment = {
    __typename: "ActionLog",
    id: "log3",
    user: { __typename: "ActionLogsUser", id: "bob", name: "Bob" },
    entityName: "News",
    entityId: "550e8400-e29b-41d4-a716-446655440002",
    version: 3,
    createdAt: "2026-05-27T15:30:00Z",
    snapshot: { title: "Release 9.0", slug: "release-9-0" },
    previousVersion: {
        __typename: "ActionLog",
        id: "log2",
        user: { __typename: "ActionLogsUser", id: "bob", name: "Bob" },
        entityName: "News",
        version: 2,
        createdAt: "2026-05-27T14:00:00Z",
        snapshot: { title: "Release 9.0 (draft)", slug: "release-9-0" },
    },
};

const mockCreatedRow: GQLActionLogShowVersionDialogFragment = {
    ...mockUpdatedRow,
    id: "log1",
    version: 1,
    snapshot: { title: "Release", slug: "release" },
    previousVersion: null,
    createdAt: "2026-05-27T13:00:00Z",
};

type Story = StoryObj<ActionLogShowVersionDialogProps>;

const meta: Meta<ActionLogShowVersionDialogProps> = {
    component: ActionLogShowVersionDialog,
    tags: ["!autodocs"],
    title: "actionLog/actionLog/actionLogShowVersionDialog/ActionLogShowVersionDialog",
    args: {
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
