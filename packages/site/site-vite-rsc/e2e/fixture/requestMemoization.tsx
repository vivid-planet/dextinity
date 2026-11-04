import { type GraphQLFetch, notFound } from "@dextinity/site-vite-rsc";
import { createMemoryFetchCacheStore, createRequestMemoizedFetch, createServerGraphQLFetch, getRequest } from "@dextinity/site-vite-rsc/server";
import { Hono } from "hono";
import { cache } from "react";

type CountName = "fetch" | "query" | "mutation" | "reactCache";

const upstreamCounts = new Map<string, Record<CountName, number>>();

function count(id: string, name: CountName) {
    const counts = upstreamCounts.get(id) ?? { fetch: 0, query: 0, mutation: 0, reactCache: 0 };
    counts[name] += 1;
    upstreamCounts.set(id, counts);
}

function getUpstreamUrl(path: string) {
    return new URL(`/request-memoization/upstream/${path}`, getRequest().url).href;
}

const memoizedFetch = createRequestMemoizedFetch(fetch);

// By URL, as the port of the server is only known while handling a request
const graphQLFetches = new Map<string, GraphQLFetch>();

function fetchGraphQL<T>(query: string, id: string) {
    const url = getUpstreamUrl("graphql");
    let graphQLFetch = graphQLFetches.get(url);
    if (!graphQLFetch) {
        graphQLFetch = createServerGraphQLFetch({ url, cache: { revalidateInSeconds: 60, store: createMemoryFetchCacheStore() } });
        graphQLFetches.set(url, graphQLFetch);
    }
    return graphQLFetch<T, { id: string }>(query, { id });
}

const getCachedValue = cache(async (id: string) => {
    count(id, "reactCache");
    return `cached ${id}`;
});

export async function MemoizedData({ label, id }: { label: string; id: string }) {
    const response = await memoizedFetch(getUpstreamUrl(`data?id=${id}`));
    const { value } = (await response.json()) as { value: string };
    const { item } = await fetchGraphQL<{ item: string }>("query Item($id: ID!) { item(id: $id) }", id);
    const cachedValue = await getCachedValue(id);
    return <p>{`${label}: ${value}, ${item}, ${cachedValue}`}</p>;
}

async function Mutation({ id }: { id: string }) {
    await fetchGraphQL("mutation Update($id: ID!) { update(id: $id) }", id);
    return null;
}

export function RequestMemoizationPage({ id }: { id: string }) {
    return (
        <>
            <MemoizedData label="Layout" id={id} />
            <MemoizedData label="Metadata" id={id} />
            <MemoizedData label="Page" id={id} />
            <Mutation id={id} />
            <Mutation id={id} />
        </>
    );
}

export async function RequestMemoizationNotFound({ id }: { id: string }): Promise<never> {
    await memoizedFetch(getUpstreamUrl(`data?id=${id}`));
    notFound();
}

export const upstreamRoutes = new Hono();

upstreamRoutes.get("/data", (c) => {
    const id = c.req.query("id") ?? "";
    count(id, "fetch");
    return c.json({ value: `data ${id}` });
});

upstreamRoutes.post("/graphql", async (c) => {
    const { query, variables } = await c.req.json<{ query: string; variables: { id: string } }>();
    const isMutation = query.startsWith("mutation");
    count(variables.id, isMutation ? "mutation" : "query");
    return c.json({ data: isMutation ? { update: true } : { item: `item ${variables.id}` } });
});

upstreamRoutes.get("/counts", (c) => c.json(upstreamCounts.get(c.req.query("id") ?? "") ?? null));
