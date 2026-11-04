import { BrevoError } from "@getbrevo/brevo";

export function isErrorFromBrevo(error: unknown): error is BrevoError {
    return error instanceof BrevoError;
}

export function handleBrevoError(error: unknown): never {
    if (isErrorFromBrevo(error)) {
        const message = (error.body as { message?: string } | undefined)?.message ?? error.message;
        throw new Error(message);
    } else {
        throw error;
    }
}
