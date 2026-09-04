import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Args, ArgsType, Field, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { IsString } from "class-validator";

import { SkipBuild } from "../builds/skip-build.decorator";
import { RequiredPermission } from "./decorators/required-permission.decorator";
import { UserPermissionInput, UserPermissionOverrideContentScopesInput } from "./dto/user-permission.input";
import { UserPermission, UserPermissionSource } from "./entities/user-permission.entity";
import { UserPermissionsService } from "./user-permissions.service";

@ArgsType()
class UserPermissionListArgs {
    @Field()
    @IsString()
    userId: string;
}

@Resolver(() => UserPermission)
@RequiredPermission(["userPermissions"], { skipScopeCheck: true })
export class UserPermissionResolver {
    constructor(
        private readonly service: UserPermissionsService,
        @InjectRepository(UserPermission) private readonly permissionRepository: EntityRepository<UserPermission>,
        private readonly entityManager: EntityManager,
    ) {}

    @Query(() => [UserPermission])
    async userPermissionsPermissionList(@Args() args: UserPermissionListArgs): Promise<UserPermission[]> {
        return this.service.getPermissions(await this.service.findUserOrThrow(args.userId));
    }

    @Query(() => UserPermission)
    async userPermissionsPermission(
        @Args("id", { type: () => ID }) id: string,
        @Args("userId", { type: () => String, nullable: true }) userId?: string,
    ): Promise<UserPermission> {
        return this.getPermission(id, userId);
    }

    @Mutation(() => UserPermission)
    @SkipBuild()
    async userPermissionsCreatePermission(
        @Args("userId", { type: () => String }) userId: string,
        @Args("input", { type: () => UserPermissionInput }) input: UserPermissionInput,
    ): Promise<UserPermission> {
        const permission = new UserPermission();
        await this.service.findUserOrThrow(userId); //validate user exists
        permission.userId = userId;
        permission.assign(input);
        await this.entityManager.persistAndFlush(permission);
        return permission;
    }

    @Query(() => [String])
    async userPermissionsAvailablePermissions(): Promise<string[]> {
        return this.service.getAvailablePermissions();
    }

    @Mutation(() => UserPermission)
    @SkipBuild()
    async userPermissionsUpdatePermission(
        @Args("id", { type: () => String }) id: string,
        @Args("input", { type: () => UserPermissionInput }) input: UserPermissionInput,
    ): Promise<UserPermission> {
        const permission = await this.getPermission(id);
        permission.assign(input);
        await this.entityManager.persistAndFlush(permission);
        return permission;
    }

    @Mutation(() => Boolean)
    @SkipBuild()
    async userPermissionsDeletePermission(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        this.entityManager.removeAndFlush(await this.getPermission(id));
        return true;
    }

    @Mutation(() => UserPermission)
    async userPermissionsUpdateOverrideContentScopes(
        @Args("input", { type: () => UserPermissionOverrideContentScopesInput }) input: UserPermissionOverrideContentScopesInput,
    ): Promise<UserPermission> {
        const permission = await this.getPermission(input.permissionId);
        permission.overrideContentScopes = input.overrideContentScopes;
        permission.contentScopes = input.contentScopes;
        await this.entityManager.persistAndFlush(permission);
        return permission;
    }

    async getPermission(id: string, userId?: string): Promise<UserPermission> {
        const permission = await this.permissionRepository.findOne(id);
        if (permission) {
            permission.source = UserPermissionSource.MANUAL;
            return permission;
        }
        if (!userId) {
            throw new Error(`Permission not found: ${id}`);
        }
        for (const p of await this.service.getPermissions(await this.service.findUserOrThrow(userId))) {
            if (p.id === id) {
                return p;
            }
        }
        throw new Error("Permission not found");
    }
}
