export interface MailImage {
    buffer: Buffer;
    filename: string;
    contentType: string;
}

/**
 * A fetch that failed for a reason that may be gone for the next mail, e.g. imgproxy not reachable, a timeout or a 5xx. Thrown rather
 * than returned as `null`, so a `MailImageCache` doesn't keep the failure.
 */
export class MailImageFetchError extends Error {
    constructor(what: string, reason: string) {
        super(`Fetching ${what} failed: ${reason}`);
        this.name = "MailImageFetchError";
    }
}
