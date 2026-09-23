import { EntityManager } from "@mikro-orm/postgresql";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";

import { SkipBuild } from "../builds/skip-build.decorator";
import { RequiredPermission } from "./decorators/required-permission.decorator";
import { ContentScopeWithLabel } from "./dto/content-scope";
import { UserContentScopesInput } from "./dto/user-content-scopes.input";
import { UserContentScopes } from "./entities/user-content-scopes.entity";
import { ContentScope } from "./interfaces/content-scope.interface";
import { UserPermissionsService } from "./user-permissions.service";

@Resolver()
@RequiredPermission(["userPermissions"], { skipScopeCheck: true })
export class UserContentScopesResolver {
    constructor(
        private readonly userService: UserPermissionsService,
        private readonly entityManager: EntityManager,
    ) {}

    @Mutation(() => Boolean)
    @SkipBuild()
    async userPermissionsUpdateContentScopes(
        @Args("userId", { type: () => String }) userId: string,
        @Args("input", { type: () => UserContentScopesInput }) { contentScopes }: UserContentScopesInput,
    ): Promise<boolean> {
        let entity = await this.entityManager.findOne(UserContentScopes, { userId });
        if (entity) {
            entity = this.entityManager.assign(entity, { userId, contentScopes });
        } else {
            entity = this.entityManager.create(UserContentScopes, { userId, contentScopes });
        }
        await this.entityManager.persistAndFlush(entity);
        return true;
    }

    @Query(() => [GraphQLJSONObject])
    async userPermissionsContentScopes(
        @Args("userId", { type: () => String }) userId: string,
        @Args("skipManual", { type: () => Boolean, nullable: true }) skipManual = false,
    ): Promise<ContentScope[]> {
        return this.userService.filterContentScopesForUser({
            user: await this.userService.findUserOrThrow(userId),
            includeContentScopesManual: !skipManual,
        });
    }

    @Query(() => [ContentScopeWithLabel])
    async userPermissionsAvailableContentScopes(): Promise<ContentScopeWithLabel[]> {
        return this.userService.getAvailableContentScopes();
    }
}
