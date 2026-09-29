import { SignJWT } from "jose";
import { describe, expect, it, vi } from "vitest";

import { SKIP_AUTH_SERVICE } from "../util/auth-service.interface";
import { createSitePreviewAuthService, type SitePreviewAuthServiceConfig } from "./site-preview.auth-service";

describe("createSitePreviewAuthService", () => {
    const instantianteService = (config: SitePreviewAuthServiceConfig) => new (createSitePreviewAuthService(config))();
    const mockRequest = (cookieValue: string) => vi.fn().mockReturnValue({ cookies: { __dextinity_site_preview: cookieValue } })();
    const authenticationError = expect.objectContaining({ authenticationError: expect.any(String) });

    it("throws Error on empty secret", async () => {
        const service = instantianteService({ sitePreviewSecret: "" });
        await expect(() => service.authenticateUser(mockRequest(""))).rejects.toThrow("secret must not be empty");
    });

    it("returns SKIP_AUTH_SERVICE on empty cookie ", async () => {
        const service = instantianteService({ sitePreviewSecret: "secret" });
        expect(await service.authenticateUser(mockRequest(""))).toBe(SKIP_AUTH_SERVICE);
    });

    it("returns authenticationError expired jwt", async () => {
        const service = instantianteService({ sitePreviewSecret: "secret" });
        const jwt = await new SignJWT({ userId: "1" })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("-1 day")
            .sign(new TextEncoder().encode("secret"));
        expect(await service.authenticateUser(mockRequest(jwt))).toStrictEqual(authenticationError);
    });

    it("returns authenticationError on wrong secret", async () => {
        const service = instantianteService({ sitePreviewSecret: "secret" });
        const jwt = await new SignJWT({ user: "1" }).setProtectedHeader({ alg: "HS256" }).sign(new TextEncoder().encode("wrongSecret"));
        expect(await service.authenticateUser(mockRequest(jwt))).toStrictEqual(authenticationError);
    });

    it("returns authenticationError on wrong payload", async () => {
        const service = instantianteService({ sitePreviewSecret: "secret" });
        const jwt = await new SignJWT({ user: "1" }).setProtectedHeader({ alg: "HS256" }).sign(new TextEncoder().encode("secret"));
        expect(await service.authenticateUser(mockRequest(jwt))).toStrictEqual(authenticationError);
    });

    it("returns userId on correct site-preview-jwt", async () => {
        const service = instantianteService({ sitePreviewSecret: "secret" });
        const jwt = await new SignJWT({ userId: "1" }).setProtectedHeader({ alg: "HS256" }).sign(new TextEncoder().encode("secret"));
        expect(await service.authenticateUser(mockRequest(jwt))).toStrictEqual({ userId: "1" });
    });
});
