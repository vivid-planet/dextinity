import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository, FilterQuery, FindOptions, wrap } from "@mikro-orm/postgresql";
import { Inject, Type } from "@nestjs/common";
import { Args, ArgsType, ID, Mutation, ObjectType, Query, Resolver } from "@nestjs/graphql";

import type { ExtractBlockData } from "../blocks/block";
import { DextinityValidationException } from "../common/errors/validation.exception";
import { PaginatedResponseFactory } from "../common/pagination/paginated-response.factory";
import { DynamicDtoValidationPipe } from "../common/validation/dynamic-dto-validation.pipe";
import { validateNotModified } from "../document/validateNotModified";
import { PageTreeReadApiService } from "../page-tree/page-tree-read-api.service";
import { AffectedEntity } from "../user-permissions/decorators/affected-entity.decorator";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { EmptyRedirectScope } from "./dto/empty-redirect-scope";
import { PaginatedRedirectsArgsFactory } from "./dto/paginated-redirects-args.factory";
import { RedirectInputInterface } from "./dto/redirect-input.factory";
import { RedirectUpdateActivenessInput } from "./dto/redirect-update-activeness.input";
import { RedirectsArgsFactory } from "./dto/redirects-args.factory";
import { RedirectInterface } from "./entities/redirect-entity.factory";
import { RedirectTargetUrlServiceInterface } from "./redirect-target-url.service";
import { REDIRECTS_TARGET_URL_SERVICE } from "./redirects.constants";
import { RedirectSourceType } from "./redirects.enum";
import { RedirectsLinkBlock } from "./redirects.module";
import { RedirectsService } from "./redirects.service";
import { isEmptyFilter, redirectMatchesFilter } from "./redirects.util";
import { RedirectScopeInterface } from "./types";

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
            @InjectRepository("Redirect") private readonly repository: EntityRepository<RedirectInterface>,
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

            return this.repository.find(where, options);
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

                const allRedirects = await this.repository.find(where, options);
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

            const [entities, totalCount] = await this.repository.findAndCount(where, options);
            return new PaginatedRedirects(entities, totalCount);
        }

        @Query(() => Redirect)
        @AffectedEntity(Redirect)
        async redirect(@Args("id", { type: () => ID }) id: string): Promise<RedirectInterface> {
            const redirect = await this.repository.findOneOrFail(id);
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
            const redirect = await this.repository.findOne(where);
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

            const entity = this.repository.create({
                scope: nonEmptyScopeOrNothing(scope),
                activatedAt: new Date(),
                ...input,
                target: input.target.transformToBlockData(),
            });
            await this.entityManager.persistAndFlush(entity);
            return this.repository.findOneOrFail(entity.id);
        }

        @Mutation(() => Redirect)
        @AffectedEntity(Redirect)
        async updateRedirect(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => RedirectInput }, new DynamicDtoValidationPipe(RedirectInput)) input: RedirectInputInterface,
            @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        ): Promise<RedirectInterface> {
            const redirect = await this.repository.findOneOrFail(id);
            if (redirect != null && lastUpdatedAt) {
                validateNotModified(redirect, lastUpdatedAt);
            }

            if (!(await this.redirectService.isRedirectSourceAvailable(input.source, redirect.scope, { excludedId: redirect.id }))) {
                throw new DextinityValidationException("Validation failed");
            }

            wrap(redirect).assign({ ...input, target: input.target.transformToBlockData() });
            await this.entityManager.persistAndFlush(redirect);
            return this.repository.findOneOrFail(id);
        }

        @Mutation(() => Redirect)
        @AffectedEntity(Redirect)
        async updateRedirectActiveness(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => RedirectUpdateActivenessInput }) input: RedirectUpdateActivenessInput,
        ): Promise<RedirectInterface> {
            const redirect = await this.repository.findOneOrFail(id);

            wrap(redirect).assign({ active: input.active, activatedAt: input.active ? new Date() : null });
            await this.entityManager.persistAndFlush(redirect);

            return this.repository.findOneOrFail(id);
        }

        @Mutation(() => Boolean)
        @AffectedEntity(Redirect)
        async deleteRedirect(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            const entity = await this.repository.findOneOrFail(id);
            await this.entityManager.removeAndFlush(entity);
            return true;
        }

        @Mutation(() => Boolean)
        @AffectedEntity(Redirect, { idArg: "ids" })
        async deleteRedirects(@Args("ids", { type: () => [ID] }) ids: string[]): Promise<boolean> {
            const entities = await this.repository.find({ id: { $in: ids } });
            if (entities.length !== ids.length) {
                throw new Error("Couldn't find all redirects that were passed as input");
            }
            await this.entityManager.removeAndFlush(entities);
            return true;
        }
    }

    return RedirectsResolver;
}
