import { describe, expect, it } from "vitest";

import { isValidUrl } from "../isValidUrl";

describe("isValidUrl", () => {
    it("should return true for a valid https URL", () => {
        expect(isValidUrl("https://example.com")).toBe(true);
    });

    it("should return true for a valid http URL", () => {
        expect(isValidUrl("http://example.com")).toBe(true);
    });

    it("should return true for a URL with a path, query and fragment", () => {
        expect(isValidUrl("https://example.com/path?foo=bar#section")).toBe(true);
    });

    it("should return false for a malformed URL", () => {
        expect(isValidUrl("not a url")).toBe(false);
    });

    it("should return false for an empty string", () => {
        expect(isValidUrl("")).toBe(false);
    });

    it("should return false for a relative path without a scheme", () => {
        expect(isValidUrl("/relative/path")).toBe(false);
    });

    it("should return false for an ftp URL", () => {
        expect(isValidUrl("ftp://files.example.com")).toBe(false);
    });

    it("should return false for a javascript: URL", () => {
        expect(isValidUrl("javascript:alert(1)")).toBe(false);
    });

    it("should return false for a mailto: URL", () => {
        expect(isValidUrl("mailto:user@example.com")).toBe(false);
    });
});
