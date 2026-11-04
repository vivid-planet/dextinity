import type { NextRequest } from "next/server";

import type { CustomMiddleware } from "./chain";

type ContentSecurityPolicyDirective = {
    directive: string;
    values: Array<string | undefined>;
};

const contentSecurityPolicyDirectives: ContentSecurityPolicyDirective[] = [
    { directive: "default-src", values: ["'none'"] }, // Restrict any content not explicitly allowed
    { directive: "connect-src", values: ["'self'", "https://www.google.com/recaptcha/", process.env.NODE_ENV === "development" ? "ws:" : undefined] },
    { directive: "style-src-elem", values: ["'self'", "'unsafe-inline'"] },
    {
        directive: "script-src-elem",
        values: ["'self'", "'unsafe-inline'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
    },
    { directive: "img-src", values: ["'self'", "data:", process.env.ADMIN_URL] },
    { directive: "media-src", values: ["'self'", "data:"] },
    { directive: "style-src-attr", values: ["'unsafe-inline'"] },
    { directive: "font-src", values: ["'self'", "data:"] },
    { directive: "frame-ancestors", values: [process.env.ADMIN_URL ?? "https:"] },
    { directive: "frame-src", values: ["https://*.youtube-nocookie.com", "https://player.vimeo.com", "https://www.google.com/recaptcha/"] },
];

if (process.env.NODE_ENV === "development") {
    contentSecurityPolicyDirectives.push({ directive: "script-src", values: ["'unsafe-eval'"] });
} else {
    contentSecurityPolicyDirectives.push({ directive: "upgrade-insecure-requests", values: [] });
}

const contentSecurityPolicy = contentSecurityPolicyDirectives
    .map((directive) => `${directive.directive} ${directive.values.filter((value) => value !== undefined).join(" ")}`)
    .join("; ");

export function withContentSecurityPolicyHeadersMiddleware(middleware: CustomMiddleware) {
    return async (request: NextRequest) => {
        const response = await middleware(request);

        response.headers.set("Content-Security-Policy", contentSecurityPolicy);

        if (process.env.ADMIN_URL) {
            response.headers.set("Access-Control-Allow-Origin", process.env.ADMIN_URL);
        }

        return response;
    };
}
