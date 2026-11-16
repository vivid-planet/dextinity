import type { CurrentUser } from "@dextinity/cms-api";
import type { Request } from "express";
import { z } from "zod";

/** The HTTP request of a tool call, after the global `DextinityAuthGuard` has authenticated it. */
export type McpRequest = Request & { user?: CurrentUser | string };

/**
 * What every tool answers with: text blocks, marked `isError` when they carry the reason a call failed
 * instead of data.
 */
export interface ToolResult {
    content: { type: "text"; text: string }[];
    isError?: true;
}

export function jsonResult(data: unknown): ToolResult {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

/**
 * The failure a tool explains to the agent in plain words: a scope the user may not read, an unknown id.
 *
 * It is thrown so that a failed check cannot be skipped, and `ToolErrorInterceptor` answers the call with
 * its message as the tool's own result. Every other exception reaches the caller as "Internal server error".
 */
export class ToolError extends Error {}

const domainSchema = z.string().describe('Domain, e.g. "main"');

export const pageTreeScopeSchema = z
    .strictObject({
        domain: domainSchema,
        language: z.string().describe('Language, e.g. "en"'),
    })
    .describe("Content scope of the page tree");

export const damScopeSchema = z.strictObject({ domain: domainSchema }).describe("Scope of the DAM");

/**
 * The user the `/mcp` controller authenticated. The tools are handlers of the strategy's own RPC pipeline, where
 * none of the app's global guards run (`connectMicroservice()` without `inheritAppConfig` gives it an
 * `ApplicationConfig` of its own, see main.ts) — the permission checks of a resolver therefore happen in the
 * tools themselves, against this user. A system user authenticated by basic auth is refused: the tools serve the
 * AI Mode of the admin, which a person uses.
 */
export function getUser(request: McpRequest | undefined): CurrentUser {
    const user = request?.user;
    if (!user || typeof user === "string") {
        throw new ToolError("The MCP server answers only a user signed in to the admin.");
    }
    return user;
}
