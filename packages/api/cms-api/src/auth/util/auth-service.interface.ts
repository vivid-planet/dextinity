import type { Request } from "express";

import type { User } from "../../user-permissions/interfaces/user.js";

export const SKIP_AUTH_SERVICE = "skip-auth-service" as const;

export type AuthenticateUserResult =
    | { systemUser: string }
    | { userId: string }
    | { authenticationError: string }
    | { user: User }
    | typeof SKIP_AUTH_SERVICE;

export type AuthServiceInterface = {
    authenticateUser: (request: Request) => Promise<AuthenticateUserResult> | AuthenticateUserResult;
};
