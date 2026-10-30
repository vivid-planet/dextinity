import { getHostByHeaders, getSiteConfigForHost } from "@src/util/siteConfig";
import { type NextRequest, NextResponse } from "next/server";

import type { CustomMiddleware } from "./chain";

export function withAdminRedirectMiddleware(middleware: CustomMiddleware) {
    return async (request: NextRequest) => {
        if (request.nextUrl.pathname === "/admin" && process.env.ADMIN_URL) {
            const host = getHostByHeaders(request.headers);
            const siteConfig = await getSiteConfigForHost(host);
            if (siteConfig) {
                const { domain, languages } = siteConfig.scope;
                const language = languages[0];
                return NextResponse.redirect(new URL(`/${domain}/${language}`, process.env.ADMIN_URL));
            }
            return NextResponse.redirect(new URL(process.env.ADMIN_URL));
        }
        return middleware(request);
    };
}
