import { describe, expect, it } from "vitest";

import { defaultDateInputErrorLabels, invalidTimeMessage, readTypedDay } from "../typedDay";

const options = { locale: "de-AT", min: "2026-11-03", max: "2026-11-20", labels: defaultDateInputErrorLabels };

describe("readTypedDay", () => {
    it("reads a day within the limits", () => {
        expect(readTypedDay("6.11.2026", options)).toStrictEqual({ day: "2026-11-06" });
    });

    it("reads empty text as no day", () => {
        expect(readTypedDay("  ", options)).toStrictEqual({ day: null });
    });

    it("explains text that is no day with an example in the locale's format", () => {
        expect(readTypedDay("31.2.2026", options).error).toMatch(/^Enter a date like 24\.12\.\d{4}\.$/);
    });

    it("names the limits for a day outside them", () => {
        expect(readTypedDay("24.11.2026", options).error).toBe("Choose a date from 03.11.2026 to 20.11.2026.");
        expect(readTypedDay("1.1.2026", { ...options, max: undefined }).error).toBe("Choose 03.11.2026 or later.");
        expect(readTypedDay("1.1.2027", { ...options, min: undefined }).error).toBe("Choose 20.11.2026 or earlier.");
    });
});

describe("invalidTimeMessage", () => {
    it("shows an example time in the locale's clock", () => {
        expect(invalidTimeMessage("en-US", defaultDateInputErrorLabels)).toBe("Enter a time like 02:30 PM.");
        expect(invalidTimeMessage("de-AT", defaultDateInputErrorLabels)).toBe("Enter a time like 14:30.");
    });
});
