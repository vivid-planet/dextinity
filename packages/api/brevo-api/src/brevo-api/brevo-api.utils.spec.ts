import { Brevo, BrevoError } from "@getbrevo/brevo";
import { describe, expect, it } from "vitest";

import { handleBrevoError, isErrorFromBrevo } from "./brevo-api.utils";

describe("brevo-api.utils", () => {
    describe("isErrorFromBrevo", () => {
        it("returns true for a BrevoError", () => {
            expect(isErrorFromBrevo(new Brevo.NotFoundError({ code: "not_found", message: "Contact does not exist" }))).toBe(true);
        });

        it("returns false for a plain error or arbitrary value", () => {
            expect(isErrorFromBrevo(new Error("boom"))).toBe(false);
            expect(isErrorFromBrevo({ statusCode: 404 })).toBe(false);
            expect(isErrorFromBrevo(undefined)).toBe(false);
        });
    });

    describe("handleBrevoError", () => {
        it("throws an Error with the message from the Brevo response body", () => {
            const error = new Brevo.BadRequestError({ code: "invalid_parameter", message: "Invalid email address" });

            expect(() => handleBrevoError(error)).toThrowError("Invalid email address");
        });

        it("falls back to the error message when the body has no message", () => {
            const error = new BrevoError({ message: "Something went wrong", statusCode: 500 });

            expect(() => handleBrevoError(error)).toThrowError(error.message);
        });

        it("rethrows a non-Brevo error unchanged", () => {
            const error = new Error("network down");

            let caught: unknown;
            try {
                handleBrevoError(error);
            } catch (e) {
                caught = e;
            }

            expect(caught).toBe(error);
        });
    });
});
