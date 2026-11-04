import type { PreviewData } from "@dextinity/site-react";
import { errors, jwtVerify, SignJWT } from "jose";

const sitePreviewCookieName = "__dextinity_site_preview";

export type PreviewParams = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scope: Record<string, any>;
    previewData?: PreviewData;
};

/**
 * The parameters of the site preview cookie, see `SitePreviewAuthService` of `@dextinity/cms-api`
 */
export type SitePreviewParams = PreviewParams & {
    userId: string;
};

/**
 * The payload of the JWT that the `sitePreviewJwt` resolver of `@dextinity/cms-api` creates
 */
export type SitePreviewJwtPayload = SitePreviewParams & {
    path: string;
};

function getSecret() {
    if (!process.env.SITE_PREVIEW_SECRET) {
        throw new Error("SITE_PREVIEW_SECRET environment variable is required.");
    }
    return new TextEncoder().encode(process.env.SITE_PREVIEW_SECRET);
}

export async function verifyJwt<T>(jwt: string): Promise<T | null> {
    try {
        const { payload } = await jwtVerify<T>(jwt, getSecret());
        return payload;
    } catch (error) {
        if (error instanceof errors.JOSEError) {
            return null;
        }
        throw error;
    }
}

export async function createSitePreviewCookie(params: SitePreviewParams): Promise<string> {
    const jwt = await new SignJWT({ scope: params.scope, previewData: params.previewData, userId: params.userId })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1 day")
        .sign(getSecret());
    return `${sitePreviewCookieName}=${jwt}; Path=/; HttpOnly; SameSite=Lax`;
}

function getCookie(request: Request, name: string): string | undefined {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
        return undefined;
    }
    for (const cookie of cookieHeader.split(";")) {
        const separatorIndex = cookie.indexOf("=");
        if (separatorIndex !== -1 && cookie.slice(0, separatorIndex).trim() === name) {
            return decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
        }
    }
    return undefined;
}

/**
 * The parameters of the site preview, the counterpart of `previewParams()` of `@dextinity/site-nextjs`
 *
 * @returns The scope and preview data if the request is part of a site preview, which `sitePreviewRoute()` started, otherwise `null`
 */
export async function previewParams(request: Request): Promise<SitePreviewParams | null> {
    const jwt = getCookie(request, sitePreviewCookieName);
    if (!jwt) {
        return null;
    }
    return verifyJwt<SitePreviewParams>(jwt);
}

/**
 * Starts the site preview of the admin: verifies the JWT of the admin, stores the preview parameters in a cookie and redirects
 * to the previewed page. Use it as `loader` of the `site-preview` route.
 *
 * @example
 * // src/routes/sitePreview.ts
 * export function loader({ request }: Route.LoaderArgs) {
 *     return sitePreviewRoute(request);
 * }
 */
export async function sitePreviewRoute(request: Request): Promise<Response> {
    const jwt = new URL(request.url).searchParams.get("jwt");
    if (!jwt) {
        return Response.json({ error: "JWT-Parameter is missing." }, { status: 400 });
    }

    const data = await verifyJwt<SitePreviewJwtPayload>(jwt);
    if (!data) {
        return Response.json({ error: "JWT-validation failed." }, { status: 400 });
    }

    if (!data.path.startsWith("/") || data.path.startsWith("//")) {
        return Response.json({ error: `Redirect to ${data.path} disallowed: only relative paths are valid.` }, { status: 400 });
    }

    return new Response(null, {
        status: 307,
        headers: {
            Location: data.path,
            "Set-Cookie": await createSitePreviewCookie({ scope: data.scope, previewData: data.previewData, userId: data.userId }),
            "Cache-Control": "private, no-store",
        },
    });
}
