import { BadRequestException, Logger, NotFoundException, UnsupportedMediaTypeException } from "@nestjs/common";
import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import type { CurrentUser } from "../user-permissions/dto/current-user.js";
import { AiHubController } from "./ai-hub.controller.js";
import { forwardToAiHub } from "./ai-hub-proxy.js";

vi.mock("./ai-hub-proxy.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("./ai-hub-proxy.js")>()),
    forwardToAiHub: vi.fn(),
}));

describe("AiHubController", () => {
    const user = { id: "user-1", name: "User", email: "user@example.com", permissions: [] } as unknown as CurrentUser;
    const response = {} as Response;

    function request({
        method = "GET",
        originalUrl,
        contentType,
        body,
    }: {
        method?: string;
        originalUrl: string;
        contentType?: string;
        body?: unknown;
    }): Request {
        return {
            method,
            originalUrl,
            baseUrl: "",
            route: { path: "/api/ai-hub/*path" },
            body,
            is: (type: string) => (type === contentType ? type : false),
        } as unknown as Request;
    }

    function controller(): AiHubController {
        return new AiHubController({ apiUrl: "https://ai-hub.test", apiKey: "sk_secret" });
    }

    it.each([
        ["GET", "/api/ai-hub/admin/keys"],
        ["POST", "/api/ai-hub/chat/send-message-feedback/"],
        ["POST", "/api/ai-hub/chat/Send-Message-Feedback"],
        ["GET", "/api/ai-hub/chat"],
    ])("answers %s %s, which the chat doesn't request, with 404 and a warning", (method, originalUrl) => {
        const warn = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);

        expect(() => controller().proxy(request({ method, originalUrl }), response, user)).toThrow(NotFoundException);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("which no route forwards"));
    });

    it.each([
        ["POST", "/api/ai-hub/chat", "multipart/form-data"],
        ["POST", "/api/ai-hub/file-uploads/upload", "application/json"],
        ["POST", "/api/ai-hub/speech/transcribe", "application/json"],
    ])("answers %s %s with 415 for %s", (method, originalUrl, contentType) => {
        expect(() => controller().proxy(request({ method, originalUrl, contentType, body: {} }), response, user)).toThrow(
            UnsupportedMediaTypeException,
        );
    });

    it("answers with 400 when a JSON body isn't an object", () => {
        expect(() =>
            controller().proxy(
                request({ method: "POST", originalUrl: "/api/ai-hub/chat", contentType: "application/json", body: [] }),
                response,
                user,
            ),
        ).toThrow(BadRequestException);
    });

    it("forwards a request of the chat with the verified user ID where the AI Hub reads it", () => {
        controller().proxy(
            request({
                method: "POST",
                originalUrl: "/api/ai-hub/chat/send-message-feedback?userId=someone-else",
                contentType: "application/json",
                body: { sessionId: "session-1", messageId: "message-1" },
            }),
            response,
            user,
        );

        expect(forwardToAiHub).toHaveBeenCalledWith(
            expect.objectContaining({
                targetUrl: new URL("https://ai-hub.test/api/v2/chat/send-message-feedback"),
                apiKey: "sk_secret",
                body: { type: "json", value: { sessionId: "session-1", messageId: "message-1", userId: "user-1" } },
            }),
        );
    });

    it("forwards a request to a proxy mounted at another path", () => {
        controller().proxy(
            {
                method: "GET",
                originalUrl: "/admin-api/v1/ai-hub/chat/history?offset=0",
                baseUrl: "/admin-api",
                route: { path: "/v1/ai-hub/*path" },
            } as unknown as Request,
            response,
            user,
        );

        expect(forwardToAiHub).toHaveBeenCalledWith(
            expect.objectContaining({ targetUrl: new URL("https://ai-hub.test/api/v2/chat/history?offset=0&userId=user-1") }),
        );
    });
});
