export const nullBodyStatuses = [204, 205, 304];

export function isJsonContentType(contentType: string) {
    return /^application\/([\w.-]+\+)?json\b/i.test(contentType);
}

/**
 * Only successful responses may be reused. GraphQL APIs respond to failed queries with status 200 and `errors` in the body.
 */
export function isSuccessfulResponse({ status, contentType, body }: { status: number; contentType: string | null; body: string }) {
    if (status < 200 || status > 299) {
        return false;
    }
    if (isJsonContentType(contentType ?? "")) {
        try {
            return !(JSON.parse(body) as { errors?: unknown }).errors;
        } catch {
            return false;
        }
    }
    return true;
}
