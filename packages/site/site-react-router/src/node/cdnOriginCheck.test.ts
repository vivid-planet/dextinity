// @vitest-environment node
import { describe, expect, it } from "vitest";

import { cdnOriginCheck } from "./cdnOriginCheck";

describe("cdnOriginCheck", () => {
    it("passes requests with the secret", () => {
        expect(
            cdnOriginCheck(new Request("http://localhost/", { headers: { "x-cdn-origin-check": "secret" } }), { secret: "secret" }),
        ).toBeUndefined();
    });

    it("rejects requests without or with another secret", () => {
        expect(cdnOriginCheck(new Request("http://localhost/"), { secret: "secret" })?.status).toBe(403);
        expect(cdnOriginCheck(new Request("http://localhost/", { headers: { "x-cdn-origin-check": "other" } }), { secret: "secret" })?.status).toBe(
            403,
        );
    });
});
