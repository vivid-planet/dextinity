import type { ErrorInfo } from "react";
import { render } from "test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ErrorBoundary } from "../errorboundary/ErrorBoundary";
import { ErrorHandlerProvider } from "./ErrorHandlerProvider";

const ThrowingChild = () => {
    throw new Error("Boom");
};

describe("ErrorHandlerProvider", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("invokes onError from context when a descendant ErrorBoundary catches an error", () => {
        // React logs caught errors via console.error; suppress to keep test output clean.
        vi.spyOn(console, "error").mockImplementation(() => {});

        const onError = vi.fn();

        render(
            <ErrorHandlerProvider onError={onError}>
                <ErrorBoundary>
                    <ThrowingChild />
                </ErrorBoundary>
            </ErrorHandlerProvider>,
        );

        expect(onError).toHaveBeenCalledTimes(1);
        const [error, errorInfo] = onError.mock.calls[0] as [Error, ErrorInfo];
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe("Boom");
        expect(errorInfo.componentStack).toEqual(expect.any(String));
    });

    test("does not throw when ErrorBoundary is rendered without an ErrorHandlerProvider", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        expect(() =>
            render(
                <ErrorBoundary>
                    <ThrowingChild />
                </ErrorBoundary>,
            ),
        ).not.toThrow();
    });
});
