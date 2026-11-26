import type { CurrentUser } from "@dextinity/cms-api";
import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { McpExecutionContext } from "@nestjs/mcp";
import type { Request } from "express";

/** The HTTP request of a tool call, after the global `DextinityAuthGuard` has authenticated it. */
type McpRequest = Request & { user?: CurrentUser | string };

/**
 * Refuses a system user authenticated by basic auth, whom `UserPermissionsGuard` lets through: the tools serve the AI
 * Mode of the admin, which a person uses.
 */
@Injectable()
export class SignedInUserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const user = McpExecutionContext.create(context).getRequest<McpRequest>()?.user;
        if (typeof user !== "object") {
            throw new UnauthorizedException("The MCP server answers only a user signed in to the admin.");
        }
        return true;
    }
}
