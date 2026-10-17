import { DynamicModule, Global, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { Request } from "express";
import { GraphQLResolveInfo } from "graphql";

import { CurrentUser } from "../user-permissions/dto/current-user";
import { User } from "../user-permissions/interfaces/user";
import { SystemUser } from "../user-permissions/user-permissions.types";
import { ACCESS_LOG_CONFIG } from "./access-log.constants";
import { AccessLogInterceptor } from "./access-log.interceptor";

type ShouldLogRequest = ({ user, req }: { user?: CurrentUser | SystemUser; req: Request }) => boolean;

type AccessLogModuleOptions = AccessLogConfig;
export interface AccessLogConfig {
    shouldLogRequest?: ShouldLogRequest;
    userToLog?: (user: User, impersonatedUser?: User) => string;
    argsToLog?: ({ args, info }: { args: Record<string, unknown>; info: GraphQLResolveInfo }) => Record<string, unknown>;
}

@Global()
@Module({
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: AccessLogInterceptor,
        },
    ],
})
export class AccessLogModule {
    static forRoot(options: AccessLogModuleOptions): DynamicModule {
        return {
            module: AccessLogModule,
            providers: [
                {
                    provide: ACCESS_LOG_CONFIG,
                    useValue: options,
                },
            ],
        };
    }
}
