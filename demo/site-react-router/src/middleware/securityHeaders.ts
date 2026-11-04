// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers, Content-Security-Policy and CORS are set by contentSecurityPolicyHeaders.ts
const securityHeaders: Record<string, string> = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload", // 2 years (recommended when subdomains are included)
    "Cross-Origin-Opener-Policy": "same-origin", // Only allow the same origin to open the page in a browsing context
    // This value should be set to 'require-corp' as soon as iframe credentialless is supported by all browsers
    // https://developer.mozilla.org/en-US/docs/Web/Security/IFrame_credentialless
    "Cross-Origin-Embedder-Policy": "unsafe-none",
    "Cross-Origin-Resource-Policy": "same-site", // Do not allow cross-origin requests to access the response
    "Permissions-Policy": "",
    "X-Content-Type-Options": "nosniff", // Prevent MIME sniffing
    // This should be changed when using web analytics tools. For example, use "strict-origin-when-cross-origin" for Google Analytics
    "Referrer-Policy": "same-origin", // Only use referer on own domain.
};

/**
 * Adds the security headers that the response doesn't set itself, e.g. a response of the API that the DAM route passes on
 */
export function withSecurityHeaders(response: Response): Response {
    const missingHeaders = Object.entries(securityHeaders).filter(([name]) => !response.headers.has(name));
    if (missingHeaders.length === 0) {
        return response;
    }
    // Responses of fetch() have immutable headers
    const headers = new Headers(response.headers);
    for (const [name, value] of missingHeaders) {
        headers.set(name, value);
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
