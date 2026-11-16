import { type IncomingMessage, request as httpRequest, type ServerResponse } from "node:http";
import { request as httpsRequest } from "node:https";
import { pipeline } from "node:stream";

import type { Logger } from "@nestjs/common";

export type AiHubRoute = {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    /** The path below the proxy, as the chat requests it. */
    path: string | RegExp;
    /** The prefix of the path in the AI Hub API, which the chat leaves out. */
    targetPathPrefix: "/api/v2" | "/api";
    body: "none" | "json" | "multipart";
    /** The query parameters the chat sends, other than the user ID. Any other one is left out. */
    query: string[];
    /** Where the AI Hub reads the ID of the user who owns the conversations. */
    userId: "query" | "body" | "none";
};

// The requests the AI Hub chat makes, taken from the bundle of its web component. Anything else is refused, so a new
// request of the chat reaches the AI Hub only once it is listed here, together with its query parameters and where the
// AI Hub reads its user ID.
const aiHubRoutes: AiHubRoute[] = [
    { method: "GET", path: "/chat/initial-data", targetPathPrefix: "/api/v2", body: "none", query: ["versionId", "widgetId"], userId: "none" },
    { method: "POST", path: "/chat", targetPathPrefix: "/api/v2", body: "json", query: [], userId: "body" },
    { method: "GET", path: "/chat/history", targetPathPrefix: "/api/v2", body: "none", query: ["offset", "limit"], userId: "query" },
    { method: "GET", path: "/chat/conversation", targetPathPrefix: "/api/v2", body: "none", query: ["conversationId"], userId: "query" },
    { method: "PATCH", path: "/chat/conversation", targetPathPrefix: "/api/v2", body: "json", query: ["conversationId"], userId: "query" },
    { method: "DELETE", path: "/chat/conversation", targetPathPrefix: "/api/v2", body: "none", query: ["conversationId"], userId: "query" },
    { method: "DELETE", path: "/chat/conversation/bulk", targetPathPrefix: "/api/v2", body: "json", query: [], userId: "body" },
    { method: "POST", path: "/chat/stop", targetPathPrefix: "/api/v2", body: "json", query: [], userId: "body" },
    { method: "POST", path: "/chat/send-message-feedback", targetPathPrefix: "/api/v2", body: "json", query: [], userId: "body" },
    { method: "POST", path: "/file-uploads/upload", targetPathPrefix: "/api/v2", body: "multipart", query: [], userId: "none" },
    { method: "POST", path: "/speech/transcribe", targetPathPrefix: "/api/v2", body: "multipart", query: [], userId: "none" },
    { method: "POST", path: "/speech/synthesize-stream", targetPathPrefix: "/api/v2", body: "json", query: [], userId: "none" },
    // A download link is one the AI Hub puts in its answer, so the form of the path below "/file-uploads" is its own.
    { method: "GET", path: /^\/file-uploads(?:\/[\w.-]+)+$/, targetPathPrefix: "/api", body: "none", query: [], userId: "none" },
];

export function findAiHubRoute(method: string, path: string): AiHubRoute | undefined {
    return aiHubRoutes.find((route) => route.method === method && (typeof route.path === "string" ? route.path === path : route.path.test(path)));
}

/**
 * The path below the proxy and the query of a request of the chat. They are read from the URL as it was requested
 * rather than from the route parameter, which is decoded: an encoded "/" would separate path segments there.
 */
export function toChatRequest(originalUrl: string): { path: string; query: URLSearchParams } {
    const url = new URL(originalUrl, "http://localhost");
    return { path: url.pathname.replace(/^\/api\/ai-hub/, ""), query: url.searchParams };
}

/**
 * The query for the AI Hub. The chat sends the user ID it was given, which is only a hint: the AI Hub keeps the
 * conversations per user ID, so it gets the ID of the user the request was authenticated as, and only where it reads it.
 */
export function toAiHubQuery({ route, query, userId }: { route: AiHubRoute; query: URLSearchParams; userId: string }): URLSearchParams {
    // Only the listed parameters: depending on how the AI Hub parses its query, a variant such as `userId[0]` could
    // reach it as a user ID too.
    const aiHubQuery = new URLSearchParams([...query].filter(([name]) => route.query.includes(name)));
    if (route.userId === "query") {
        aiHubQuery.set("userId", userId);
    }
    return aiHubQuery;
}

/** The JSON body for the AI Hub, with the user ID as in `toAiHubQuery`. */
export function toAiHubJsonBody({
    route,
    body,
    userId,
}: {
    route: AiHubRoute;
    body: Record<string, unknown>;
    userId: string;
}): Record<string, unknown> {
    const aiHubBody = { ...body };
    delete aiHubBody.userId;
    if (route.userId === "body") {
        aiHubBody.userId = userId;
    }
    return aiHubBody;
}

