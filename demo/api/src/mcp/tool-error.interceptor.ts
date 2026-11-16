import { type CallHandler, type ExecutionContext, Injectable, Logger, type NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { MCP_TOOL_METADATA_KEY, type McpContext, type ToolOptions } from "@rekog/mcp-nest";
import { catchError, type Observable, of, throwError } from "rxjs";

import { type McpRequest, ToolError, type ToolResult } from "./mcp-tool.utils.js";

// Turns the `ToolError` a tool throws into that tool's own result, so a refusal reaches the agent with its
// reason instead of being masked as "Internal server error", and is logged at warn instead of the error level
// the MCP layer logs every escaping exception at. It is registered per tool controller
// and not as an `APP_INTERCEPTOR`, which never reaches the strategy's own RPC pipeline (see mcp-tool.utils.ts).
@Injectable()
export class ToolErrorInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ToolErrorInterceptor.name);

    constructor(private readonly reflector: Reflector) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(
            catchError((error: unknown) => {
                if (!(error instanceof ToolError)) {
                    return throwError(() => error);
                }

                const tool = this.reflector.get<ToolOptions>(MCP_TOOL_METADATA_KEY, context.getHandler())?.name ?? "unknown";
                const user = context.switchToRpc().getContext<McpContext>()?.getRawRequest<McpRequest>()?.user;
                const userId = typeof user === "string" ? user : (user?.id ?? "unknown");
                this.logger.warn(`Tool "${tool}" refused a call by user ${userId}: ${error.message}`);

                return of({ content: [{ type: "text", text: error.message }], isError: true } satisfies ToolResult);
            }),
        );
    }
}
