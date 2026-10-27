import { DetailedError } from "hono/client";

/** Prefers the message of the API's error response (`{ statusCode, message }`) over the HTTP status text. */
export function getErrorMessage(error: unknown): string {
    if (error instanceof DetailedError) {
        const message = (error.detail?.data as { message?: unknown } | undefined)?.message;
        if (typeof message === "string") {
            return message;
        }
    }
    return error instanceof Error ? error.message : String(error);
}
