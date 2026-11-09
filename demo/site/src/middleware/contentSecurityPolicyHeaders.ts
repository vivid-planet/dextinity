import { getHostByHeaders, getSiteConfigForHost } from "@src/util/siteConfig";
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
}

function toContentSecurityPolicy(directives: ContentSecurityPolicyDirective[]) {
    return directives.map((directive) => `${directive.directive} ${directive.values.filter((value) => value !== undefined).join(" ")}`).join("; ");
}

const contentSecurityPolicy = toContentSecurityPolicy(contentSecurityPolicyDirectives);
const contentSecurityPolicyWithUpgradeInsecureRequests = toContentSecurityPolicy([
    ...contentSecurityPolicyDirectives,
    { directive: "upgrade-insecure-requests", values: [] },
]);

export function withContentSecurityPolicyHeadersMiddleware(middleware: CustomMiddleware) {
    return async (request: NextRequest) => {
        const response = await middleware(request);

        // Upgrading same-origin requests of a site served over http would hit https on the same port, where nothing listens.
        // Unknown hosts keep the upgrade, so they are never silently downgraded.
        const siteConfig = await getSiteConfigForHost(getHostByHeaders(request.headers));
        const isServedOverHttp = siteConfig?.url.startsWith("http://") ?? false;
        response.headers.set("Content-Security-Policy", isServedOverHttp ? contentSecurityPolicy : contentSecurityPolicyWithUpgradeInsecureRequests);

        if (process.env.ADMIN_URL) {
            response.headers.set("Access-Control-Allow-Origin", process.env.ADMIN_URL);
        }

        return response;
    };
}
