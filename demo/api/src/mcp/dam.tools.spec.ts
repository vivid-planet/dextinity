import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { createMcpTestApp } from "./mcp.test-helper.js";

const damFile = { id: "0190a5f4-0000-7000-8000-000000000021", name: "spring.jpg", scope: { domain: "secondary" } };
const findDamFiles = vi.fn(async (): Promise<[(typeof damFile)[], number]> => [[], 0]);

let mcpTestApp: Awaited<ReturnType<typeof createMcpTestApp>>;

beforeAll(async () => {
    mcpTestApp = await createMcpTestApp({ damFiles: [damFile], findDamFiles });
});

afterAll(async () => {
    await mcpTestApp?.close();
});

describe("DamTools", () => {
    it("refuses to list the DAM files of a scope the user may not read", async () => {
        const { text, isError } = await mcpTestApp.callTool("list_dam_files", { scope: { domain: "secondary" } });

        expect(isError).toBe(true);
        expect(text).toBe("You may not read the DAM of this scope.");
    });

    it("sorts the DAM files ascending when only the column is named, as the damFilesList query does", async () => {
        const { isError } = await mcpTestApp.callTool("list_dam_files", { scope: { domain: "main" }, sortColumnName: "name" });

        expect(isError).toBe(false);
        expect(findDamFiles).toHaveBeenCalledWith(expect.objectContaining({ sortColumnName: "name", sortDirection: "ASC" }), { domain: "main" });
    });

    it("answers a DAM file of a scope the user may not read as if it didn't exist", async () => {
        const { text, isError } = await mcpTestApp.callTool("get_dam_file", { id: damFile.id });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no DAM file ${damFile.id}.`);
    });
});
