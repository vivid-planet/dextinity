import { type FilterQuery, type FindOptions, Reference } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import type { Type } from "@nestjs/common";
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import type { GraphQLResolveInfo } from "graphql";

import { DextinityValidationException } from "../../../common/errors/validation.exception.js";
import { searchToMikroOrmQuery } from "../../../common/filter/mikro-orm.js";
import { extractGraphqlFields } from "../../../common/graphql/extract-graphql-fields.js";
import { AffectedEntity } from "../../../user-permissions/decorators/affected-entity.decorator.js";
import { RequiredPermission } from "../../../user-permissions/decorators/required-permission.decorator.js";
import type { DamScopeInterface } from "../../types.js";
import type { FileInterface } from "../entities/file.entity.js";
import { resolveFileEntity } from "../entities/resolve-dam-entity.js";
import { DamMediaAlternativeInput, DamMediaAlternativeUpdateInput } from "./dto/dam-media-alternative.input.js";
import { DamMediaAlternativesArgs } from "./dto/dam-media-alternatives.args.js";
import { PaginatedDamMediaAlternatives } from "./dto/paginated-dam-media-alternatives.js";
import { DamMediaAlternative } from "./entities/dam-media-alternative.entity.js";

export function createDamMediaAlternativeResolver({
    File,
    Scope: PassedScope,
}: {
    File: Type<FileInterface>;
    Scope?: Type<DamScopeInterface>;
}): Type<unknown> {
    const hasNonEmptyScope = PassedScope != null;

    @Resolver(() => DamMediaAlternative)
    @RequiredPermission(["dam"], { skipScopeCheck: !hasNonEmptyScope })
    class DamMediaAlternativeResolver {
        constructor(private readonly entityManager: EntityManager) {}

        @Query(() => DamMediaAlternative)
        @AffectedEntity(DamMediaAlternative)
        async damMediaAlternative(@Args("id", { type: () => ID }) id: string): Promise<DamMediaAlternative> {
            const damMediaAlternative = await this.entityManager.findOneOrFail(DamMediaAlternative, id);
            return damMediaAlternative;
        }

        @Query(() => PaginatedDamMediaAlternatives)
        @AffectedEntity(File, { idArg: "for", nullable: true })
        @AffectedEntity(File, { idArg: "alternative", nullable: true })
        async damMediaAlternatives(
            @Args() { search, sort, offset, limit, for: forId, alternative: alternativeId, type }: DamMediaAlternativesArgs,
            @Info() info: GraphQLResolveInfo,
        ): Promise<PaginatedDamMediaAlternatives> {
            if ((!forId && !alternativeId) || (forId && alternativeId)) {
                throw new DextinityValidationException("Exactly one of 'for' or 'alternative' parameters must be provided");
            }

            let where: FilterQuery<DamMediaAlternative> = {};

            if (search) {
                where = { ...searchToMikroOrmQuery(search, ["language", forId ? "alternative.name" : "for.name"]) };
            }

            if (forId) {
                where.for = forId;
            } else if (alternativeId) {
                where.alternative = alternativeId;
            }

            if (type) {
                where.type = type;
            }

            const fields = extractGraphqlFields(info, { root: "nodes" });
            const populate: string[] = [];
            if (fields.includes("for")) {
                populate.push("for");
            }
            if (fields.includes("alternative")) {
                populate.push("alternative");
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: FindOptions<DamMediaAlternative, any> = { offset, limit, populate };

            if (sort) {
                options.orderBy = sort.map((sortItem) => {
                    if (sortItem.field === "alternative") {
                        return { alternative: { name: sortItem.direction } };
                    } else if (sortItem.field === "for") {
                        return { for: { name: sortItem.direction } };
                    }
                    return {
                        [sortItem.field]: sortItem.direction,
                    };
                });
            }

            const [entities, totalCount] = await this.entityManager.findAndCount(DamMediaAlternative, where, options);
            return new PaginatedDamMediaAlternatives(entities, totalCount);
        }

        @Mutation(() => DamMediaAlternative)
        @AffectedEntity(File, { idArg: "for" })
        @AffectedEntity(File, { idArg: "alternative" })
        async createDamMediaAlternative(
            @Args("for", { type: () => ID }) forId: string,
            @Args("alternative", { type: () => ID }) alternativeId: string,
            @Args("input", { type: () => DamMediaAlternativeInput }) input: DamMediaAlternativeInput,
        ): Promise<DamMediaAlternative> {
            const damMediaAlternative = this.entityManager.create(DamMediaAlternative, {
                ...input,

                for: Reference.create(await this.entityManager.findOneOrFail(resolveFileEntity(), forId)),
                alternative: Reference.create(await this.entityManager.findOneOrFail(resolveFileEntity(), alternativeId)),
            });

            await this.entityManager.flush();

            return damMediaAlternative;
        }

        @Mutation(() => DamMediaAlternative)
        @AffectedEntity(DamMediaAlternative)
        async updateDamMediaAlternative(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => DamMediaAlternativeUpdateInput }) input: DamMediaAlternativeUpdateInput,
        ): Promise<DamMediaAlternative> {
            const damMediaAlternative = await this.entityManager.findOneOrFail(DamMediaAlternative, id);

            const { for: forInput, alternative: alternativeInput, ...assignInput } = input;
            damMediaAlternative.assign({
                ...assignInput,
            });

            if (forInput !== undefined) {
                damMediaAlternative.for = Reference.create(await this.entityManager.findOneOrFail(resolveFileEntity(), forInput));
            }
            if (alternativeInput !== undefined) {
                damMediaAlternative.alternative = Reference.create(await this.entityManager.findOneOrFail(resolveFileEntity(), alternativeInput));
            }

            await this.entityManager.flush();

            return damMediaAlternative;
        }

        @Mutation(() => Boolean)
        @AffectedEntity(DamMediaAlternative)
        async deleteDamMediaAlternative(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            const damMediaAlternative = await this.entityManager.findOneOrFail(DamMediaAlternative, id);
            this.entityManager.remove(damMediaAlternative);
            await this.entityManager.flush();
            return true;
        }

        @ResolveField(() => File)
        async for(@Parent() damMediaAlternative: DamMediaAlternative): Promise<FileInterface> {
            return damMediaAlternative.for.loadOrFail();
        }

        @ResolveField(() => File)
        async alternative(@Parent() damMediaAlternative: DamMediaAlternative): Promise<FileInterface> {
            return damMediaAlternative.alternative.loadOrFail();
        }
    }

    return DamMediaAlternativeResolver;
}
