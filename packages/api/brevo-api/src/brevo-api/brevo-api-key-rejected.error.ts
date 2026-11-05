export class BrevoApiKeyRejectedError extends Error {
    constructor(brevoMessage: string, options?: ErrorOptions) {
        super(`Brevo rejected the API key: ${brevoMessage}`, options);
        this.name = "BrevoApiKeyRejectedError";
    }
}
