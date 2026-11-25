import { describe, expect, it, vi } from "vitest";

import { createAdminPageNavigationTools } from "./adminPageNavigationTools";

const routeUrl = "/main/en";

const pages = [
    { path: "/assets", label: "Assets" },
    { path: "/system/redirects", label: "System › Redirects" },
];

function getAdminTool(name: string) {
    const navigate = vi.fn();
    const tool = createAdminPageNavigationTools({ pages, navigate, routeUrl }).find((candidate) => candidate.name === name);
    if (!tool) {
        throw new Error(`No admin tool "${name}"`);
    }
    return { tool, call: (args: Record<string, unknown>) => tool.handler(args, { clearTextSelection: vi.fn() }), navigate };
}

it("keeps every description within 4096 characters, the limit for a tool description", () => {
    for (const tool of createAdminPageNavigationTools({ pages: [], navigate: vi.fn(), routeUrl })) {
        expect(tool.description.length, tool.name).toBeLessThanOrEqual(4096);
    }
});

describe("open_admin_page", () => {
    it("lists the pages with their labels in the description of the path", () => {
        const { tool } = getAdminTool("open_admin_page");

        expect(JSON.stringify(tool.inputSchema)).toContain("/system/redirects: System › Redirects");
    });

    it("runs without the user's approval, because it only navigates", () => {
        expect(getAdminTool("open_admin_page").tool.readOnlyHint).toBe(true);
    });

    it("opens a page in the current content scope", () => {
        const { call, navigate } = getAdminTool("open_admin_page");

        expect(call({ path: "/system/redirects" })).toContain('Asked the admin to open "System › Redirects"');
        expect(navigate).toHaveBeenCalledWith(`${routeUrl}/system/redirects`);
    });

    it("refuses a path that isn't a page of the list, so it cannot reach any other route", () => {
        const { call, navigate } = getAdminTool("open_admin_page");

        expect(() => call({ path: "/user-permissions" })).toThrow("It must be one of: /assets, /system/redirects.");
        expect(navigate).not.toHaveBeenCalled();
    });
});
