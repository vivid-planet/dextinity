import { afterEach, describe, expect, it, vi } from "vitest";

import { reportError, setErrorReporter } from "./reportError.js";

describe("reportError", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("passes the error to the reporter of the site", () => {
        const reporter = vi.fn();
        setErrorReporter(reporter);
        const error = new Error("Failed");

        reportError(error);

        expect(reporter).toHaveBeenCalledWith(error);
    });

    it("logs the error and the reporter's error when the reporter fails", () => {
        const reporterError = new Error("Reporter failed");
        setErrorReporter(() => {
            throw reporterError;
        });
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const error = new Error("Failed");

        expect(() => reportError(error)).not.toThrow();

        expect(consoleError).toHaveBeenCalledWith(error);
        expect(consoleError).toHaveBeenCalledWith(reporterError);
    });
});
