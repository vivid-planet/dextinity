import { type APIRequestContext, expect, test } from "@playwright/test";

let idCounter = 0;

function createId(name: string) {
    idCounter += 1;
    return `${name}-${Date.now()}-${idCounter}`;
}

async function getUpstreamCounts(request: APIRequestContext, id: string) {
    return (await request.get(`/request-memoization/upstream/counts?id=${id}`)).json();
}

test("sends identical fetches and GraphQL queries only once per page request, but every mutation", async ({ request }) => {
    const id = createId("page");

    const body = await (await request.get(`/request-memoization/${id}`)).text();

    for (const label of ["Layout", "Metadata", "Page"]) {
        expect(body).toContain(`${label}: data ${id}, item ${id}, cached ${id}`);
    }
    expect(await getUpstreamCounts(request, id)).toEqual({ fetch: 1, query: 1, mutation: 2, reactCache: 1 });
});

test("memoizes in the site preview, which bypasses the cache of the GraphQL fetch", async ({ request }) => {
    const id = createId("preview");

    await request.get(`/request-memoization/${id}?sitePreview`);
    await request.get(`/request-memoization/${id}?sitePreview`);

    expect(await getUpstreamCounts(request, id)).toEqual({ fetch: 2, query: 2, mutation: 4, reactCache: 2 });
});

test("doesn't share memoized responses between page requests", async ({ request }) => {
    const id = createId("concurrent");

    await Promise.all([request.get(`/_rsc/request-memoization/${id}?sitePreview`), request.get(`/request-memoization/${id}?sitePreview`)]);

    expect((await getUpstreamCounts(request, id)).fetch).toBe(2);
});

test("shares the memoized responses with the not found page of the request", async ({ request }) => {
    const id = createId("not-found");

    const response = await request.get(`/request-memoization/${id}/not-found?sitePreview`);

    expect(response.status()).toBe(404);
    expect(await response.text()).toContain(`Not found page: data ${id}`);
    // React's cache is scoped to a render, the not found page is a render of its own
    expect(await getUpstreamCounts(request, id)).toEqual({ fetch: 1, query: 1, mutation: 0, reactCache: 1 });
});
