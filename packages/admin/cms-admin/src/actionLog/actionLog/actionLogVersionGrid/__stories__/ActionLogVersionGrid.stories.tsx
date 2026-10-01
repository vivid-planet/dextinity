import { useDataGridRemote, usePersistentColumnState } from "@dextinity/admin";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";

import { ActionLogVersionGrid } from "../ActionLogVersionGrid";
import type { GQLActionLogVersionGridFragment } from "../ActionLogVersionGrid.gql.generated";

const mockActionLogs: { totalCount: number; nodes: GQLActionLogVersionGridFragment[] } = {
    totalCount: 4,
    nodes: [
        {
            id: "log4",
            user: { id: "system-user", name: "system-user" },
            entityName: "TestEntity",
            scope: [{ domain: "secondary", language: "en" }],
            version: 4,
            type: "Updated",
            createdAt: "2023-10-04T12:00:00Z",
            previousVersion: { id: "log3" },
        },
        {
            id: "log3",
            user: { id: "1", name: "Max Mustermann" },
            entityName: "TestEntity",
            scope: [{ domain: "main", language: "en" }],
            version: 3,
            type: "Updated",
            createdAt: "2023-10-03T12:00:00Z",
            previousVersion: { id: "log2" },
        },
        {
            id: "log2",
            user: { id: "2", name: "Jane Doe" },
            entityName: "TestEntity",
            scope: [{ domain: "main", language: "en" }],
            version: 2,
            type: "Updated",
            createdAt: "2023-10-02T12:00:00Z",
            previousVersion: { id: "log1" },
        },
        {
            id: "log1",
            user: { id: "deleted-user-id", name: null },
            entityName: "TestEntity",
            scope: [{ domain: "main", language: "en" }],
            version: 1,
            type: "Created",
            createdAt: "2023-10-01T12:00:00Z",
            previousVersion: null,
        },
    ],
};

type Story = StoryObj<typeof ActionLogVersionGrid>;
const meta: Meta<typeof ActionLogVersionGrid> = {
    component: ActionLogVersionGrid,
    decorators: [
        (Story) => (
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        ),
    ],
    tags: ["!autodocs"],
    title: "actionLog/actionLog/actionLogVersionGrid/ActionLogVersionGrid",
};
export default meta;

const StandardStory = (args: React.ComponentProps<typeof ActionLogVersionGrid>) => {
    const dataGridProps = {
        ...useDataGridRemote({ initialSort: [{ field: "version", sort: "desc" }] }),
        ...usePersistentColumnState("ActionLogVersionGrid"),
    };
    return <ActionLogVersionGrid {...args} {...dataGridProps} />;
};

export const Standard: Story = {
    render: (args) => <StandardStory {...args} />,
    args: {
        actionLogs: mockActionLogs,
        id: "550e8400-e29b-41d4-a716-446655440000",
        loading: false,
        onShowVersionClick: () => undefined,
        onCompareVersionsClick: () => undefined,
    },
};

export const ShowScope: Story = {
    render: (args) => <StandardStory {...args} />,
    args: {
        ...Standard.args,
        showScope: true,
    },
};
