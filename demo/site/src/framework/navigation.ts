// React keeps the digest of an error thrown while rendering server components, so it's also available in the
// SSR environment and in the browser
const notFoundDigest = "NOT_FOUND";
const redirectDigestPrefix = "REDIRECT;";

type RedirectStatus = 301 | 302 | 307 | 308;

class NavigationError extends Error {
    constructor(readonly digest: string) {
        super(digest);
    }
}

/**
 * Renders the not found page with status 404.
 */
export function notFound(): never {
    throw new NavigationError(notFoundDigest);
}

/**
 * Responds with a redirect.
 */
export function redirect(location: string, status: RedirectStatus = 307): never {
    throw new NavigationError(`${redirectDigestPrefix}${status};${location}`);
}

/**
 * @returns The digest if the error was thrown by `notFound()` or `redirect()`
 */
export function getNavigationErrorDigest(error: unknown): string | undefined {
    if (typeof error !== "object" || error === null || !("digest" in error) || typeof error.digest !== "string") {
        return undefined;
    }
    if (error.digest === notFoundDigest || error.digest.startsWith(redirectDigestPrefix)) {
        return error.digest;
    }
    return undefined;
}

export function isNotFoundDigest(digest: string) {
    return digest === notFoundDigest;
}

export function parseRedirectDigest(digest: string): { location: string; status: RedirectStatus } | undefined {
    if (!digest.startsWith(redirectDigestPrefix)) {
        return undefined;
    }
    const [status, ...location] = digest.slice(redirectDigestPrefix.length).split(";");
    return { location: location.join(";"), status: Number(status) as RedirectStatus };
}
