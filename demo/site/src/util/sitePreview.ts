import type { PreviewData } from "@dextinity/site-react";
import { getCookie, getRequest } from "@dextinity/site-vite-rsc/server";
import { errors, jwtVerify, SignJWT } from "jose";

export type PreviewParams = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scope: Record<string, any>;
    previewData?: PreviewData;
};

type SitePreviewParams = PreviewParams & {
    userId: string;
};

// Type created by sitePreviewJwt resolver in cms-api
export type SitePreviewJwtPayload = SitePreviewParams & {
    path: string;
};

export const sitePreviewCookieName = "__dextinity_site_preview";

function getSecret() {
    if (!process.env.SITE_PREVIEW_SECRET) {
        throw new Error("SITE_PREVIEW_SECRET environment variable is required.");
    }
    return new TextEncoder().encode(process.env.SITE_PREVIEW_SECRET);
}

export async function verifyJwt<T>(jwt: string): Promise<T | null> {
    try {
        const data = await jwtVerify<T>(jwt, getSecret());
        return data.payload;
    } catch (e) {
        if (e instanceof errors.JOSEError) {
            return null;
        }
        throw e;
    }
}

export async function createSitePreviewJwt(payload: SitePreviewParams) {
    return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1 day").sign(getSecret());
}

/**
 * @param options.checkBlockPreviewHeader Also accept the preview params from the `x-block-preview` header
 * @return If SitePreview is active the current preview settings
 */
export async function getPreviewParams({ checkBlockPreviewHeader }: { checkBlockPreviewHeader: boolean } = { checkBlockPreviewHeader: false }) {
    const blockPreviewHeader = getRequest().headers.get("x-block-preview");
    if (checkBlockPreviewHeader && blockPreviewHeader) {
        return verifyJwt<PreviewParams>(blockPreviewHeader);
    }

    const cookie = getCookie(sitePreviewCookieName);
    if (cookie) {
        return verifyJwt<PreviewParams>(cookie);
    }

    return null;
}
