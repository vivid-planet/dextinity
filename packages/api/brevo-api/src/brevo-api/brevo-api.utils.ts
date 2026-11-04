import { BrevoError } from "@getbrevo/brevo";
import { InternalServerErrorException } from "@nestjs/common";

export function isErrorFromBrevo(error: unknown): error is BrevoError {
    return error instanceof BrevoError;
}

export function handleBrevoError(error: unknown): never {
    if (isErrorFromBrevo(error)) {
        if (error.statusCode === 401) {
            // An HttpException isn't masked by the ExceptionFilter, so the admin sees why the request failed
            throw new InternalServerErrorException(
                "Brevo rejected the API key. Make sure a valid Brevo API key is configured and the API's IP address is authorized in Brevo.",
                { cause: error },
            );
        }

        const message = (error.body as { message?: string } | undefined)?.message ?? error.message;
        throw new Error(message);
    } else {
        throw error;
    }
}