/** The body of a request to the AI Hub: none, the JSON the app's body parser has already read, or the unread multipart. */
export type AiHubRequestBody = { type: "none" } | { type: "json"; value: Record<string, unknown> } | { type: "multipart" };

// The headers of the chat's request that the AI Hub needs. The cookies and the Authorization header of the admin
// session stay here.
const forwardedRequestHeaders = ["accept", "accept-language"];

// The headers of the AI Hub's response the chat needs, for a streamed answer as much as for a downloaded file. The chat
// sends the request IDs of the last synthesized speeches with the next one.
const forwardedResponseHeaders = [
    "content-type",
    "content-length",
    "content-disposition",
    "cache-control",
    "last-modified",
    "etag",
    "x-tts-request-id",
];

// How long the connection to the AI Hub may stay silent. It limits the time without data, not the whole answer, so a
// long streamed answer isn't cut off.
const defaultIdleTimeoutMs = 120_000;

/**
 * Forwards a request of the chat to the AI Hub API with the secret key and streams the answer back unchanged.
 *
 * `node:http(s)` rather than `fetch`: undici aborts the process when a response is read slower than it arrives
 * and the server closes the connection, which a streamed chat answer to a slow client does.
 *
 * A JSON body has already been read by the app's body parser, so it is serialized again. A multipart body — a file or
 * a recording — is still unread and is piped through.
 */
export function forwardToAiHub({
    request,
    response,
    targetUrl,
    apiKey,
    body,
    logger,
    idleTimeoutMs = defaultIdleTimeoutMs,
}: {
    request: IncomingMessage;
    response: ServerResponse;
    targetUrl: URL;
    apiKey: string;
    body: AiHubRequestBody;
    logger: Pick<Logger, "warn">;
    idleTimeoutMs?: number;
}): void {
    const headers: Record<string, string> = { "x-api-key": apiKey };
    const copyRequestHeaders = (names: string[]) => {
        for (const name of names) {
            const value = request.headers[name];
            if (typeof value === "string") {
                headers[name] = value;
            }
        }
    };
    copyRequestHeaders(forwardedRequestHeaders);

    let serializedBody: string | undefined;
    if (body.type === "json") {
        serializedBody = JSON.stringify(body.value);
        headers["content-type"] = "application/json";
        headers["content-length"] = String(Buffer.byteLength(serializedBody));
    } else if (body.type === "multipart") {
        copyRequestHeaders(["content-type", "content-length", "transfer-encoding"]);
    }

    let hasUpstreamResponse = false;
    const send = targetUrl.protocol === "https:" ? httpsRequest : httpRequest;
    const upstreamRequest = send(targetUrl, { method: request.method, headers, timeout: idleTimeoutMs }, (upstreamResponse) => {
        hasUpstreamResponse = true;
        response.statusCode = upstreamResponse.statusCode ?? 502;
        for (const name of forwardedResponseHeaders) {
            const value = upstreamResponse.headers[name];
            if (value !== undefined) {
                response.setHeader(name, value);
            }
        }
        response.setHeader("cache-control", toChatCacheControl(upstreamResponse.headers["cache-control"]));
        // Unlike `pipe`, `pipeline` also ends the chat's response when the AI Hub's breaks off, rather than leaving
        // the chat waiting for the rest.
        pipeline(upstreamResponse, response, (error) => {
            // A premature close is the chat going away, which isn't the AI Hub's failure.
            if (error && (error as NodeJS.ErrnoException).code !== "ERR_STREAM_PREMATURE_CLOSE") {
                logger.warn(`The answer of the AI Hub at ${targetUrl.host} broke off: ${error.message}`);
            }
        });
    });

    upstreamRequest.on("timeout", () => {
        upstreamRequest.destroy(new Error(`No data for ${idleTimeoutMs} ms`));
    });
    let isResponseClosed = false;
    upstreamRequest.on("error", (error) => {
        // Once the AI Hub has answered, the pipeline ends the chat's response and logs the error. A closed response
        // is the chat going away, which destroyed the request.
        if (hasUpstreamResponse || isResponseClosed) {
            return;
        }
        logger.warn(`The AI Hub at ${targetUrl.host} can't be reached: ${error.message}`);
        response.statusCode = 502;
        response.end();
    });
    // The user closed the chat or left the page: stop the AI Hub's work on an answer nobody reads.
    response.on("close", () => {
        isResponseClosed = true;
        upstreamRequest.destroy();
    });

    if (body.type === "multipart") {
        request.pipe(upstreamRequest);
    } else {
        upstreamRequest.end(serializedBody);
    }
}

/**
 * The `Cache-Control` of an answer to the chat. Without one of the AI Hub's, the answer isn't stored: it can be a
 * user's chat history. `no-transform` keeps the app's compression middleware from holding back a streamed answer
 * until enough of it is buffered.
 */
export function toChatCacheControl(aiHubCacheControl = "no-store"): string {
    return `${aiHubCacheControl}, no-transform`;
}
