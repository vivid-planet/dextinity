import { InternalServerErrorException, Logger } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BrevoApiKeyRejectedError } from "./brevo-api-key-rejected.error";
import { BrevoApiKeyRejectedFilter } from "./brevo-api-key-rejected.filter";

describe("BrevoApiKeyRejectedFilter", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns an InternalServerErrorException explaining the configuration", () => {
        vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);

        const result = new BrevoApiKeyRejectedFilter().catch(new BrevoApiKeyRejectedError("Key not found"));

        expect(result).toBeInstanceOf(InternalServerErrorException);
        expect(result.message).toBe(
            "Brevo rejected the API key. Make sure a valid Brevo API key is configured and the API's IP address is authorized in Brevo.",
        );
    });

    it("logs Brevo's message, which isn't returned to the client", () => {
        const logError = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
        const exception = new BrevoApiKeyRejectedError("We have detected you are using an unrecognised IP address 192.0.2.1");

        const result = new BrevoApiKeyRejectedFilter().catch(exception);

        expect(logError).toHaveBeenCalledWith(exception, exception.stack);
        expect(result.message).not.toContain("192.0.2.1");
    });
});
