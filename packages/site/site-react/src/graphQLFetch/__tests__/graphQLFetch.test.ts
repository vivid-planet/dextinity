import { describe, expect, it, vi } from "vitest";

import { convertPreviewDataToHeaders, createGraphQLFetch, gql as gqlTag } from "../graphQLFetch";

describe("convertPreviewDataToHeaders", () => {
    it("should return empty headers when no previewData is provided", () => {
        expect(convertPreviewDataToHeaders(undefined)).toEqual({});
    });

    it("should include Pages:Unpublished when previewData is provided without includeInvisible", () => {
        const headers = convertPreviewDataToHeaders({ includeInvisible: false });
        expect(headers["x-include-invisible-content"]).toBe("Pages:Unpublished");
        expect(headers["x-preview-dam-urls"]).toBe("1");
    });

    it("should include both Pages:Unpublished and Blocks:Invisible when includeInvisible is true", () => {
        const headers = convertPreviewDataToHeaders({ includeInvisible: true });
        expect(headers["x-include-invisible-content"]).toBe("Pages:Unpublished,Blocks:Invisible");
        expect(headers["x-preview-dam-urls"]).toBe("1");
    });
});

describe("gql", () => {
    it("should return a plain string from a template literal with no variables", () => {
        const result = gqlTag`query { user { id } }`;
        expect(result).toBe("query { user { id } }");
    });

    it("should interpolate string variables into the template", () => {
        const fragment = "id name";
        const result = gqlTag`query { user { ${fragment} } }`;
        expect(result).toBe("query { user { id name } }");
    });

    it("should throw when a non-string variable is interpolated", () => {
        const fragment = 42 as unknown as string;
        expect(() => gqlTag`query { user { ${fragment} } }`).toThrow("Non-string variable in the GraphQL document");
    });

    it("should handle multiple string variables", () => {
        const a = "id";
        const b = "name";
        const result = gqlTag`query { user { ${a} ${b} } }`;
        expect(result).toBe("query { user { id name } }");
    });
});

describe("createGraphQLFetch", () => {
    it("should make a POST request with query and variables", async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: { user: { id: "1" } } }),
        });
        const graphQLFetch = createGraphQLFetch(mockFetch as typeof fetch, "https://api.example.com/graphql");

        const result = await graphQLFetch("query { user { id } }", { id: "1" });

        expect(mockFetch).toHaveBeenCalledWith(
            "https://api.example.com/graphql",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({ "Content-Type": "application/json" }),
                body: JSON.stringify({ query: "query { user { id } }", variables: { id: "1" } }),
            }),
        );
        expect(result).toEqual({ user: { id: "1" } });
    });

    it("should make a GET request when method is GET", async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: { user: { id: "2" } } }),
        });
        const graphQLFetch = createGraphQLFetch(mockFetch as typeof fetch, "https://api.example.com/graphql");

        await graphQLFetch("query { user { id } }", { id: "2" }, { method: "GET" });

        const calledUrl = mockFetch.mock.calls[0][0] as URL;
        expect(calledUrl).toBeInstanceOf(URL);
        expect(calledUrl.searchParams.get("query")).toBe("query { user { id } }");
        expect(mockFetch.mock.calls[0][1]).toMatchObject({
            headers: expect.objectContaining({ "Apollo-Require-Preflight": "true" }),
        });
    });

    it("should throw when the network response is not ok", async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            text: () => Promise.resolve("Internal Server Error"),
        });
        const graphQLFetch = createGraphQLFetch(mockFetch as typeof fetch, "https://api.example.com/graphql");

        await expect(graphQLFetch("query { user { id } }")).rejects.toThrow("Network response was not ok. Status: 500");
    });

    it("should throw when the response contains GraphQL errors", async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: null, errors: [{ message: "Not found" }] }),
        });
        const graphQLFetch = createGraphQLFetch(mockFetch as typeof fetch, "https://api.example.com/graphql");

        await expect(graphQLFetch("query { user { id } }")).rejects.toThrow("GraphQL error(s):\n- Not found");
    });
});
