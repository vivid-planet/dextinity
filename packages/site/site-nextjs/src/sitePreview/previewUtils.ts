import type { PreviewData } from "@dextinity/site-react";
import { errors, jwtVerify, SignJWT } from "jose";
import type { NextApiRequest } from "next";
import { cookies, draftMode, headers as getHeaders } from "next/headers";

// Return type of previewParams function
type PreviewParams = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scope: Record<string, any>;
    previewData?: PreviewData;
};

// For site preview cookie, used by SitePreviewAuthService
export type SitePreviewParams = PreviewParams & {
    userId: string;
};

// Type created by sitePreviewJwt resolver in cms-api
export type SitePreviewJwtPayload = SitePreviewParams & {
    path: string;
};

export async function verifyJwt<T>(jwt: string): Promise<T | null> {
    if (!process.env.SITE_PREVIEW_SECRET) {
        throw new Error("SITE_PREVIEW_SECRET environment variable is required.");
    }
    try {
        const data = await jwtVerify<T>(jwt, new TextEncoder().encode(process.env.SITE_PREVIEW_SECRET));
        return data.payload;
    } catch (e) {
        if (e instanceof errors.JOSEError) {
            return null;
        }
        throw e;
    }
}

export async function setSitePreviewParams(payload: SitePreviewParams) {
    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1 day")
        .sign(new TextEncoder().encode(process.env.SITE_PREVIEW_SECRET));
    (await cookies()).set("__dextinity_site_preview", jwt, { httpOnly: true, sameSite: "lax" });
    (await draftMode()).enable();
}

/**
 * Helper for SitePreview
 * @param options.skipDraftModeCheck Allows skipping the draft mode check, only required when called from proxy.ts (see https://github.com/vercel/next.js/issues/52080)
 * @return If SitePreview is active the current preview settings
 */
export async function previewParams(options: { skipDraftModeCheck: boolean } = { skipDraftModeCheck: false }): Promise<PreviewParams | null> {
    // Do not call headers() (and hence force dynamic rendering) when called from different places than proxy or API routes
    if (options.skipDraftModeCheck) {
        const headers = await getHeaders();
        if (headers.has("x-block-preview")) {
            return verifyJwt<PreviewParams>(headers.get("x-block-preview") || "");
        }
    }

    if (!options.skipDraftModeCheck) {
        if (!(await draftMode()).isEnabled) {
            return null;
        }
    }

    const cookie = (await cookies()).get("__dextinity_site_preview");
    if (cookie) {
        return verifyJwt<PreviewParams>(cookie.value);
    }

    return null;
}

export async function legacyPagesRouterPreviewParams(req: NextApiRequest): Promise<PreviewParams | null> {
    if (req.headers["x-block-preview"]) {
        return verifyJwt<PreviewParams>(req.headers["x-block-preview"].toString());
    }

    if (req.previewData) {
        return req.previewData as PreviewParams;
    }
    return null;
}
