import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { Writable } from "node:stream";

import { afterEach, describe, expect, it, vi } from "vitest";

import { type AiHubRoute, findAiHubRoute, forwardToAiHub, toAiHubJsonBody, toAiHubQuery, toChatCacheControl, toChatRequest } from "./ai-hub-proxy.js";

describe("findAiHubRoute", () => {
    it.each([
        ["GET", "/chat/initial-data", "/api/v2"],
        ["POST", "/chat", "/api/v2"],
        ["GET", "/chat/history", "/api/v2"],
        ["GET", "/chat/conversation", "/api/v2"],
        ["PATCH", "/chat/conversation", "/api/v2"],
        ["DELETE", "/chat/conversation", "/api/v2"],
        ["DELETE", "/chat/conversation/bulk", "/api/v2"],
        ["POST", "/chat/stop", "/api/v2"],
        ["POST", "/chat/send-message-feedback", "/api/v2"],
        ["POST", "/file-uploads/upload", "/api/v2"],
        ["POST", "/speech/transcribe", "/api/v2"],
        ["POST", "/speech/synthesize-stream", "/api/v2"],
        ["GET", "/file-uploads/0198c3a2-6b1f-7c3e-9a4d-2f1e8b7c6d5a", "/api"],
    ])("forwards %s %s to %s", (method, path, targetPathPrefix) => {
        expect(findAiHubRoute(method, path)?.targetPathPrefix).toBe(targetPathPrefix);
    });

    it.each([
        ["POST", "/chat/send-message-feedback/"],
        ["POST", "/chat/Send-Message-Feedback"],
        ["GET", "/chat"],
        ["POST", "/chat/history"],
        ["POST", "/chat/internal"],
        ["GET", "/api/v2/chat/history"],
        ["GET", "/file-uploads"],
        ["GET", "/admin"],
    ])("refuses %s %s, which the chat doesn't request", (method, path) => {
        expect(findAiHubRoute(method, path)).toBeUndefined();
    });
});

describe("toChatRequest", () => {
    it("reads the path below the proxy and the query", () => {
        const chatRequest = toChatRequest("/api/ai-hub/chat/history?offset=0&limit=50");

        expect(chatRequest.path).toBe("/chat/history");
        expect(chatRequest.query.toString()).toBe("offset=0&limit=50");
    });

    it("keeps an encoded slash encoded, so that it doesn't separate path segments", () => {
        expect(toChatRequest("/api/ai-hub/file-uploads/..%2F..%2Fadmin").path).toBe("/file-uploads/..%2F..%2Fadmin");
    });
});

const route = (userId: AiHubRoute["userId"]): AiHubRoute => ({
    method: "POST",
    path: "/chat",
    targetPathPrefix: "/api/v2",
    body: "json",
    query: ["limit", "conversationId", "widgetId"],
    userId,
});

describe("toAiHubQuery", () => {
    it("replaces the user ID the chat sent, where the AI Hub reads it in the query", () => {
        expect(
            toAiHubQuery({ route: route("query"), query: new URLSearchParams({ userId: "someone-else", limit: "10" }), userId: "user-1" }).toString(),
        ).toBe("limit=10&userId=user-1");
    });

    it("adds one where the chat sent none", () => {
        expect(toAiHubQuery({ route: route("query"), query: new URLSearchParams({ conversationId: "c-1" }), userId: "user-1" }).toString()).toBe(
            "conversationId=c-1&userId=user-1",
        );
    });

    it.each(["body", "none"] as const)("removes one where the AI Hub reads it from the %s", (userIdLocation) => {
        expect(
            toAiHubQuery({
                route: route(userIdLocation),
                query: new URLSearchParams({ userId: "someone-else", widgetId: "w-1" }),
                userId: "user-1",
            }).toString(),
        ).toBe("widgetId=w-1");
    });

    it("forwards only the query parameters the chat sends, so that no other form of a user ID reaches the AI Hub", () => {
        const historyRoute = findAiHubRoute("GET", "/chat/history") as AiHubRoute;

        expect(
            toAiHubQuery({
                route: historyRoute,
                query: new URLSearchParams("userId[0]=someone-else&userId[]=someone-else&offset=0&limit=50"),
                userId: "user-1",
            }).toString(),
        ).toBe("offset=0&limit=50&userId=user-1");
    });
});

