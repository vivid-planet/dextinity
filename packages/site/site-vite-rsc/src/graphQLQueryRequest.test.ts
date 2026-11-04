// @vitest-environment node
import { describe, expect, it } from "vitest";

import { isGraphQLQuery } from "./graphQLQueryRequest.js";

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
