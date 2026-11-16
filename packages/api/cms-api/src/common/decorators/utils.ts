import type { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

// The arguments of an `@nestjs/mcp` call are `[input, mcpContext]` (see `McpExecutionContext`). They're read by index so
// that apps without an MCP server don't need to install `@nestjs/mcp`.
const isMcpContext = (ctx: ExecutionContext) => ctx.getType().toString() === "mcp";

export const getRequestFromExecutionContext = (ctx: ExecutionContext) => {
    if (ctx.getType().toString() === "graphql") {
        return GqlExecutionContext.create(ctx).getContext().req;
    }

    if (isMcpContext(ctx)) {
        // Undefined over stdio
        return ctx.getArgByIndex(1)?.request;
    }

    return ctx.switchToHttp().getRequest();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getArgsFromExecutionContext = (ctx: ExecutionContext): Record<string, any> => {
    if (ctx.getType().toString() === "graphql") {
        return GqlExecutionContext.create(ctx).getArgs();
    }

    if (isMcpContext(ctx)) {
        return ctx.getArgByIndex(0) ?? {};
    }

    const request = ctx.switchToHttp().getRequest();
    return { ...request.params, ...request.query };
};