describe("toAiHubJsonBody", () => {
    it("replaces the user ID the chat sent, where the AI Hub reads it in the body", () => {
        expect(toAiHubJsonBody({ route: route("body"), body: { sessionId: "session-1", userId: "someone-else" }, userId: "user-1" })).toEqual({
            sessionId: "session-1",
            userId: "user-1",
        });
    });

    it("adds one where the chat sent none, as to message feedback, whose owner the AI Hub checks only when it gets one", () => {
        expect(toAiHubJsonBody({ route: route("body"), body: { sessionId: "session-1", messageId: "message-1" }, userId: "user-1" })).toEqual({
            sessionId: "session-1",
            messageId: "message-1",
            userId: "user-1",
        });
    });

    it.each(["query", "none"] as const)("removes one where the AI Hub reads it from the %s", (userIdLocation) => {
        expect(toAiHubJsonBody({ route: route(userIdLocation), body: { title: "Renamed", userId: "someone-else" }, userId: "user-1" })).toEqual({
            title: "Renamed",
        });
    });
});

describe("toChatCacheControl", () => {
    it("keeps an answer without the AI Hub's own Cache-Control out of every cache", () => {
        expect(toChatCacheControl(undefined)).toBe("no-store, no-transform");
    });

    it("keeps the AI Hub's own Cache-Control", () => {
        expect(toChatCacheControl("private, max-age=3600")).toBe("private, max-age=3600, no-transform");
    });
});

