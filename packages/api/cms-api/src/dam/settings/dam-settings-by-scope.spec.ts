import { describe, expect, it } from "vitest";

import { damSettingsByScope } from "./dam-settings-by-scope";

describe("damSettingsByScope", () => {
    it("matches the whole scope instead of single scope parts", () => {
        expect(damSettingsByScope({ domain: "main" })).toEqual({ scope: { $eq: { domain: "main" } } });
    });

    it("matches settings without scope when the DAM has no scope", () => {
        expect(damSettingsByScope(undefined)).toEqual({ scope: null });
    });
});
