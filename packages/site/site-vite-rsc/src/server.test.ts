// @vitest-environment node
import { describe, expect, it } from "vitest";

describe("server", () => {
    it("can be imported outside of Vite's RSC environment, e.g. by middlewares in unit tests", async () => {
        await expect(import("./server.js")).resolves.toHaveProperty("renderPage");
    });
});
