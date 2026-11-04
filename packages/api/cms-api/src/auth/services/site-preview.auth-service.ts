import { Injectable, Type } from "@nestjs/common";
import { Request } from "express";
import { errors, jwtVerify } from "jose";

import { AuthenticateUserResult, AuthServiceInterface, SKIP_AUTH_SERVICE } from "../util/auth-service.interface";

export interface SitePreviewAuthServiceConfig {
    sitePreviewSecret: string;
}

export function createSitePreviewAuthService({ sitePreviewSecret }: SitePreviewAuthServiceConfig): Type<AuthServiceInterface> {
    @Injectable()
    class SitePreviewAuthService implements AuthServiceInterface {
        async authenticateUser(request: Request): Promise<AuthenticateUserResult> {
            if (!sitePreviewSecret) {
                throw new Error("secret must not be empty");
            }

            const cookieValue = request.cookies["__dextinity_site_preview"];
            if (!cookieValue) {
                return SKIP_AUTH_SERVICE;
            }

            try {
                const {
                    payload: { userId },
                } = await jwtVerify<{ userId: string }>(cookieValue, new TextEncoder().encode(sitePreviewSecret));
                if (typeof userId !== "string") {
                    return {
                        authenticationError: "SitePreviewAuthService: token does not contain userId.",
                    };
                }
                return {
                    userId,
                };
            } catch (e) {
                if (e instanceof errors.JOSEError) {
                    return {
                        authenticationError: (e as Error).message,
                    };
                }
                throw e;
            }
        }
    }
    return SitePreviewAuthService;
}
