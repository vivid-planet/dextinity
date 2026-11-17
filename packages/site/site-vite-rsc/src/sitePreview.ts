import type { PreviewData } from "@dextinity/site-react";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { errors, jwtVerify, SignJWT } from "jose";

import { noStoreCacheControl } from "./cacheControl.js";
import { getCookie, getRequest, setPreview, type Visibility } from "./requestContext.js";

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

function getVisibility(previewData: PreviewData | undefined): Visibility {
    if (!previewData) {
        return "default";
    }
    return previewData.includeInvisible ? "invisibleBlocks" : "invisiblePages";
}

/**
 * Sets the visibility and the site preview of the request from the block preview header of the admin or the cookie of the site
 * preview. The project resolves its site with `getPreviewScope()`.
 */
export const sitePreviewMiddleware = createMiddleware(async (_c, next) => {
    const blockPreviewHeader = getRequest().headers.get("x-block-preview");
    const blockPreview = blockPreviewHeader ? await verifyJwt<PreviewParams>(blockPreviewHeader) : null;
    const sitePreviewCookie = getCookie(sitePreviewCookieName);
    const sitePreview = sitePreviewCookie ? await verifyJwt<PreviewParams>(sitePreviewCookie) : null;
    // The block preview header takes precedence, the site preview is only identified by its cookie
    const preview = blockPreview ?? sitePreview;

    setPreview({
        visibility: getVisibility(preview?.previewData),
        sitePreview: sitePreview ? { previewData: sitePreview.previewData } : undefined,
        scope: preview?.scope,
    });

    await next();
});

/**
 * Starts the site preview: the admin opens it with a JWT of the API, it's stored in a cookie for the following requests
 */
export async function sitePreviewRoute(c: Context) {
    // The redirect sets the preview cookie, the errors are only for this JWT
    c.header("Cache-Control", noStoreCacheControl);
    const jwt = c.req.query("jwt");
    if (!jwt) {
        return c.json({ error: "JWT-Parameter is missing." }, 400);
    }

    const data = await verifyJwt<SitePreviewJwtPayload>(jwt);
    if (!data) {
        return c.json({ error: "JWT-validation failed." }, 400);
    }

    if (!data.path.startsWith("/") || data.path.startsWith("//")) {
        return c.json({ error: `Redirect to ${data.path} disallowed: only relative paths are valid.` }, 400);
    }

    const sitePreviewJwt = await createSitePreviewJwt({ scope: data.scope, previewData: data.previewData, userId: data.userId });
    setCookie(c, sitePreviewCookieName, sitePreviewJwt, { httpOnly: true, sameSite: "Lax", path: "/" });

    return c.redirect(data.path, 307);
}
