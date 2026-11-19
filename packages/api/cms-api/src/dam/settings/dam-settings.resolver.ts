import { EntityManager } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";

import { DextinityEntityNotFoundException } from "../../common/errors/entity-not-found.exception";
import { DextinityValidationException } from "../../common/errors/validation.exception";
import { contentScopesAreEqual } from "../../user-permissions/content-scopes-are-equal";
import { RequiredPermission } from "../../user-permissions/decorators/required-permission.decorator";
import { EmptyDamScope } from "../files/dto/empty-dam-scope";
import { FileInterface } from "../files/entities/file.entity";
import { FilesService } from "../files/files.service";
import { DamScopeInterface } from "../types";
import { damSettingsByScope } from "./dam-settings-by-scope";
import { DamSettingsInput } from "./dto/dam-settings.input";
import { DamSettings } from "./entities/dam-settings.entity";

export function createDamSettingsResolver({
    File,
    Scope: PassedScope,
}: {
    File: Type<FileInterface>;
    Scope?: Type<DamScopeInterface>;
}): Type<unknown> {
    const Scope = PassedScope ?? EmptyDamScope;
    const hasNonEmptyScope = PassedScope != null;

    function nonEmptyScopeOrNothing(scope: DamScopeInterface): DamScopeInterface | undefined {
        // GraphQL sends the scope object with a null prototype, which MikroORM can't handle. See FoldersResolver for more information.
        return hasNonEmptyScope ? { ...scope } : undefined;
    }

    @Resolver(() => DamSettings)
    @RequiredPermission(["dam"], { skipScopeCheck: !hasNonEmptyScope })
    class DamSettingsResolver {
        constructor(
            private readonly entityManager: EntityManager,
            private readonly filesService: FilesService,
        ) {}

        @Query(() => DamSettings, { nullable: true })
        async damSettings(
            @Args("scope", { type: () => Scope, defaultValue: hasNonEmptyScope ? undefined : {} }) passedScope: typeof Scope,
        ): Promise<DamSettings | null> {
            return this.entityManager.findOne(DamSettings, damSettingsByScope(nonEmptyScopeOrNothing(passedScope)));
        }

        @Mutation(() => DamSettings)
        async updateDamSettings(
            @Args("scope", { type: () => Scope, defaultValue: hasNonEmptyScope ? undefined : {} }) passedScope: typeof Scope,
            @Args("input", { type: () => DamSettingsInput }) input: DamSettingsInput,
        ): Promise<DamSettings> {
            const scope = nonEmptyScopeOrNothing(passedScope);

            let invalidLicenseFallbackImage: FileInterface | null = null;

            if (input.invalidLicenseFallbackImageId) {
                invalidLicenseFallbackImage = await this.filesService.findOneById(input.invalidLicenseFallbackImageId);

                if (!invalidLicenseFallbackImage) {
                    throw new DextinityEntityNotFoundException(`File ${input.invalidLicenseFallbackImageId} not found`);
                }

                if (!contentScopesAreEqual(invalidLicenseFallbackImage.scope, scope)) {
                    throw new DextinityValidationException("The fallback image must be in the same scope as the settings");
                }

                if (!invalidLicenseFallbackImage.image) {
                    throw new DextinityValidationException("The fallback image must be a pixel image");
                }
            }

            const settings =
                (await this.entityManager.findOne(DamSettings, damSettingsByScope(scope))) ?? this.entityManager.create(DamSettings, { scope });
            settings.assign({ invalidLicenseFallbackImage });

            await this.entityManager.flush();

            return settings;
        }

        @ResolveField(() => File, { nullable: true })
        async invalidLicenseFallbackImage(@Parent() settings: DamSettings): Promise<FileInterface | null> {
            return (await settings.invalidLicenseFallbackImage?.load()) ?? null;
        }
    }

    return DamSettingsResolver;
}
