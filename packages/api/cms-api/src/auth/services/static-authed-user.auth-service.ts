import { Injectable } from "@nestjs/common";

import type { User } from "../../user-permissions/interfaces/user.js";
import type { AuthenticateUserResult, AuthServiceInterface } from "../util/auth-service.interface.js";

interface StaticUserAuthServiceConfig {
    staticUser: User | string;
}

export function createStaticUserAuthService(config: StaticUserAuthServiceConfig) {
    @Injectable()
    class StaticUserAuthService implements AuthServiceInterface {
        authenticateUser(): AuthenticateUserResult {
            if (typeof config.staticUser === "string") {
                return { userId: config.staticUser };
            }
            return { user: config.staticUser };
        }
    }
    return StaticUserAuthService;
}
