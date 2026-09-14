import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { TypeMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/type-metadata.storage.js";

import { DISABLE_DEXTINITY_GUARDS_METADATA_KEY } from "../../auth/decorators/disable-dextinity-guards.decorator";
import { getRequestFromExecutionContext } from "../../common/decorators/utils";
import { ContentScopeService } from "../content-scope.service";
import { DisablePermissionCheck, REQUIRED_PERMISSION_METADATA_KEY, RequiredPermissionMetadata } from "../decorators/required-permission.decorator";
import { CurrentUser } from "../dto/current-user";
import { ContentScope } from "../interfaces/content-scope.interface";
import { ACCESS_CONTROL_SERVICE, USER_PERMISSIONS_OPTIONS } from "../user-permissions.constants";
import { AccessControlServiceInterface, Permission, SystemUser, UserPermissionsOptions } from "../user-permissions.types";

@Injectable()
export class UserPermissionsGuard implements CanActivate {
    protected readonly logger = new Logger(UserPermissionsGuard.name);

    constructor(
        protected reflector: Reflector,
        private readonly contentScopeService: ContentScopeService,
        @Inject(ACCESS_CONTROL_SERVICE) private readonly accessControlService: AccessControlServiceInterface,
        @Inject(USER_PERMISSIONS_OPTIONS) private readonly options: UserPermissionsOptions,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const location = `${context.getClass().name}::${context.getHandler().name}()`;

        const requiredPermission =
            this.getDecorator<RequiredPermissionMetadata>(context, REQUIRED_PERMISSION_METADATA_KEY) ?? this.getRequiredPermissionFromEntity(context);
        const skipScopeCheck = requiredPermission?.options?.skipScopeCheck ?? false;

        let requiredContentScopes: ContentScope[][] = [];

        // Ignore field resolvers as they have no scopes and would overwrite the scopes of the root query.
        if (!this.isResolvingGraphQLField(context) && !skipScopeCheck) {
            requiredContentScopes = await this.contentScopeService.getScopesForPermissionCheck(context);

            const request = getRequestFromExecutionContext(context);
            request.contentScopes = this.contentScopeService.getUniqueScopes(requiredContentScopes);
        }

        if (this.getDecorator(context, DISABLE_DEXTINITY_GUARDS_METADATA_KEY)) {
            return true;
        }

        const user = this.getUser(context);
        if (!user) {
            this.logger.debug("Could not get authenticated user. Maybe DextinityAuthGuard is missing?");
            return false;
        }

        // System user authenticated via basic auth
        if (typeof user === "string" && this.options.systemUsers?.includes(user)) {
            return true;
        }

        if (!requiredPermission && this.isResolvingGraphQLField(context)) {
            return true;
        }
        if (!requiredPermission) {
            throw new Error(`RequiredPermission decorator is missing in ${location}`);
        }
        const requiredPermissions = requiredPermission.requiredPermission;
        if (requiredPermissions.includes(DisablePermissionCheck)) {
            return true;
        }
        if (requiredPermissions.length === 0) {
            throw new Error(`RequiredPermission decorator has empty permissions in ${location}`);
        }
        if (this.isResolvingGraphQLField(context) || skipScopeCheck) {
            // At least one permission is required
            if (
                requiredPermissions
                    .filter((permission) => permission !== DisablePermissionCheck)
                    .some((permission) => this.accessControlService.isAllowed(user, permission))
            ) {
                return true;
            }
        } else {
            if (requiredContentScopes.length === 0) {
                throw new Error(
                    `Could not get content scope. Either pass a scope-argument or add an @AffectedEntity()/@AffectedScope()-decorator or enable skipScopeCheck in the @RequiredPermission()-decorator of ${location}`,
                );
            }

            // requiredContentScopes is an two level array of scopes
            // The first level has to be checked with AND, the second level with OR
            // The first level consists of submitted scopes and affected entities
            // The only case that there is more than one scope in the second level is when the ScopedEntity returns more scopes
            if (
                requiredPermissions
                    .filter((permission): permission is Permission => permission !== DisablePermissionCheck)
                    .some((permission) =>
                        requiredContentScopes.every((contentScopes) =>
                            contentScopes.some((contentScope) => this.accessControlService.isAllowed(user, permission, contentScope)),
                        ),
                    )
            ) {
                return true;
            }
        }

        this.logger.debug(`User ${(typeof user === "string" ? user : user.id) ?? "unknown"} does not have required permissions for ${location}`);
        return false;
    }

    private getUser(context: ExecutionContext): CurrentUser | SystemUser | undefined {
        const request =
            context.getType().toString() === "graphql" ? GqlExecutionContext.create(context).getContext().req : context.switchToHttp().getRequest();
        return request.user as CurrentUser | SystemUser | undefined;
    }

    private getDecorator<T = object>(context: ExecutionContext, decorator: string): T {
        return this.reflector.getAllAndOverride(decorator, [context.getHandler(), context.getClass()]);
    }

    private getRequiredPermissionFromEntity(context: ExecutionContext): RequiredPermissionMetadata | undefined {
        const resolverClass = context.getClass();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const metadataByTargetCollection = (TypeMetadataStorage as any).metadataByTargetCollection;
        if (!metadataByTargetCollection) {
            return undefined;
        }

        const targetMetadata = metadataByTargetCollection.get(resolverClass);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resolverMetadata = targetMetadata?.resolver as { typeFn?: () => any } | undefined;
        if (!resolverMetadata?.typeFn) {
            return undefined;
        }

        const entityClass = resolverMetadata.typeFn();
        if (!entityClass) {
            return undefined;
        }

        return Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, entityClass) as RequiredPermissionMetadata | undefined;
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
