import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { adminUrl, createMcpTestApp } from "./mcp.test-helper.js";

let mcpTestApp: Awaited<ReturnType<typeof createMcpTestApp>>;

beforeAll(async () => {
    mcpTestApp = await createMcpTestApp();
});

afterAll(async () => {
    await mcpTestApp?.close();
});

// The in-memory client skips the route, its guards, and the checks of the request's origin.
describe("HTTP endpoint of the MCP server", () => {
    async function listTools(headers: Record<string, string>) {
        return fetch(mcpTestApp.endpoint, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                accept: "application/json, text/event-stream",
                "mcp-protocol-version": "2025-11-25",
                "x-test-user": "editor",
                ...headers,
            },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
        });
    }

    it("answers the chat in the admin", async () => {
        const response = await listTools({ origin: adminUrl });

        expect(response.status).toBe(200);
        expect(await response.text()).toContain('"name":"get_page"');
    });

    it("refuses a page of another site", async () => {
        const response = await listTools({ origin: "https://other.example.com" });

        expect(response.status).toBe(403);
    });

    it("refuses a user without the aiHub permission", async () => {
        const response = await listTools({ origin: adminUrl, "x-test-user": "editorWithoutAiHub" });

        expect(response.status).toBe(403);
    });
});
