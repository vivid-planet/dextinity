import { readFile } from "fs/promises";

import { convertPreviewDataToHeaders, type PreviewData } from "../graphQLFetch/graphQLFetch";

let queryMap: Record<string, string>;
let fragmentsMap: Record<string, string>;
async function loadPersistedQueries(path: string) {
    const file = await readFile(path, { encoding: "utf-8" });
    queryMap = JSON.parse(file.toString()) as typeof queryMap;

    fragmentsMap = {};
    for (const [, query] of Object.entries(queryMap)) {
        const match = query.match(/^\s*fragment\s+(\w+)\s+on\s+\w+/m);
        if (match) {
            const fragmentName = match[1];
            fragmentsMap[fragmentName] = query.replace(/\${.*?}/g, ""); // remove interpolations that would be injected at runtime;
        }
    }
}

function injectFragments(query: string) {
    query = query.replace(/\${.*?}/g, ""); // remove interpolations that would be injected at runtime

    const injected = new Set<string>();

    // fragments in the initial query
    for (const m of query.matchAll(/^\s*fragment\s+(\w+)\s+on\s+\w+/gm)) {
        injected.add(m[1]);
    }

    function inject(q: string): string {
        // Find all fragment spreads in the query
        const spreads = Array.from(q.matchAll(/\.\.\.(\w+)/g)).map((m) => m[1]);
        let result = q;
        for (const fragmentName of spreads) {
            if (!injected.has(fragmentName) && fragmentsMap[fragmentName]) {
                injected.add(fragmentName);
                // Recursively inject fragments used by this fragment
                result += `\n${inject(fragmentsMap[fragmentName])}`;
            }
        }
        return result;
    }
    query = inject(query);

    return query;
}

export async function persistedQueryRoute(
    req: Request,
    {
        graphqlTarget,
        headers: headersInit,
        persistedQueriesPath = ".persisted-queries.json",
        cacheMaxAge,
        previewData,
    }: {
        graphqlTarget: string;
        headers?: HeadersInit;
        persistedQueriesPath: string;
        cacheMaxAge: number | undefined;
        /**
         * Must be obtained from a verified source (e.g. the signed site preview cookie), never from the incoming request.
         */
        previewData?: PreviewData;
    },
) {
    if (!queryMap) {
        await loadPersistedQueries(persistedQueriesPath);
    }

    let hash: string | null | undefined;
    let variables: unknown;

    if (req.method === "POST") {
        const body = await req.json();
        hash = body.extensions?.persistedQuery?.sha256Hash;
        variables = body.variables;
    } else if (req.method === "GET") {
        const url = new URL(req.url);
        hash = url.searchParams.get("extensions.persistedQuery.sha256Hash");
        const variablesParam = url.searchParams.get("variables");
        variables = variablesParam ? JSON.parse(variablesParam) : undefined;
    } else {
        return Response.json({ error: "MethodNotAllowed" }, { status: 405 });
    }

    // Only allow persisted queries
    if (!hash) {
        return Response.json({ error: "OnlyPersistedQueriesAllowed" }, { status: 400 });
    }

    let query = queryMap[hash];
    if (!query) {
        return Response.json({ error: "PersistedQueryNotFound", hash }, { status: 400 });
    }
    query = injectFragments(query);

    // CSRF protection for GET requests, similar to Apollo Server's CSRF protection
    if (req.method === "GET") {
        const apolloPreflight = req.headers.get("Apollo-Require-Preflight");
        if (apolloPreflight !== "true") {
            return Response.json({ error: "CSRFProtection", message: "Missing Apollo-Require-Preflight header" }, { status: 403 });
        }
    }

    const headers = new Headers(headersInit);
    headers.set("Content-Type", "application/json");

    for (const [name, value] of Object.entries(convertPreviewDataToHeaders(previewData))) {
        headers.set(name, value);
    }

    // Forward to actual GraphQL server
    const upstreamRes = await fetch(graphqlTarget, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: query, variables }),
    });

    const responseHeaders: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (req.method === "GET" && upstreamRes.ok && cacheMaxAge !== undefined && !previewData) {
        responseHeaders["Cache-Control"] = `public, max-age=${cacheMaxAge}`;
    }

    return new Response(upstreamRes.body, {
        headers: responseHeaders,
    });
}
