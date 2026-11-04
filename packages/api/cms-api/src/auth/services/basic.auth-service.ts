import { Injectable } from "@nestjs/common";
import { Request } from "express";

import { AuthenticateUserResult, AuthServiceInterface, SKIP_AUTH_SERVICE } from "../util/auth-service.interface";

interface BasicAuthServiceConfig {
    username: string;
    password: string;
}

export function createBasicAuthService({ username: requiredUsername, password: requiredPassword }: BasicAuthServiceConfig) {
    if (requiredUsername === "") {
        throw new Error(`username for BasicAuthService must not be empty`);
    }
    if (requiredPassword === "") {
        throw new Error(`password for BasicAuthService (username "${requiredUsername}") must not be empty`);
    }

    @Injectable()
    class BasicAuthService implements AuthServiceInterface {
        authenticateUser(request: Request): AuthenticateUserResult {
            const [type, token] = request.header("authorization")?.split(" ") ?? [];
            if (type !== "Basic") {
                return SKIP_AUTH_SERVICE;
            }

            const [username, password] = Buffer.from(token, "base64").toString("ascii").split(":");
            if (username !== requiredUsername) {
                return SKIP_AUTH_SERVICE;
            }

            if (password !== requiredPassword) {
                return { authenticationError: `Wrong password for Basic Auth user "${username}".` };
            }

            return { systemUser: username };
        }
    }
    return BasicAuthService;
}
