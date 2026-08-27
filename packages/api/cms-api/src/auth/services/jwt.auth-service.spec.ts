import { JwtService } from "@nestjs/jwt";
import { describe, expect, it, vi } from "vitest";

import { SKIP_AUTH_SERVICE } from "../util/auth-service.interface";
import { createJwtAuthService, type JwtAuthServiceOptions } from "./jwt.auth-service";

describe("createJwtAuthService", () => {
    const instantianteService = (options: JwtAuthServiceOptions) => new (createJwtAuthService(options))(new JwtService());
    const mockRequest = (authorizationHeader: string) => vi.fn().mockReturnValue({ header: vi.fn().mockImplementation(() => authorizationHeader) })();
    const authenticationError = expect.objectContaining({ authenticationError: expect.any(String) });

    // Default token from jwt.io:
    // {
    //     "sub": "1234567890",
    //     "name": "John Doe",
    //     "iat": 1516239022
    // }
    const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o";

    it("returns SKIP_AUTH_SERVICE on unknown header", async () => {
        const service = instantianteService({});
        expect(await service.authenticateUser(mockRequest(""))).toBe(SKIP_AUTH_SERVICE);
        expect(await service.authenticateUser(mockRequest("xxx"))).toBe(SKIP_AUTH_SERVICE);
        expect(await service.authenticateUser(mockRequest("Bearer"))).toBe(SKIP_AUTH_SERVICE);
    });

    it("throws Error on missing secret password", async () => {
        const service = instantianteService({});
        await expect(() => service.authenticateUser(mockRequest(`Bearer ${token}`))).rejects.toThrow("secret or public key must be provided");
    });

    it("returns authenticationError on malformed JWT", async () => {
        const service = instantianteService({ verifyOptions: { secret: "secret" } });
        expect(await service.authenticateUser(mockRequest(`Bearer XXX`))).toStrictEqual(authenticationError);
    });

    it("returns authenticationError on wrong secret", async () => {
        const service = instantianteService({ verifyOptions: { secret: "wrong secret" } });
        expect(await service.authenticateUser(mockRequest(`Bearer ${token}`))).toStrictEqual(authenticationError);
    });

    it("returns authenticationError on expired jwt", async () => {
        const expiredToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.dK_h9vUldnsPtDnTil_YuzaPZT-vMODIfX_nyXDADVE";
        const service = instantianteService({ verifyOptions: { secret: "secret" } });
        expect(await service.authenticateUser(mockRequest(`Bearer ${expiredToken}`))).toStrictEqual(authenticationError);
    });

    it("returns authenticationError on missing sub", async () => {
        const tokenWithoutSub =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.8nYFUX869Y1mnDDDU4yL11aANgVRuifoxrE8BHZY1iE";
        const service = instantianteService({ verifyOptions: { secret: "secret" } });
        expect(await service.authenticateUser(mockRequest(`Bearer ${tokenWithoutSub}`))).toStrictEqual(authenticationError);
    });

    it("verifies token", async () => {
        const service = instantianteService({ verifyOptions: { secret: "secret" } });
        expect(await service.authenticateUser(mockRequest(`Bearer ${token}`))).toStrictEqual({ userId: "1234567890" });
    });

    it("verifies token and returns user", async () => {
        const service = instantianteService({
            verifyOptions: { secret: "secret" },
            convertJwtToUser: (jwt) => ({ id: jwt.sub, name: jwt.name, email: "test@dextinity.com" }),
        });
        expect(await service.authenticateUser(mockRequest(`Bearer ${token}`))).toStrictEqual({
            user: {
                id: "1234567890",
                name: "John Doe",
                email: "test@dextinity.com",
            },
        });
    });

    it("verifies token and returns userId", async () => {
        const service = instantianteService({
            verifyOptions: { secret: "secret" },
            shouldInvokeUserService: true,
        });
        expect(await service.authenticateUser(mockRequest(`Bearer ${token}`))).toStrictEqual({
            userId: "1234567890",
        });
    });
});
