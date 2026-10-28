import { EntityManager, type FilterQuery, type FindOptions, wrap } from "@mikro-orm/postgresql";
import { Inject, type Type } from "@nestjs/common";
import { Args, ArgsType, ID, Mutation, ObjectType, Query, Resolver } from "@nestjs/graphql";

import type { ExtractBlockData } from "../blocks/block.js";
import { DextinityValidationException } from "../common/errors/validation.exception.js";
import { PaginatedResponseFactory } from "../common/pagination/paginated-response.factory.js";
import { DynamicDtoValidationPipe } from "../common/validation/dynamic-dto-validation.pipe.js";
import { validateNotModified } from "../document/validateNotModified.js";
import { PageTreeReadApiService } from "../page-tree/page-tree-read-api.service.js";
import { AffectedEntity } from "../user-permissions/decorators/affected-entity.decorator.js";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator.js";
import { EmptyRedirectScope } from "./dto/empty-redirect-scope.js";
import { PaginatedRedirectsArgsFactory } from "./dto/paginated-redirects-args.factory.js";
import type { RedirectInputInterface } from "./dto/redirect-input.factory.js";
import { RedirectUpdateActivenessInput } from "./dto/redirect-update-activeness.input.js";
import { RedirectsArgsFactory } from "./dto/redirects-args.factory.js";
import type { RedirectInterface } from "./entities/redirect-entity.factory.js";
import { resolveRedirectEntity } from "./entities/resolve-redirect-entity.js";
import type { RedirectTargetUrlServiceInterface } from "./redirect-target-url.service.js";
import { REDIRECTS_TARGET_URL_SERVICE } from "./redirects.constants.js";
import { RedirectSourceType } from "./redirects.enum.js";
import type { RedirectsLinkBlock } from "./redirects.module.js";
import { RedirectsService } from "./redirects.service.js";
import { isEmptyFilter, redirectMatchesFilter } from "./redirects.util.js";
import type { RedirectScopeInterface } from "./types.js";

