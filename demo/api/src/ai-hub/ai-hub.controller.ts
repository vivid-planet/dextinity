import { CurrentUser, GetCurrentUser, RequiredPermission } from "@dextinity/cms-api";
import { All, BadRequestException, Controller, Inject, Logger, NotFoundException, Req, Res, UnsupportedMediaTypeException } from "@nestjs/common";
import type { Request, Response } from "express";

import { AI_HUB_CONFIG, type AiHubConfig } from "./ai-hub.config.js";
import {
    type AiHubRequestBody,
    type AiHubRoute,
    findAiHubRoute,
    forwardToAiHub,
    toAiHubJsonBody,
    toAiHubQuery,
    toChatRequest,
} from "./ai-hub-proxy.js";

/**
 * The server side of the AI Hub chat in the admin's AI Mode: the chat sends its requests here (`api-url`), and
 * they reach the AI Hub API with the secret key, which never leaves the server, and with the ID of the user the
 * request was authenticated as.
 */
@Controller("ai-hub")
// The AI Mode works on pages. No scope check, because the chat's requests carry none.
@RequiredPermission("pageTree", { skipScopeCheck: true })
export class AiHubController {
    private readonly logger = new Logger(AiHubController.name);

    constructor(@Inject(AI_HUB_CONFIG) private readonly config: AiHubConfig) {}

    @All("*path")
    proxy(@Req() request: Request, @Res() response: Response, @GetCurrentUser() user: CurrentUser): void {
        const { apiUrl, apiKey } = this.config;

        const chatRequest = toChatRequest(request.originalUrl);
        const route = findAiHubRoute(request.method, chatRequest.path);
        if (!route) {
            // A new release of the chat's web component may make a request the route table doesn't list yet.
            this.logger.warn(`The AI Hub chat requested ${request.method} ${chatRequest.path}, which no route forwards.`);
            throw new NotFoundException(`The AI Hub chat has no ${request.method} ${chatRequest.path}.`);
        }

        const targetUrl = new URL(`${route.targetPathPrefix}${chatRequest.path}`, apiUrl);
        targetUrl.search = toAiHubQuery({ route, query: chatRequest.query, userId: user.id }).toString();

        forwardToAiHub({ request, response, targetUrl, apiKey, body: toAiHubRequestBody({ request, route, userId: user.id }), logger: this.logger });
    }
}

function toAiHubRequestBody({ request, route, userId }: { request: Request; route: AiHubRoute; userId: string }): AiHubRequestBody {
    if (route.body === "none") {
        return { type: "none" };
    }
    if (route.body === "multipart") {
        if (!request.is("multipart/form-data")) {
            throw new UnsupportedMediaTypeException("The AI Hub chat sends multipart form data here.");
        }
        return { type: "multipart" };
    }
    if (!request.is("application/json")) {
        throw new UnsupportedMediaTypeException("The AI Hub chat sends JSON here.");
    }
    if (!isJsonObject(request.body)) {
        throw new BadRequestException("The AI Hub chat sends a JSON object here.");
    }
    return { type: "json", value: toAiHubJsonBody({ route, body: request.body, userId }) };
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
