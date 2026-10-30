import { type NextRequest, NextResponse } from "next/server";

import type { CustomMiddleware } from "./chain";

export function withDamRewriteMiddleware(middleware: CustomMiddleware) {
    return async (request: NextRequest) => {
        if (request.nextUrl.pathname.startsWith("/dam/")) {
            return NextResponse.rewrite(new URL(`${process.env.API_URL_INTERNAL}${request.nextUrl.pathname}`));
        }
        return middleware(request);
    };
}
