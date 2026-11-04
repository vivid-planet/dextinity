import { describe, expect, it, vi } from "vitest";

import { SKIP_AUTH_SERVICE } from "../util/auth-service.interface";
import { createBasicAuthService } from "./basic.auth-service";

describe("createBasicAuthService", () => {
    const createService = (username: string, password: string) => createBasicAuthService({ username, password });
    const instantianteService = (username: string, password: string) => new (createBasicAuthService({ username, password }))();
    const mockRequest = (authorizationHeader: string) => vi.fn().mockReturnValue({ header: vi.fn().mockImplementation(() => authorizationHeader) })();

    it("throws error on wrong configuration", async () => {
        expect(() => createService("vivid", "")).toThrowError();
        expect(() => createService("", "planet")).toThrowError();
        expect(() => createService("", "")).toThrowError();
    });

    it("returns skip authentication on unknown header", async () => {
        const service = instantianteService("vivid", "planet");
        expect(service.authenticateUser(mockRequest("Bearer"))).toBe(SKIP_AUTH_SERVICE);
        expect(service.authenticateUser(mockRequest("Bearer xxx"))).toBe(SKIP_AUTH_SERVICE);
        expect(service.authenticateUser(mockRequest("BasicAuth xxx"))).toBe(SKIP_AUTH_SERVICE);
        expect(service.authenticateUser(mockRequest(""))).toBe(SKIP_AUTH_SERVICE);
    });

    it("returns skip authentication on non decodable payload", async () => {
        const service = instantianteService("vivid", "planet");
        expect(service.authenticateUser(mockRequest("Basic #"))).toBe(SKIP_AUTH_SERVICE);
    });

    it("returns skips authentication on wrong username", async () => {
        const service = instantianteService("vivid", "planet");
        expect(service.authenticateUser(mockRequest(`Basic ${btoa("vivit:planet")}`))).toBe(SKIP_AUTH_SERVICE);
        expect(service.authenticateUser(mockRequest(`Basic ${btoa("vivit:planed")}`))).toBe(SKIP_AUTH_SERVICE);
    });

    it("returns authenticationError on wrong password", async () => {
        const service = instantianteService("vivid", "planet");
        const authenticationError = expect.objectContaining({ authenticationError: expect.any(String) });
        expect(service.authenticateUser(mockRequest(`Basic ${btoa("vivid:foo")}`))).toEqual(authenticationError);
        expect(service.authenticateUser(mockRequest(`Basic ${btoa("vivid::")}`))).toEqual(authenticationError);
        expect(service.authenticateUser(mockRequest(`Basic ${btoa("vivid")}`))).toEqual(authenticationError);
        expect(service.authenticateUser(mockRequest(`Basic ${btoa("vivid:planetfoo")}`))).toEqual(authenticationError);
    });

    it("returns username on correct authentication", async () => {
        const service = instantianteService("vivid", "planet");
        expect(service.authenticateUser(mockRequest(`Basic ${btoa("vivid:planet")}`))).toStrictEqual({ systemUser: "vivid" });
    });
});
