import { isRouteErrorResponse } from "react-router";
import { describe, expect, it } from "vitest";

import { notFound, redirect } from "./navigation.js";

function getThrown(callback: () => void): unknown {
    try {
        callback();
    } catch (error) {
        return error;
    }
    throw new Error("Expected the callback to throw");
}

describe("notFound", () => {
    it("throws a 404 response for the error boundary", () => {
        const thrown = getThrown(() => notFound()) as { type: string; init: ResponseInit };

        expect(thrown.type).toBe("DataWithResponseInit");
        expect(thrown.init.status).toBe(404);
    });
});

describe("redirect", () => {
    it("throws a redirect response, temporary by default", () => {
        const response = getThrown(() => redirect("/en/target")) as Response;

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe("/en/target");
    });

    it("throws a redirect with the given status", () => {
        expect((getThrown(() => redirect("https://www.example.com/", 301)) as Response).status).toBe(301);
    });

    it("refuses targets the browser can't safely navigate to", () => {
        const thrown = getThrown(() => redirect("javascript:alert(1)"));

        expect(thrown).toBeInstanceOf(Error);
        expect(isRouteErrorResponse(thrown)).toBe(false);
    });
});
