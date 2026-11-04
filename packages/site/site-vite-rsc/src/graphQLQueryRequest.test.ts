// @vitest-environment node
import { describe, expect, it } from "vitest";

import { isGraphQLQuery, isGraphQLQueryRequest } from "./graphQLQueryRequest.js";

function postRequest(query: unknown) {
    const body = new TextEncoder().encode(JSON.stringify({ query, variables: {} }));
    return [new Request("https://api.example.com/graphql", { method: "POST", body }), body] as const;
}

describe("isGraphQLQuery", () => {
    it.each([
        "query Page { page }",
        "{ page }",
        "fragment Page on Page { id } query Page { page { ...Page } }",
        "# mutation in a comment\nquery Page { page }",
    ])("is true for the query %j", (query) => {
        expect(isGraphQLQuery(query)).toBe(true);
    });

    it.each([
        "mutation Subscribe { subscribe }",
        "  mutation { subscribe }",
        "fragment Page on Page { id }\nmutation Update { update { ...Page } }",
        "query Page { page } mutation Update { update }",
        "subscription Updates { updates }",
    ])("is false for the operation %j", (query) => {
        expect(isGraphQLQuery(query)).toBe(false);
    });
});

describe("isGraphQLQueryRequest", () => {
    it("checks the query of POST requests", () => {
        expect(isGraphQLQueryRequest(...postRequest("query Page { page }"))).toBe(true);
        expect(isGraphQLQueryRequest(...postRequest("mutation Update { update }"))).toBe(false);
    });

    it("is false for bodies without a query, e.g. persisted queries", () => {
        expect(isGraphQLQueryRequest(...postRequest(undefined))).toBe(false);
        const body = new TextEncoder().encode("not json");
        expect(isGraphQLQueryRequest(new Request("https://api.example.com/graphql", { method: "POST", body }), body)).toBe(false);
    });

    it("checks the query of GET requests", () => {
        const empty = new Uint8Array();
        expect(isGraphQLQueryRequest(new Request("https://api.example.com/graphql?query=query%20Page%20%7B%20page%20%7D"), empty)).toBe(true);
        expect(isGraphQLQueryRequest(new Request("https://api.example.com/graphql?query=mutation%20%7B%20a%20%7D"), empty)).toBe(false);
    });

    it("is false for other methods", () => {
        expect(isGraphQLQueryRequest(new Request("https://api.example.com/graphql", { method: "PUT", body: "{}" }), new Uint8Array())).toBe(false);
    });
});
