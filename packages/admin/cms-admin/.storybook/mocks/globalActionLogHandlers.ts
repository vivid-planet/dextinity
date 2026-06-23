import { graphql, HttpResponse } from "msw";

const alice = { __typename: "ActionLogsUser", id: "Alice", name: "Alice" };
const bob = { __typename: "ActionLogsUser", id: "Bob", name: "Bob" };

const mockNodes = [
    {
        __typename: "ActionLog",
        id: "log4",
        user: alice,
        entityName: "Page",
        entityId: "550e8400-e29b-41d4-a716-446655440004",
        version: 1,
        type: "Deleted",
        snapshot: null,
        previousVersion: {
            __typename: "ActionLog",
            id: "log4-prev",
            version: 1,
            snapshot: { title: "Imprint", slug: "imprint" },
            createdAt: "2026-05-28T08:00:00Z",
            user: alice,
            entityName: "Page",
        },
        scope: [{ domain: "main", language: "en" }],
        createdAt: "2026-05-28T09:00:00Z",
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
        previousVersion: {
            __typename: "ActionLog",
            id: "log2",
            version: 2,
            snapshot: { title: "Release 9.0 (draft)", slug: "release-9-0" },
            createdAt: "2026-05-27T14:00:00Z",
            user: bob,
            entityName: "News",
        },
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
        previousVersion: {
            __typename: "ActionLog",
            id: "log1",
            version: 1,
            snapshot: { title: "Release", slug: "release" },
            createdAt: "2026-05-27T13:00:00Z",
            user: bob,
            entityName: "News",
        },
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
        previousVersion: null,
        scope: [{ domain: "main", language: "en" }],
        createdAt: "2026-05-27T13:00:00Z",
    },
];

const versionById: Record<string, (typeof mockNodes)[number]> = Object.fromEntries(mockNodes.map((node) => [node.id, node]));

export const globalActionLogHandlers = [
    graphql.query("GlobalActionLogGrid", () =>
        HttpResponse.json({
            data: {
                actionLogs: { __typename: "PaginatedActionLogs", nodes: mockNodes, totalCount: mockNodes.length },
            },
        }),
    ),
    graphql.query("GlobalActionLogShowVersion", ({ variables }) =>
        HttpResponse.json({
            data: { actionLog: versionById[variables.id as string] ?? null },
        }),
    ),
    graphql.query("GlobalActionLogDialogGrid", () =>
        HttpResponse.json({
            data: {
                actionLogs: { __typename: "PaginatedActionLogs", nodes: mockNodes.slice(1), totalCount: mockNodes.length - 1 },
            },
        }),
    ),
    graphql.query("GlobalActionLogDialogShowVersion", ({ variables }) =>
        HttpResponse.json({
            data: { actionLog: versionById[variables.id as string] ?? null },
        }),
    ),
    graphql.query("GlobalActionLogDialogCompare", ({ variables }) =>
        HttpResponse.json({
            data: {
                beforeVersion: versionById[variables.beforeId as string] ?? null,
                afterVersion: versionById[variables.afterId as string] ?? null,
            },
        }),
    ),
];
