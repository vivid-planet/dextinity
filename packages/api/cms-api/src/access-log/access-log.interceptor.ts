import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor, Optional } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Request } from "express";
import { GraphQLResolveInfo } from "graphql";
import { getClientIp } from "request-ip";

import { CurrentUser } from "../user-permissions/dto/current-user";
import { User } from "../user-permissions/interfaces/user";
import { ACCESS_LOG_CONFIG } from "./access-log.constants";
import { AccessLogConfig } from "./access-log.module";

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

    private pushUserToRequestData(currentUser: CurrentUser, requestData: string[]) {
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
