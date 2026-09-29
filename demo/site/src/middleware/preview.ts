import { getHostByHeaders, getSiteConfigForHost } from "@src/util/siteConfig";
import { type NextRequest, NextResponse } from "next/server";

import type { CustomMiddleware } from "./chain";

export function withPreviewMiddleware(middleware: CustomMiddleware) {
    return async (request: NextRequest) => {
        // Block preview is always allowed
        if (request.nextUrl.pathname.startsWith("/block-preview/")) {
            // don't apply any other middlewares
            return NextResponse.next();
        }

        // Api url for invoking site-preview is always allowed
        if (request.nextUrl.pathname === "/site-preview") {
            // don't apply any other middlewares
            return NextResponse.next();
        }

        // Check if scope has been set via the site-preview api url
        const host = getHostByHeaders(request.headers);
        if (host === process.env.PREVIEW_DOMAIN) {
            const siteConfig = await getSiteConfigForHost(host);
            if (!siteConfig) {
                return NextResponse.json({ error: "Preview has to be called from within Dextinity Web preview" }, { status: 404 });
            }
        }

        return middleware(request);
    };
}
