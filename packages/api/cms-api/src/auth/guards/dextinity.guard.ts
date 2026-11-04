import { CanActivate, ExecutionContext, Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { Request } from "express";

import { CurrentUser } from "../../user-permissions/dto/current-user";
import { User } from "../../user-permissions/interfaces/user";
import { UserPermissionsService } from "../../user-permissions/user-permissions.service";
import { SystemUser } from "../../user-permissions/user-permissions.types";
import { DISABLE_DEXTINITY_GUARDS_METADATA_KEY } from "../decorators/disable-dextinity-guards.decorator";
import { AuthServiceInterface, SKIP_AUTH_SERVICE } from "../util/auth-service.interface";

@Injectable()
export class DextinityAuthGuard implements CanActivate {
    protected readonly logger = new Logger(DextinityAuthGuard.name);

    constructor(
        private reflector: Reflector,
        private readonly service: UserPermissionsService,
        @Inject("DEXTINITY_AUTH_SERVICES") private readonly authServices: AuthServiceInterface[],
    ) {}

    private getRequest(context: ExecutionContext): Request & { user: CurrentUser | SystemUser } {
        return context.getType().toString() === "graphql"
            ? GqlExecutionContext.create(context).getContext().req
            : context.switchToHttp().getRequest();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = this.getRequest(context);

        const disableDextinityGuard = this.reflector.getAllAndOverride(DISABLE_DEXTINITY_GUARDS_METADATA_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const hasIncludeInvisibleContentHeader = !!request.headers["x-include-invisible-content"];
        if (disableDextinityGuard && !hasIncludeInvisibleContentHeader) {
            return true;
        }

        if (this.isResolvingGraphQLField(context)) {
            return true;
        }

        const result = await this.getAuthenticatedUserResult(request);
        if (!result) {
            this.logger.debug(`No AuthService could authenticate the user for ${context.getClass().name}::${context.getHandler().name}().`);
            throw new UnauthorizedException("No AuthService could authenticate the user");
        }
        if ("authenticationError" in result) {
            throw new UnauthorizedException(result.authenticationError);
        }

        if ("systemUser" in result) {
            request["user"] = result.systemUser;
        } else {
            let user: User;
            if ("userId" in result) {
                const userId = result.userId;
                const userService = this.service.getUserService();
                if (!userService) {
                    throw new UnauthorizedException(`User authenticated by ID but no user service given: ${userId}`);
                }
                try {
                    if (userService.findUserForLoginOrThrow) {
                        user = await userService.findUserForLoginOrThrow(userId);
                    } else if (userService.getUserForLogin) {
                        user = await userService.getUserForLogin(userId);
                    } else if (userService.findUserOrThrow) {
                        user = await userService.findUserOrThrow(userId);
                    } else if (userService.getUser) {
                        user = await userService.getUser(userId);
                    } else {
                        throw new Error("The userService must implement `findUserOrThrow` (or one of the login-specific variants).");
                    }
                } catch (e) {
                    throw new UnauthorizedException(`Could not get user from UserService: ${userId} - ${(e as Error).message}`);
                }
            } else {
                user = result.user;
            }
            request["user"] = await this.service.createCurrentUser(user, request);
        }

        return true;
    }

    private async getAuthenticatedUserResult(request: Request) {
        for (const authService of this.authServices) {
            const result = await authService.authenticateUser(request);
            if (result && result !== SKIP_AUTH_SERVICE) {
                return result;
            }
        }
    }

    // See https://docs.nestjs.com/graphql/other-features#execute-enhancers-at-the-field-resolver-level
    private isResolvingGraphQLField(context: ExecutionContext): boolean {
        if (context.getType<GqlContextType>() === "graphql") {
            const gqlContext = GqlExecutionContext.create(context);
            const info = gqlContext.getInfo();
            const parentType = info.parentType.name;
            return parentType !== "Query" && parentType !== "Mutation";
        }
        return false;
    }
}
