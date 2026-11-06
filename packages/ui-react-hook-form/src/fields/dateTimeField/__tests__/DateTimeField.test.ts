import { describe, expect, it } from "vitest";

import { toDateTimeValue } from "../DateTimeField";

describe("toDateTimeValue", () => {
    it("maps an empty form value to no instant and keeps a date-time", () => {
        expect(toDateTimeValue(undefined)).toBeNull();
        expect(toDateTimeValue("")).toBeNull();
        expect(toDateTimeValue("2026-11-06T08:30:00.000Z")).toBe("2026-11-06T08:30:00.000Z");
    });
});
