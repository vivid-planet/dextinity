// @vitest-environment node
import { describe, expect, it } from "vitest";

import { getNavigationErrorDigest, isNotFoundDigest, notFound, parseRedirectDigest, redirect } from "./navigation.js";

function getThrownDigest(callback: () => unknown) {
    try {
        callback();
    } catch (error) {
        const digest = getNavigationErrorDigest(error);
        if (digest) {
            return digest;
        }
    }
    throw new Error("Expected callback to throw a navigation error");
}

describe("notFound", () => {
    it("throws an error with a not found digest", () => {
        const digest = getThrownDigest(notFound);

        expect(isNotFoundDigest(digest)).toBe(true);
        expect(parseRedirectDigest(digest)).toBeUndefined();
    });
});

describe("redirect", () => {
    it("throws an error with a redirect digest using status 307 by default", () => {
        const digest = getThrownDigest(() => redirect("/en/target"));

        expect(isNotFoundDigest(digest)).toBe(false);
        expect(parseRedirectDigest(digest)).toEqual({ location: "/en/target", status: 307 });
    });

    it("keeps the given status", () => {
        const digest = getThrownDigest(() => redirect("/en/target", 308));

        expect(parseRedirectDigest(digest)).toEqual({ location: "/en/target", status: 308 });
    });

    it("keeps semicolons in the location", () => {
        const digest = getThrownDigest(() => redirect("https://example.com/a;b?c=d;e"));

        expect(parseRedirectDigest(digest)).toEqual({ location: "https://example.com/a;b?c=d;e", status: 307 });
    });
});

describe("getNavigationErrorDigest", () => {
    it("ignores other errors", () => {
        expect(getNavigationErrorDigest(new Error("NOT_FOUND"))).toBeUndefined();
        expect(getNavigationErrorDigest(Object.assign(new Error(), { digest: "1234567890" }))).toBeUndefined();
        expect(getNavigationErrorDigest({ digest: 404 })).toBeUndefined();
        expect(getNavigationErrorDigest("NOT_FOUND")).toBeUndefined();
        expect(getNavigationErrorDigest(null)).toBeUndefined();
        expect(getNavigationErrorDigest(undefined)).toBeUndefined();
    });

    it("accepts errors that only carry the digest, as React recreates them in the SSR environment and the browser", () => {
        expect(getNavigationErrorDigest(Object.assign(new Error(), { digest: "NOT_FOUND" }))).toBe("NOT_FOUND");
    });
});
