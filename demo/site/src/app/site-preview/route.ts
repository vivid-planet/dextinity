import { createSitePreviewJwt, sitePreviewCookieName, type SitePreviewJwtPayload, verifyJwt } from "@src/util/sitePreview";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";

export async function sitePreviewRoute(c: Context) {
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