export function createRedirectsResolver({
    Redirect,
    RedirectInput,
    Scope: PassedScope,
}: {
    Redirect: Type<RedirectInterface>;
    RedirectInput: Type<RedirectInputInterface>;
    Scope?: Type<RedirectScopeInterface>;
}): Type<unknown> {
    const Scope = PassedScope || EmptyRedirectScope;

    const hasNonEmptyScope = !!PassedScope;

    function nonEmptyScopeOrNothing(scope: RedirectScopeInterface): RedirectScopeInterface | undefined {
        // GraphQL sends the scope object with a null prototype ([Object: null prototype] { <key>: <value> }), but MikroORM uses the
        // object's hasOwnProperty method internally, resulting in a "object.hasOwnProperty is not a function" error. To fix this, we
        // create a "real" JavaScript object by using the spread operator.
        // See https://github.com/mikro-orm/mikro-orm/issues/2846 for more information.
        return hasNonEmptyScope ? { ...scope } : undefined;
    }

    @ObjectType()
    class PaginatedRedirects extends PaginatedResponseFactory.create(Redirect) {}

    @ArgsType()
    class RedirectsArgs extends RedirectsArgsFactory.create({ Scope }) {}

    @ArgsType()
    class PaginatedRedirectsArgs extends PaginatedRedirectsArgsFactory.create({ Scope }) {}

    @Resolver(() => Redirect)
    @RequiredPermission(["pageTree"], { skipScopeCheck: !hasNonEmptyScope })
    class RedirectsResolver {
        constructor(
            private readonly redirectService: RedirectsService,
            private readonly pageTreeReadApi: PageTreeReadApiService,
            private readonly entityManager: EntityManager,
            @Inject(REDIRECTS_TARGET_URL_SERVICE) private readonly targetUrlService: RedirectTargetUrlServiceInterface,
        ) {}

        @Query(() => [Redirect], { deprecationReason: "Use paginatedRedirects instead. Will be removed in the next version." })
        async redirects(@Args() { scope, query, type, active, sortColumnName, sortDirection }: RedirectsArgs): Promise<RedirectInterface[]> {
            const where = this.redirectService.getFindCondition({ query, type, active });
            if (hasNonEmptyScope) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (where as any).scope = nonEmptyScopeOrNothing(scope);
            }

            const options: FindOptions<RedirectInterface> = {};
            if (sortColumnName) {
                options.orderBy = { [sortColumnName]: sortDirection };
            }

            await this.pageTreeReadApi.preloadNodes(scope);

            return this.entityManager.find(resolveRedirectEntity(), where, options);
        }

        @Query(() => PaginatedRedirects)
        async paginatedRedirects(@Args() { scope, search, filter, sort, offset, limit }: PaginatedRedirectsArgs): Promise<PaginatedRedirects> {
            const needsInMemoryFiltering = search || (filter && !isEmptyFilter(filter));

            if (needsInMemoryFiltering) {
                const where = {};
                if (hasNonEmptyScope) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (where as any).scope = scope;
                }

                const options: FindOptions<RedirectInterface> = {};

                if (sort) {
                    options.orderBy = sort.map((sortItem) => {
                        return {
                            [sortItem.field]: sortItem.direction,
                        };
                    });
                }

                await this.pageTreeReadApi.preloadNodes(scope);

                const allRedirects = await this.entityManager.find(resolveRedirectEntity(), where, options);
                const redirects = [];

                const targetUrlCache = new Map<string, string | undefined>();

                for (const redirect of allRedirects) {
                    let targetUrl: string | undefined;

                    const target = redirect.target as ExtractBlockData<RedirectsLinkBlock>;

                    if (target.activeType) {
                        const targetBlock = target.attachedBlocks.find((block) => block.type === target.activeType);

                        if (!targetBlock) {
                            throw new Error(`Can't find target block for redirect '${redirect.id}'`);
                        }

                        const targetBlockKey = JSON.stringify(targetBlock);

                        if (targetUrlCache.has(targetBlockKey)) {
                            targetUrl = targetUrlCache.get(targetBlockKey);
                        } else {
                            targetUrl = await this.targetUrlService.resolveTargetUrl(targetBlock);
                            targetUrlCache.set(targetBlockKey, targetUrl);
                        }
                    }

                    let searchMatches = true;
                    let filterMatches = true;

                    if (search) {
                        searchMatches = redirect.source.includes(search) || (targetUrl?.includes(search) ?? false);
                    }

                    if (filter) {
                        filterMatches = redirectMatchesFilter({ ...redirect, target: targetUrl }, filter);
                    }

                    if (searchMatches && filterMatches) {
                        redirects.push(redirect);
                    }
                }

                return new PaginatedRedirects(redirects.slice(offset, offset + limit), redirects.length);
            }

            const where = this.redirectService.getFindConditionPaginatedRedirects({ search, filter });
            if (hasNonEmptyScope) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (where as any).scope = nonEmptyScopeOrNothing(scope);
            }

            const options: FindOptions<RedirectInterface> = { offset, limit };

            if (sort) {
                options.orderBy = sort.map((sortItem) => {
                    return {
                        [sortItem.field]: sortItem.direction,
                    };
                });
            }

            await this.pageTreeReadApi.preloadNodes(scope);

            const [entities, totalCount] = await this.entityManager.findAndCount(resolveRedirectEntity(), where, options);
            return new PaginatedRedirects(entities, totalCount);
        }

        @Query(() => Redirect)
        @AffectedEntity(Redirect)
        async redirect(@Args("id", { type: () => ID }) id: string): Promise<RedirectInterface> {
            const redirect = await this.entityManager.findOneOrFail(resolveRedirectEntity(), id);
            return redirect;
        }

        @Query(() => Redirect, { nullable: true })
        async redirectBySource(
            @Args("scope", { type: () => Scope, defaultValue: hasNonEmptyScope ? undefined : {} }) scope: typeof Scope,
            @Args("source", { type: () => String }) source: string,
            @Args("sourceType", { type: () => RedirectSourceType }) sourceType: RedirectSourceType,
        ): Promise<RedirectInterface | null> {
            const where: FilterQuery<RedirectInterface> = { source, sourceType };
            if (hasNonEmptyScope) {
                where.scope = nonEmptyScopeOrNothing(scope);
            }
            const redirect = await this.entityManager.findOne(resolveRedirectEntity(), where);
            return redirect ?? null;
        }

        @Query(() => Boolean)
        async redirectSourceAvailable(
            @Args("scope", { type: () => Scope, defaultValue: hasNonEmptyScope ? undefined : {} }) scope: typeof Scope,
            @Args("source", { type: () => String }) source: string,
        ): Promise<boolean> {
            return this.redirectService.isRedirectSourceAvailable(source, nonEmptyScopeOrNothing(scope));
        }

        @Mutation(() => Redirect)
        async createRedirect(
            @Args("scope", { type: () => Scope, defaultValue: hasNonEmptyScope ? undefined : {} }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
            @Args("input", { type: () => RedirectInput }, new DynamicDtoValidationPipe(RedirectInput)) input: RedirectInputInterface,
        ): Promise<RedirectInterface> {
            if (!(await this.redirectService.isRedirectSourceAvailable(input.source, nonEmptyScopeOrNothing(scope)))) {
                throw new DextinityValidationException("Validation failed");
            }

            const entity = this.entityManager.create(resolveRedirectEntity(), {
                scope: nonEmptyScopeOrNothing(scope),
                activatedAt: new Date(),
                ...input,
                target: input.target.transformToBlockData(),
            });
            await this.entityManager.persist(entity).flush();
            return this.entityManager.findOneOrFail(resolveRedirectEntity(), entity.id);
        }

        @Mutation(() => Redirect)
        @AffectedEntity(Redirect)
        async updateRedirect(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => RedirectInput }, new DynamicDtoValidationPipe(RedirectInput)) input: RedirectInputInterface,
            @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        ): Promise<RedirectInterface> {
            const redirect = await this.entityManager.findOneOrFail(resolveRedirectEntity(), id);
            if (redirect != null && lastUpdatedAt) {
                validateNotModified(redirect, lastUpdatedAt);
            }

            if (!(await this.redirectService.isRedirectSourceAvailable(input.source, redirect.scope, { excludedId: redirect.id }))) {
                throw new DextinityValidationException("Validation failed");
            }

            wrap(redirect).assign({ ...input, target: input.target.transformToBlockData() });
            await this.entityManager.persist(redirect).flush();
            return this.entityManager.findOneOrFail(resolveRedirectEntity(), id);
        }

        @Mutation(() => Redirect)
        @AffectedEntity(Redirect)
        async updateRedirectActiveness(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => RedirectUpdateActivenessInput }) input: RedirectUpdateActivenessInput,
        ): Promise<RedirectInterface> {
            const redirect = await this.entityManager.findOneOrFail(resolveRedirectEntity(), id);

            wrap(redirect).assign({ active: input.active, activatedAt: input.active ? new Date() : null });
            await this.entityManager.persist(redirect).flush();

            return this.entityManager.findOneOrFail(resolveRedirectEntity(), id);
        }

        @Mutation(() => Boolean)
        @AffectedEntity(Redirect)
        async deleteRedirect(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            const entity = await this.entityManager.findOneOrFail(resolveRedirectEntity(), id);
            await this.entityManager.remove(entity).flush();
            return true;
        }

        @Mutation(() => Boolean)
        @AffectedEntity(Redirect, { idArg: "ids" })
        async deleteRedirects(@Args("ids", { type: () => [ID] }) ids: string[]): Promise<boolean> {
            const entities = await this.entityManager.find(resolveRedirectEntity(), { id: { $in: ids } });
            if (entities.length !== ids.length) {
                throw new Error("Couldn't find all redirects that were passed as input");
            }
            await this.entityManager.remove(entities).flush();
            return true;
        }
    }

    return RedirectsResolver;
}
