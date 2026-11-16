import { describe, expect, it, vi } from "vitest";

vi.mock("react", async (importOriginal) => {
    const { cache: _cache, ...react18Exports } = await importOriginal<typeof import("react")>();
    return react18Exports;
});

describe("serverIntl with React 18", () => {
    it("can be imported without React's cache", async () => {
        await expect(import("./serverIntl")).resolves.toHaveProperty("setServerIntl");
    });
});
