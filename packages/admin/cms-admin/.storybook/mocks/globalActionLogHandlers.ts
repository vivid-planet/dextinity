import { graphql, HttpResponse } from "msw";

const alice = { __typename: "ActionLogsUser", id: "Alice", name: "Alice" };
const bob = { __typename: "ActionLogsUser", id: "Bob", name: "Bob" };

const mockLogs = [
    {
        __typename: "ActionLog",
        id: "log6",
        user: alice,
        entityName: "Page",
        entityId: "550e8400-e29b-41d4-a716-446655440004",
        version: 2,
        type: "Deleted",
        snapshot: null,
        scope: [{ domain: "main", language: "en" }],
        createdAt: "2026-05-28T09:00:00Z",
    },
    {
        __typename: "ActionLog",
        id: "log5",
        user: alice,
        entityName: "Page",
        entityId: "550e8400-e29b-41d4-a716-446655440004",
        version: 1,
        type: "Created",
        snapshot: { title: "Imprint", slug: "imprint" },
        scope: [{ domain: "main", language: "en" }],
        createdAt: "2026-05-28T08:00:00Z",
    },
    {
        __typename: "ActionLog",
        id: "log4",
        user: bob,
        entityName: "Product",
        entityId: "550e8400-e29b-41d4-a716-446655440005",
        version: 1,
        type: "Created",
        snapshot: { title: "Chair", slug: "chair" },
        scope: null,
        createdAt: "2026-05-27T16:00:00Z",
    },
    {
        __typename: "ActionLog",
        id: "log3",
        user: bob,
        entityName: "News",
        entityId: "550e8400-e29b-41d4-a716-446655440003",
        version: 3,
        type: "Updated",
        snapshot: { title: "Release 9.0", slug: "release-9-0" },
        scope: [{ domain: "main", language: "en" }],
        createdAt: "2026-05-27T15:30:00Z",
    },
    {
        __typename: "ActionLog",
        id: "log2",
        user: bob,
        entityName: "News",
        entityId: "550e8400-e29b-41d4-a716-446655440003",
        version: 2,
        type: "Updated",
        snapshot: { title: "Release 9.0 (draft)", slug: "release-9-0" },
        scope: [{ domain: "main", language: "en" }],
        createdAt: "2026-05-27T14:00:00Z",
    },
    {
        __typename: "ActionLog",
        id: "log1",
        user: bob,
        entityName: "News",
        entityId: "550e8400-e29b-41d4-a716-446655440003",
        version: 1,
        type: "Created",
        snapshot: { title: "Release", slug: "release" },
        scope: [{ domain: "main", language: "en" }],
        createdAt: "2026-05-27T13:00:00Z",
    },
];

const mockNodes = mockLogs.map((log) => ({
    ...log,
    previousVersion: mockLogs.find((previous) => previous.entityId === log.entityId && previous.version === log.version - 1) ?? null,
}));

export const globalActionLogHandlers = [
    graphql.query("GlobalActionLogGrid", () =>
        HttpResponse.json({
            data: {
                allActionLogs: { __typename: "PaginatedActionLogs", nodes: mockNodes, totalCount: mockNodes.length },
            },
        }),
    ),
];
