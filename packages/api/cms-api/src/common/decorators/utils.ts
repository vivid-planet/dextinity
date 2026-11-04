import type { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const getRequestFromExecutionContext = (ctx: ExecutionContext) => {
    if (ctx.getType().toString() === "graphql") {
        return GqlExecutionContext.create(ctx).getContext().req;
    }

    return ctx.switchToHttp().getRequest();
};
