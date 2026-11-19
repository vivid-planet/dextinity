import { type CallHandler, type ExecutionContext, Inject, Injectable, Logger, type NestInterceptor, Optional } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { Request } from "express";
import type { GraphQLResolveInfo } from "graphql";
import { getClientIp } from "request-ip";

import { getArgsFromExecutionContext, getRequestFromExecutionContext } from "../common/decorators/utils.js";
import { AFFECTED_ENTITY_METADATA_KEY, type AffectedEntityMeta } from "../user-permissions/decorators/affected-entity.decorator.js";
import { AFFECTED_SCOPE_METADATA_KEY, type AffectedScopeMeta } from "../user-permissions/decorators/affected-scope.decorator.js";
import type { CurrentUser } from "../user-permissions/dto/current-user.js";
import type { User } from "../user-permissions/interfaces/user.js";
import { ACCESS_LOG_CONFIG } from "./access-log.constants.js";
import type { AccessLogConfig } from "./access-log.module.js";

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
    protected readonly logger = new Logger(AccessLogInterceptor.name);

    constructor(@Optional() @Inject(ACCESS_LOG_CONFIG) private readonly config?: AccessLogConfig) {}

    intercept(context: ExecutionContext, next: CallHandler) {
        const requestType = context.getType().toString();

        const requestData: string[] = [];
        let ignored = false;

        if (requestType === "graphql") {
            const graphqlExecutionContext = GqlExecutionContext.create(context);
            const graphqlContext = graphqlExecutionContext.getContext();
            const gqlInfo = graphqlExecutionContext.getInfo<GraphQLResolveInfo>();

            if (this.isResolvingGraphQLField(gqlInfo)) {
                return next.handle();
            }

            if (this.config?.shouldLogRequest?.({ user: graphqlContext.req.user, req: graphqlContext.req }) === false) {
                ignored = true;
            }

            const ipAddress = getClientIp(graphqlContext.req);
            requestData.push(`ip: ${ipAddress}`);
            this.pushUserToRequestData(graphqlContext.req.user, requestData);

            const gqlArgs = { ...graphqlExecutionContext.getArgs() };

            if (gqlInfo.operation.operation === "mutation") {
                delete gqlArgs["input"];
                delete gqlArgs["data"];
            }

            requestData.push(`operationType: ${gqlInfo.parentType}`);
            if (gqlInfo.operation.name?.value) {
                requestData.push(`operationName: ${gqlInfo.operation.name.value}`);
            }
            requestData.push(`resolver function: ${gqlInfo.fieldName}`);
            requestData.push(`args: ${JSON.stringify(gqlArgs)}`);
        } else if (requestType === "mcp") {
            const request: (Request & { user?: CurrentUser }) | undefined = getRequestFromExecutionContext(context);

            if (request && this.config?.shouldLogRequest?.({ user: request.user, req: request }) === false) {
                ignored = true;
            }

            if (request) {
                requestData.push(`ip: ${getClientIp(request)}`);
                this.pushUserToRequestData(request.user, requestData);
            }

            const mcpContext = context.getArgByIndex(1);
            requestData.push(`${mcpContext?.kind ?? "call"}: ${mcpContext?.name}`);
            requestData.push(`args: ${JSON.stringify(this.getIdentifyingMcpArgs(context))}`);
        } else {
            const httpContext = context.switchToHttp();
            const httpRequest = httpContext.getRequest<Request>();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const user = (httpRequest as any).user as CurrentUser;

            if (this.config?.shouldLogRequest?.({ user, req: httpRequest }) === false) {
                ignored = true;
            }

            const ipAddress = getClientIp(httpRequest);
            requestData.push(`ip: ${ipAddress}`);
            this.pushUserToRequestData(user, requestData);

            requestData.push(
                ...[`method: ${httpRequest.method}`, `route: ${httpRequest.route.path}`, `params: ${JSON.stringify(httpRequest.params)}`],
            );
        }

        if (!ignored) {
            this.logger.log(`Request type: ${requestType} | ${requestData.join(" | ")}`);
        }

        return next.handle();
    }

    // MCP tool inputs are flat, so unlike GraphQL mutations there's no `input` or `data` argument that holds the content.
    // Only the arguments the permission check identifies the affected entities and scopes by are logged.
    private getIdentifyingMcpArgs(context: ExecutionContext): Record<string, unknown> {
        const args = getArgsFromExecutionContext(context);
        const identifyingArgs: Record<string, unknown> = {};

        const affectedEntities: AffectedEntityMeta[] = Reflect.getMetadata(AFFECTED_ENTITY_METADATA_KEY, context.getHandler()) ?? [];
        for (const { options } of affectedEntities) {
            for (const argName of [options.idArg, options.pageTreeNodeIdArg]) {
                if (argName && args[argName] !== undefined) {
                    identifyingArgs[argName] = args[argName];
                }
            }
        }

        if (args.scope !== undefined) {
            identifyingArgs.scope = args.scope;
        }

        const affectedScope: AffectedScopeMeta | undefined = Reflect.getMetadata(AFFECTED_SCOPE_METADATA_KEY, context.getHandler());
        if (affectedScope) {
            identifyingArgs.affectedScope = affectedScope.argsToScope(args);
        }

        return identifyingArgs;
    }

    private pushUserToRequestData(currentUser: CurrentUser | undefined, requestData: string[]) {
        if (currentUser) {
            const user = currentUser.authenticatedUser ? currentUser.authenticatedUser : currentUser;
            const impersonatedUser = currentUser.authenticatedUser ? currentUser : undefined;
            const userToLog =
                this.config && this.config.userToLog
                    ? this.config.userToLog
                    : (user: User, impersonatedUser?: User) => {
                          let log = `user: ${user.id}`;
                          if (impersonatedUser) {
                              log += ` (impersonating: ${impersonatedUser.id})`;
                          }
                          return log;
                      };
            requestData.push(userToLog(user, impersonatedUser));
        }
    }

    private isResolvingGraphQLField(gqlInfo: GraphQLResolveInfo): boolean {
        const parentType = gqlInfo.parentType.name;
        return parentType !== "Query" && parentType !== "Mutation";
    }
}
