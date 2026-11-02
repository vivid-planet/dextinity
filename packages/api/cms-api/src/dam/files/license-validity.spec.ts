import { describe, expect, it } from "vitest";

import type { License } from "./entities/license.embeddable";
import { isLicenseValid } from "./license-validity";

const now = new Date("2026-10-19T12:00:00.000Z");

describe("isLicenseValid", () => {
    it.each([
        { case: "has no duration", license: {}, expected: true },
        { case: "is within its duration", license: { durationFrom: new Date("2026-10-01"), durationTo: new Date("2026-10-31") }, expected: true },
        { case: "expires at the end of today", license: { durationTo: new Date("2026-10-19T00:00:00.000Z") }, expected: true },
        { case: "has expired", license: { durationTo: new Date("2026-10-18T00:00:00.000Z") }, expected: false },
        { case: "isn't valid yet", license: { durationFrom: new Date("2026-10-20T00:00:00.000Z") }, expected: false },
    ])("returns $expected when the license $case", ({ license, expected }) => {
        expect(isLicenseValid(license as License, now)).toBe(expected);
    });
});
