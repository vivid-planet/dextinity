import type { InferResponseType } from "hono/client";

import type { PageTreeApiClient } from "./PageTreeApiProvider.js";

export type PageTreeNodeItem = InferResponseType<PageTreeApiClient["nodes"]["$get"], 200>[number];

export type PageTreeNodeVisibility = PageTreeNodeItem["visibility"];

export const pageTreeQueryKeys = {
    all: ["pageTree"] as const,
    nodes: (scope: object, category?: string) => ["pageTree", "nodes", scope, category] as const,
    node: (id: string) => ["pageTree", "node", id] as const,
    document: (id: string) => ["pageTree", "document", id] as const,
};
