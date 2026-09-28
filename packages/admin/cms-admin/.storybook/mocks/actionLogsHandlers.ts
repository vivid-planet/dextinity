import { graphql, HttpResponse } from "msw";

const mockNodes = [
    {
        __typename: "ActionLog",
        id: "log4",
        user: { __typename: "ActionLogsUser", id: "alice", name: "Alice" },
        entityName: "News",
        entityId: "550e8400-e29b-41d4-a716-446655440003",
        version: 1,
        type: "Deleted",
        createdAt: "2026-05-28T09:00:00Z",
        scope: [{ domain: "main", language: "en" }],
        snapshot: null,
        previousVersion: null,
    },
    {
        __typename: "ActionLog",
        id: "log3",
        user: { __typename: "ActionLogsUser", id: "bob", name: "Bob" },
        entityName: "News",
        entityId: "550e8400-e29b-41d4-a716-446655440002",
        version: 3,
        type: "Updated",
        createdAt: "2026-05-27T15:30:00Z",
        scope: [{ domain: "main", language: "en" }],
        snapshot: { title: "Release 9.0", slug: "release-9-0" },
        previousVersion: { __typename: "ActionLog", id: "log2" },
    },
    {
        __typename: "ActionLog",
        id: "log2",
        user: { __typename: "ActionLogsUser", id: "bob", name: "Bob" },
        entityName: "News",
        entityId: "550e8400-e29b-41d4-a716-446655440002",
        version: 2,
        type: "Updated",
        createdAt: "2026-05-27T14:00:00Z",
        scope: [{ domain: "main", language: "en" }],
        snapshot: { title: "Release 9.0 (draft)", slug: "release-9-0" },
        previousVersion: { __typename: "ActionLog", id: "log1" },
    },
    {
        __typename: "ActionLog",
        id: "log1",
        user: { __typename: "ActionLogsUser", id: "bob", name: "Bob" },
        entityName: "News",
        entityId: "550e8400-e29b-41d4-a716-446655440002",
        version: 1,
        type: "Created",
        createdAt: "2026-05-27T13:00:00Z",
        scope: [{ domain: "main", language: "en" }],
        snapshot: { title: "Release", slug: "release" },
        previousVersion: null,
    },
];

type MockFilter = { entityId?: { equal?: string }; version?: { lowerThan?: number } };

const buildResponse = (filter?: MockFilter) => {
    let nodes = mockNodes;
    if (filter?.entityId?.equal) {
        nodes = nodes.filter((node) => node.entityId === filter.entityId?.equal);
    }
    if (filter?.version?.lowerThan != null) {
        nodes = nodes.filter((node) => node.version < (filter.version?.lowerThan ?? 0));
    }
    return { __typename: "PaginatedActionLogs", nodes, totalCount: nodes.length };
};

export const actionLogsHandlers = [
    graphql.query("NewsActionLogs", ({ variables }) =>
        HttpResponse.json({
            data: {
                newsActionLogs: buildResponse(variables.filter as MockFilter | undefined),
            },
        }),
    ),
];
