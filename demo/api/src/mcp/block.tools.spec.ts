import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createMcpTestApp } from "./mcp.test-helper.js";

let mcpTestApp: Awaited<ReturnType<typeof createMcpTestApp>>;

beforeAll(async () => {
    mcpTestApp = await createMcpTestApp();
});

afterAll(async () => {
    await mcpTestApp?.close();
});

describe("BlockTools", () => {
    it("lists the blocks of block-meta.json", async () => {
        const { text, isError } = await mcpTestApp.callTool("list_available_blocks", {});

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toContain("PageContent");
    });

    it("answers an unknown block name with the reason", async () => {
        const { text, isError } = await mcpTestApp.callTool("get_block_schema", { name: "Unknown" });

        expect(isError).toBe(true);
        expect(text).toBe('Unknown block "Unknown". Use the list_available_blocks tool to get the available block names.');
    });

    it("answers get_block_schema with the TipTap schema of a rich text block", async () => {
        const { text, isError } = await mcpTestApp.callTool("get_block_schema", { name: "richtext" });

        expect(isError).toBe(false);
        expect(text).toContain('"tipTap"');
    });
});
