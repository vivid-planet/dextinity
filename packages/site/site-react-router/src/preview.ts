import type { PreviewData } from "@dextinity/site-react";
import { parse, serialize } from "hono/utils/cookie";
import { errors, jwtVerify, SignJWT } from "jose";
import { createContext, type LoaderFunctionArgs, type MiddlewareFunction, redirect, type RouterContextProvider } from "react-router";

import { noStoreCacheControl } from "./cacheControl.js";

export type Visibility = "default" | "invisiblePages" | "invisibleBlocks";

export type SitePreview = { previewData?: PreviewData };

type Preview = {
    /** From the site preview or the block preview */
    visibility: Visibility;
    /** Set while the site is opened in the site preview of the admin */
    sitePreview?: SitePreview;
    /** Scope of the block preview or the site preview */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scope?: Record<string, any>;
};

/**
 * Set by `sitePreviewMiddleware`, read it with `getVisibility()`, `getSitePreview()` and `getPreviewScope()`
 */
export const previewContext = createContext<Preview>({ visibility: "default" });

type ReadonlyRouterContext = Readonly<RouterContextProvider>;

export function getVisibility(context: ReadonlyRouterContext): Visibility {
    return context.get(previewContext).visibility;
}

export function getSitePreview(context: ReadonlyRouterContext): SitePreview | undefined {
    return context.get(previewContext).sitePreview;
}

/**
 * In the block preview and the site preview, the site is defined by this scope instead of the host
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPreviewScope(context: ReadonlyRouterContext): Record<string, any> | undefined {
    return context.get(previewContext).scope;
}

type PreviewParams = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scope: Record<string, any>;
    previewData?: PreviewData;
};

// Type created by the sitePreviewJwt resolver in cms-api
type SitePreviewJwtPayload = PreviewParams & {
    userId: string;
    path: string;
};

export const sitePreviewCookieName = "__dextinity_site_preview";

function getSecret() {
    if (!process.env.SITE_PREVIEW_SECRET) {
        throw new Error("SITE_PREVIEW_SECRET environment variable is required.");
    }
    return new TextEncoder().encode(process.env.SITE_PREVIEW_SECRET);
}

async function verifyJwt<T>(jwt: string): Promise<T | null> {
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

export async function createSitePreviewJwt(payload: PreviewParams & { userId: string }) {
    return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1 day").sign(getSecret());
}

function getVisibilityOfPreviewData(previewData: PreviewData | undefined): Visibility {
    if (!previewData) {
        return "default";
    }
    return previewData.includeInvisible ? "invisibleBlocks" : "invisiblePages";
}

/**
 * Sets the visibility and the site preview of the request from the block preview header of the admin or the cookie of the site
 * preview in `previewContext`. The project resolves its site with `getPreviewScope()`.
 */
export const sitePreviewMiddleware: MiddlewareFunction<Response> = async ({ request, context }) => {
    const blockPreviewHeader = request.headers.get("x-block-preview");
    const blockPreview = blockPreviewHeader ? await verifyJwt<PreviewParams>(blockPreviewHeader) : null;
    const sitePreviewCookie = parse(request.headers.get("cookie") ?? "", sitePreviewCookieName)[sitePreviewCookieName];
    const sitePreview = sitePreviewCookie ? await verifyJwt<PreviewParams>(sitePreviewCookie) : null;
    // The block preview header takes precedence, the site preview is only identified by its cookie
    const preview = blockPreview ?? sitePreview;

    context.set(previewContext, {
        visibility: getVisibilityOfPreviewData(preview?.previewData),
        sitePreview: sitePreview ? { previewData: sitePreview.previewData } : undefined,
        scope: preview?.scope,
    });
};

/**
 * The loader of the site preview route: the admin opens it with a JWT of the API, it's stored in a cookie for the following requests
 *
 * @example
 * // src/routes/sitePreviewRoute.ts, registered as route("site-preview", "routes/sitePreviewRoute.ts")
 * export { sitePreviewLoader as loader } from "@dextinity/site-react-router/server";
 */
export async function sitePreviewLoader({ request }: Pick<LoaderFunctionArgs, "request">): Promise<Response> {
    // The redirect sets the preview cookie, the errors are only for this JWT
    const headers = { "Cache-Control": noStoreCacheControl };
    const jwt = new URL(request.url).searchParams.get("jwt");
    if (!jwt) {
        return Response.json({ error: "JWT-Parameter is missing." }, { status: 400, headers });
    }

    const data = await verifyJwt<SitePreviewJwtPayload>(jwt);
    if (!data) {
        return Response.json({ error: "JWT-validation failed." }, { status: 400, headers });
    }

    if (!data.path.startsWith("/") || data.path.startsWith("//")) {
        return Response.json({ error: `Redirect to ${data.path} disallowed: only relative paths are valid.` }, { status: 400, headers });
    }

    const sitePreviewJwt = await createSitePreviewJwt({ scope: data.scope, previewData: data.previewData, userId: data.userId });
    return redirect(data.path, {
        status: 307,
        headers: { ...headers, "Set-Cookie": serialize(sitePreviewCookieName, sitePreviewJwt, { httpOnly: true, sameSite: "Lax", path: "/" }) },
    });
}
