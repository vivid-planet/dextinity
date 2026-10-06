import { type DynamicModule, Global, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import type { Request } from "express";

import type { CurrentUser } from "../user-permissions/dto/current-user.js";
import type { User } from "../user-permissions/interfaces/user.js";
import type { SystemUser } from "../user-permissions/user-permissions.types.js";
import { ACCESS_LOG_CONFIG } from "./access-log.constants.js";
import { AccessLogInterceptor } from "./access-log.interceptor.js";

type ShouldLogRequest = ({ user, req }: { user?: CurrentUser | SystemUser; req: Request }) => boolean;

type AccessLogModuleOptions = AccessLogConfig;
export interface AccessLogConfig {
    shouldLogRequest?: ShouldLogRequest;
    userToLog?: (user: User, impersonatedUser?: User) => string;
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
