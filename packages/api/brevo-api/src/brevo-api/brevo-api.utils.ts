import { BrevoError } from "@getbrevo/brevo";

import { BrevoApiKeyRejectedError } from "./brevo-api-key-rejected.error";

export function isErrorFromBrevo(error: unknown): error is BrevoError {
    return error instanceof BrevoError;
}

export function handleBrevoError(error: unknown): never {
    if (isErrorFromBrevo(error)) {
        const message = (error.body as { message?: string } | undefined)?.message ?? error.message;

        if (error.statusCode === 401) {
            throw new BrevoApiKeyRejectedError(message, { cause: error });
        }

        throw new Error(message);
    } else {
        throw error;
    }
}
