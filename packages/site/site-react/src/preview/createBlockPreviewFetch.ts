export function createBlockPreviewFetch(originalFetch: typeof fetch, getContentScopeJwt: () => string | null): typeof fetch {
    return async (input, init) => {
        const headers = new Headers(input instanceof Request ? input.headers : undefined);
        for (const [name, value] of new Headers(init?.headers)) {
            headers.set(name, value);
        }

        const url = new URL(input instanceof Request ? input.url : input.toString(), window.location.origin);
        const contentScopeJwt = getContentScopeJwt();
        if (url.host === window.location.host && contentScopeJwt) {
            headers.set("X-Block-Preview", contentScopeJwt);
        }

        return originalFetch(input, { ...init, headers });
    };
}
