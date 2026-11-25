import { type EntityName, MikroORM } from "@mikro-orm/postgresql";
import { type CanActivate, type ExecutionContext, Inject, Injectable, Logger, Optional } from "@nestjs/common";
import { ModuleRef, Reflector } from "@nestjs/core";
import { type GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { TypeMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/type-metadata.storage.js";
import { isUUID } from "class-validator";

import { DISABLE_DEXTINITY_GUARDS_METADATA_KEY } from "../../auth/decorators/disable-dextinity-guards.decorator.js";
import { getRequestFromExecutionContext } from "../../common/decorators/utils.js";
import { DextinityValidationException } from "../../common/errors/validation.exception.js";
import { PageTreeService } from "../../page-tree/page-tree.service.js";
import { contentScopesAreEqual } from "../content-scopes-are-equal.js";
import { AFFECTED_ENTITY_METADATA_KEY, type AffectedEntityMeta } from "../decorators/affected-entity.decorator.js";
import { AFFECTED_SCOPE_METADATA_KEY, type AffectedScopeMeta } from "../decorators/affected-scope.decorator.js";
import {
    DisablePermissionCheck,
    REQUIRED_PERMISSION_METADATA_KEY,
    type RequiredPermissionMetadata,
} from "../decorators/required-permission.decorator.js";
import { SCOPED_ENTITY_METADATA_KEY, type ScopedEntityMeta } from "../decorators/scoped-entity.decorator.js";
import type { CurrentUser } from "../dto/current-user.js";
import { getScopesForScopedEntity } from "../get-scopes-for-scoped-entity.js";
import type { ContentScope } from "../interfaces/content-scope.interface.js";
import { ACCESS_CONTROL_SERVICE, USER_PERMISSIONS_OPTIONS } from "../user-permissions.constants.js";
import type { AccessControlServiceInterface, Permission, SystemUser, UserPermissionsOptions } from "../user-permissions.types.js";

@Injectable()
export class UserPermissionsGuard implements CanActivate {
    protected readonly logger = new Logger(UserPermissionsGuard.name);

    constructor(
        protected reflector: Reflector,
        private readonly orm: MikroORM,
        private readonly moduleRef: ModuleRef,
        @Inject(ACCESS_CONTROL_SERVICE) private readonly accessControlService: AccessControlServiceInterface,
        @Inject(USER_PERMISSIONS_OPTIONS) private readonly options: UserPermissionsOptions,
        @Optional() private readonly pageTreeService?: PageTreeService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const location = `${context.getClass().name}::${context.getHandler().name}()`;

        const requiredPermission =
            this.getDecorator<RequiredPermissionMetadata>(context, REQUIRED_PERMISSION_METADATA_KEY) ?? this.getRequiredPermissionFromEntity(context);
        const skipScopeCheck = requiredPermission?.options?.skipScopeCheck ?? false;

        let requiredContentScopes: ContentScope[][] = [];

        // Ignore field resolvers as they have no scopes and would overwrite the scopes of the root query.
        if (!this.isResolvingGraphQLField(context) && !skipScopeCheck) {
            requiredContentScopes = await this.getScopesForPermissionCheck(context);

            const request = getRequestFromExecutionContext(context);
            request.contentScopes = this.getUniqueScopes(requiredContentScopes);
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

    private async getScopesForPermissionCheck(context: ExecutionContext): Promise<ContentScope[][]> {
        const contentScopes: ContentScope[][] = [];
        const args = await this.getArgs(context);
        const location = `${context.getClass().name}::${context.getHandler().name}()`;

        // AffectedEntities
        const affectedEntities = this.reflector.getAllAndOverride<AffectedEntityMeta[]>(AFFECTED_ENTITY_METADATA_KEY, [context.getHandler()]) || [];
        for (const affectedEntity of affectedEntities) {
            contentScopes.push(...(await this.getContentScopesFromEntity(affectedEntity, args, location)));
        }

        // AffectedScope
        const affectedScope = this.reflector.getAllAndOverride<AffectedScopeMeta>(AFFECTED_SCOPE_METADATA_KEY, [context.getHandler()]) || undefined;
        if (affectedScope) {
            const scope = affectedScope.argsToScope(args);
            if (Array.isArray(scope)) {
                contentScopes.push(...scope.map((s) => [s]));
            } else {
                contentScopes.push([scope]);
            }
        }

        // Scope arg
        if (args.scope) {
            contentScopes.push([args.scope as ContentScope]);
        }

        return contentScopes;
    }

    private getUniqueScopes(scopes: ContentScope[][]): ContentScope[] {
        const uniqueScopes: ContentScope[] = [];

        scopes.flat().forEach((incomingScope) => {
            if (!uniqueScopes.some((existingScope) => contentScopesAreEqual(existingScope, incomingScope))) {
                uniqueScopes.push(incomingScope);
            }
        });

        return uniqueScopes;
    }

    private async getContentScopesFromEntity(
        affectedEntity: AffectedEntityMeta,
        args: Record<string, string>,
        location: string,
    ): Promise<ContentScope[][]> {
        const contentScopes: ContentScope[][] = [];
        if (affectedEntity.options.idArg) {
            if (!args[affectedEntity.options.idArg] && !affectedEntity.options.nullable) {
                throw new Error(`${affectedEntity.options.idArg} arg not found`);
            }

            if (args[affectedEntity.options.idArg]) {
                const id = args[affectedEntity.options.idArg];
                const ids = Array.isArray(id) ? id : [id];

                if (ids.length === 0) {
                    throw new Error(
                        `Encountered empty IDs array for argument '${affectedEntity.options.idArg}' of ${location}. Make sure to skip the operation if no IDs are provided.`,
                    );
                }

                const hasUuidPrimaryKey = this.hasUuidPrimaryKey(affectedEntity.entity);
                for (const id of ids) {
                    if (hasUuidPrimaryKey && !isUUID(id)) {
                        throw new DextinityValidationException(`Invalid UUID '${id}' for argument '${affectedEntity.options.idArg}' of ${location}`);
                    }
                    const row = await this.orm.em.findOneOrFail<{ scope?: ContentScope }>(affectedEntity.entity, id, { filters: false }); // disable all default filters, e.g., excludeDeleted
                    if (row.scope) {
                        contentScopes.push([row.scope as ContentScope]);
                    } else {
                        const scoped = this.reflector.getAllAndOverride<ScopedEntityMeta>(SCOPED_ENTITY_METADATA_KEY, [affectedEntity.entity]);
                        if (!scoped) {
                            throw new Error(`Entity ${affectedEntity.entity} is missing @ScopedEntity decorator`);
                        }
                        const scopes = await getScopesForScopedEntity({
                            scoped,
                            entity: affectedEntity.entity,
                            row,
                            entityManager: this.orm.em,
                            moduleRef: this.moduleRef,
                        });
                        if (!scopes) {
                            throw new Error(`@ScopedEntity function for ${affectedEntity.entity} didn't return any scopes`);
                        }
                        contentScopes.push(Array.isArray(scopes) ? scopes : [scopes]);
                    }
                }
            }
        } else if (affectedEntity.options.pageTreeNodeIdArg) {
            if (!args[affectedEntity.options.pageTreeNodeIdArg] && !affectedEntity.options.nullable) {
                throw new Error(`${affectedEntity.options.pageTreeNodeIdArg} arg not found`);
            }

            if (args[affectedEntity.options.pageTreeNodeIdArg]) {
                if (this.pageTreeService === undefined) {
                    throw new Error("pageTreeNodeIdArg was given but no PageTreeModule is registered");
                }
                const pageTreeApi = await this.pageTreeService.createReadApi({ visibility: "all" });
                const id = args[affectedEntity.options.pageTreeNodeIdArg];
                const ids = Array.isArray(id) ? id : [id];
                for (const id of ids) {
                    if (!isUUID(id)) {
                        throw new DextinityValidationException(
                            `Invalid UUID '${id}' for argument '${affectedEntity.options.pageTreeNodeIdArg}' of ${location}`,
                        );
                    }
                    const node = await pageTreeApi.getNode(id);
                    if (!node) {
                        throw new Error("Can't find pageTreeNode");
                    }
                    if (!node.scope) {
                        throw new Error("PageTreeNode doesn't have a scope");
                    }
                    contentScopes.push([node.scope as ContentScope]);
                }
            }
        } else {
            // TODO implement something more flexible that supports something like that: @AffectedEntity(Product, ProductEntityLoader)
            throw new Error("idArg or pageTreeNodeIdArg is required");
        }
        return contentScopes;
    }

    private hasUuidPrimaryKey(entity: EntityName<object>): boolean {
        const primaryProps = this.orm.em.getMetadata().get(entity).getPrimaryProps();
        return primaryProps.length === 1 && (primaryProps[0].type === "uuid" || (primaryProps[0].columnTypes ?? []).includes("uuid"));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async getArgs(context: ExecutionContext): Promise<Record<string, any>> {
        if (context.getType().toString() === "graphql") {
            return GqlExecutionContext.create(context).getArgs();
        } else {
            const request = context.switchToHttp().getRequest();
            return { ...request.params, ...request.query };
        }
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