describe("forwardToAiHub", () => {
    type ReceivedRequest = { method?: string; url?: string; headers: IncomingMessage["headers"]; body: string };

    const servers: Server[] = [];
    const logger = { warn: vi.fn() };

    afterEach(() => {
        for (const server of servers.splice(0)) {
            server.close();
        }
    });

    async function listen(handler: (request: IncomingMessage, response: ServerResponse) => void): Promise<URL> {
        const server = createServer(handler);
        servers.push(server);
        await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
        return new URL(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
    }

    async function readBody(request: IncomingMessage): Promise<string> {
        const chunks: Buffer[] = [];
        for await (const chunk of request) {
            chunks.push(chunk as Buffer);
        }
        return Buffer.concat(chunks).toString();
    }

    /** An AI Hub that records what it receives and streams its answer in two chunks. */
    async function startAiHub(): Promise<{ url: URL; received: ReceivedRequest[] }> {
        const received: ReceivedRequest[] = [];
        const url = await listen(async (request, response) => {
            received.push({ method: request.method, url: request.url, headers: request.headers, body: await readBody(request) });
            response.writeHead(200, { "content-type": "text/event-stream", "x-internal": "secret" });
            response.write("data: first\n\n");
            setTimeout(() => response.end("data: second\n\n"), 10);
        });
        return { url, received };
    }

    it("forwards a JSON request with the secret key and the verified body, without the session's credentials", async () => {
        const aiHub = await startAiHub();
        const proxyUrl = await listen(async (request, response) => {
            const body = JSON.parse(await readBody(request)) as Record<string, unknown>;
            forwardToAiHub({
                request,
                response,
                targetUrl: new URL("/api/v2/chat", aiHub.url),
                apiKey: "sk_secret",
                body: { type: "json", value: { ...body, userId: "user-1" } },
                logger,
            });
        });

        const response = await fetch(new URL("/api/ai-hub/chat", proxyUrl), {
            method: "POST",
            headers: { "content-type": "application/json", cookie: "session=abc", authorization: "Bearer token" },
            body: JSON.stringify({ sessionId: "session-1", userId: "someone-else" }),
        });

        expect(response.status).toBe(200);
        expect(await response.text()).toBe("data: first\n\ndata: second\n\n");
        expect(response.headers.get("content-type")).toBe("text/event-stream");
        expect(response.headers.get("cache-control")).toBe("no-store, no-transform");
        expect(response.headers.get("x-internal")).toBeNull();

        const [received] = aiHub.received;
        expect(received.method).toBe("POST");
        expect(received.url).toBe("/api/v2/chat");
        expect(received.headers["x-api-key"]).toBe("sk_secret");
        expect(received.headers.cookie).toBeUndefined();
        expect(received.headers.authorization).toBeUndefined();
        expect(JSON.parse(received.body)).toEqual({ sessionId: "session-1", userId: "user-1" });
    });

    it("pipes an upload through unchanged", async () => {
        const aiHub = await startAiHub();
        const proxyUrl = await listen((request, response) => {
            forwardToAiHub({
                request,
                response,
                targetUrl: new URL("/api/v2/file-uploads/upload", aiHub.url),
                apiKey: "sk_secret",
                body: { type: "multipart" },
                logger,
            });
        });
        const form = new FormData();
        form.append("file", new Blob(["file content"], { type: "text/plain" }), "notes.txt");

        await (await fetch(new URL("/api/ai-hub/file-uploads/upload", proxyUrl), { method: "POST", body: form })).text();

        const [received] = aiHub.received;
        expect(received.headers["content-type"]).toMatch(/^multipart\/form-data; boundary=/);
        expect(received.body).toContain('filename="notes.txt"');
        expect(received.body).toContain("file content");
    });

    it("sends no body for a route without one, whatever the chat sent", async () => {
        const aiHub = await startAiHub();
        const proxyUrl = await listen((request, response) => {
            forwardToAiHub({
                request,
                response,
                targetUrl: new URL("/api/v2/chat/conversation?conversationId=c-1&userId=user-1", aiHub.url),
                apiKey: "sk_secret",
                body: { type: "none" },
                logger,
            });
        });

        await (
            await fetch(new URL("/api/ai-hub/chat/conversation", proxyUrl), {
                method: "DELETE",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ userId: "someone-else" }),
            })
        ).text();

        const [received] = aiHub.received;
        expect(received.method).toBe("DELETE");
        expect(received.body).toBe("");
        expect(received.headers["content-type"]).toBeUndefined();
    });

    it("passes on the request ID of a synthesized speech, which the chat sends back with the next one", async () => {
        const aiHubUrl = await listen((request, response) => {
            response.writeHead(200, { "content-type": "audio/mpeg", "x-tts-request-id": "speech-1" });
            response.end("audio");
        });
        const proxyUrl = await listen((request, response) => {
            forwardToAiHub({
                request,
                response,
                targetUrl: new URL("/api/v2/speech/synthesize-stream", aiHubUrl),
                apiKey: "sk_secret",
                body: { type: "json", value: { text: "Hello" } },
                logger,
            });
        });

        const response = await fetch(new URL("/api/ai-hub/speech/synthesize-stream", proxyUrl), { method: "POST" });

        expect(response.headers.get("x-tts-request-id")).toBe("speech-1");
    });

    it("ends the answer when the AI Hub drops the connection in the middle of it", { timeout: 2000 }, async () => {
        const aiHubUrl = await listen((request, response) => {
            response.writeHead(200, { "content-type": "text/event-stream" });
            response.write("data: first\n\n", () => request.socket.destroy());
        });
        const proxyUrl = await listen((request, response) => {
            forwardToAiHub({ request, response, targetUrl: new URL("/api/v2/chat", aiHubUrl), apiKey: "sk_secret", body: { type: "none" }, logger });
        });

        const response = await fetch(new URL("/api/ai-hub/chat", proxyUrl));

        await expect(response.text()).rejects.toThrow();
        // `pipeline` calls back after it has closed the chat's response, so the warning can come after the client's error.
        await vi.waitFor(() => {
            expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining(`The answer of the AI Hub at ${aiHubUrl.host} broke off`));
        });
    });

    it("drops the AI Hub's answer when the chat went away before it arrived", async () => {
        let resolveAnswerClosed: () => void;
        const answerClosed = new Promise<void>((resolve) => {
            resolveAnswerClosed = resolve;
        });
        const aiHubUrl = await listen((request, response) => {
            response.on("close", () => resolveAnswerClosed());
            response.writeHead(200, { "content-type": "text/event-stream" });
            response.write("data: first\n\n");
        });
        // A response destroyed by the chat going away emits `close` only later, so the AI Hub's answer can arrive in between.
        const response = Object.assign(new Writable({ emitClose: false, write: (_chunk, _encoding, callback) => callback() }), {
            statusCode: 200,
            setHeader: () => undefined,
        });
        response.destroy();

        forwardToAiHub({
            request: { method: "GET", headers: {} } as IncomingMessage,
            response: response as unknown as ServerResponse,
            targetUrl: new URL("/api/v2/chat/history", aiHubUrl),
            apiKey: "sk_secret",
            body: { type: "none" },
            logger,
        });

        await answerClosed;
    });

    it("answers with 502 when the AI Hub cannot be reached", async () => {
        const proxyUrl = await listen((request, response) => {
            forwardToAiHub({
                request,
                response,
                targetUrl: new URL("http://127.0.0.1:1/api/v2/chat/history"),
                apiKey: "sk_secret",
                body: { type: "none" },
                logger,
            });
        });

        const response = await fetch(new URL("/api/ai-hub/chat/history", proxyUrl));

        expect(response.status).toBe(502);
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("The AI Hub at 127.0.0.1:1 can't be reached"));
        expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining("sk_secret"));
    });

    it("answers with 502 when the AI Hub stays silent", async () => {
        const aiHubUrl = await listen(() => {
            // Never answers.
        });
        const proxyUrl = await listen((request, response) => {
            forwardToAiHub({
                request,
                response,
                targetUrl: new URL("/api/v2/chat/history", aiHubUrl),
                apiKey: "sk_secret",
                body: { type: "none" },
                logger,
                idleTimeoutMs: 50,
            });
        });

        const response = await fetch(new URL("/api/ai-hub/chat/history", proxyUrl));

        expect(response.status).toBe(502);
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("No data for 50 ms"));
    });
});
