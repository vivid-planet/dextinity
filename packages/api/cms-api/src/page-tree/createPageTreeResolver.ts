import { Inject, Type } from "@nestjs/common";
import { Args, ArgsType, createUnionType, ID, Info, Int, Mutation, Parent, Query, ResolveField, Resolver, Union } from "@nestjs/graphql";
import { GraphQLError, GraphQLResolveInfo } from "graphql";

import { DynamicDtoValidationPipe } from "../common/validation/dynamic-dto-validation.pipe";
import { DocumentInterface } from "../document/dto/document-interface";
import { AffectedEntity } from "../user-permissions/decorators/affected-entity.decorator";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { AttachedDocumentLoaderService } from "./attached-document-loader.service";
import { EmptyPageTreeNodeScope } from "./dto/empty-page-tree-node-scope";
import {
    DefaultPageTreeNodeCreateInput,
    DefaultPageTreeNodeUpdateInput,
    MovePageTreeNodesByNeighbourInput,
    MovePageTreeNodesByPosInput,
    PageTreeNodeUpdateVisibilityInput,
} from "./dto/page-tree-node.input";
import { PaginatedPageTreeNodesArgsFactory } from "./dto/paginated-page-tree-nodes-args.factory";
import { SlugAvailability } from "./dto/slug-availability.enum";
import { PAGE_TREE_CONFIG } from "./page-tree.constants";
import { PageTreeConfig } from "./page-tree.module";
import { PageTreeService } from "./page-tree.service";
import { PageTreeReadApiService } from "./page-tree-read-api.service";
import {
    PageTreeNodeCategory,
    PageTreeNodeCreateInputInterface,
    PageTreeNodeInterface,
    PageTreeNodeUpdateInputInterface,
    PageTreeNodeVisibility as Visibility,
    ScopeInterface,
} from "./types";

export function createPageTreeResolver({
    PageTreeNode,
    PageTreeNodeCreateInput = DefaultPageTreeNodeCreateInput,
    PageTreeNodeUpdateInput = DefaultPageTreeNodeUpdateInput,
    Documents,
    Scope: PassedScope,
    PaginatedPageTreeNodes,
}: {
    PageTreeNode: Type<PageTreeNodeInterface>;
    PageTreeNodeCreateInput?: Type<PageTreeNodeCreateInputInterface>;
    PageTreeNodeUpdateInput?: Type<PageTreeNodeUpdateInputInterface>;
    Documents: Type<DocumentInterface>[];
    Scope?: Type<ScopeInterface>;
    PaginatedPageTreeNodes: Type;
}): Type<unknown> {
    const Scope = PassedScope || EmptyPageTreeNodeScope;

    @ArgsType()
    class PaginatedPageTreeNodesArgs extends PaginatedPageTreeNodesArgsFactory.create({ Scope }) {}

    const hasNonEmptyScope = !!PassedScope;

    function nonEmptyScopeOrNothing(scope: ScopeInterface): ScopeInterface | undefined {
        // GraphQL sends the scope object with a null prototype ([Object: null prototype] { <key>: <value> }), but MikroORM uses the
        // object's hasOwnProperty method internally, resulting in a "object.hasOwnProperty is not a function" error. To fix this, we
        // create a "real" JavaScript object by using the spread operator.
        // See https://github.com/mikro-orm/mikro-orm/issues/2846 for more information.
        return hasNonEmptyScope ? { ...scope } : undefined;
    }

    const pageContentUnion: Union<unknown[]> = createUnionType({
        name: "PageContentUnion",
        types: () => Documents,
    });

    @Resolver(() => PageTreeNode)
    @RequiredPermission(["pageTree"], { skipScopeCheck: !hasNonEmptyScope })
    class PageTreeResolver {
        constructor(
            protected readonly pageTreeService: PageTreeService,
            protected readonly pageTreeReadApi: PageTreeReadApiService,
            @Inject(PAGE_TREE_CONFIG) private readonly config: PageTreeConfig,
            private readonly attachedDocumentLoaderService: AttachedDocumentLoaderService,
        ) {}

        @Query(() => PageTreeNode, { nullable: true })
        @AffectedEntity(PageTreeNode)
        async pageTreeNode(@Args("id", { type: () => ID }) id: string): Promise<PageTreeNodeInterface> {
            return this.pageTreeReadApi.getNodeOrFail(id);
        }
        @Query(() => PageTreeNode, { nullable: true })
        async pageTreeNodeByPath(
            @Args("path") path: string,
            @Args("scope", { type: () => Scope }) scope: ScopeInterface,
        ): Promise<PageTreeNodeInterface | null> {
            return this.pageTreeReadApi.getNodeByPath(path, { scope: nonEmptyScopeOrNothing(scope) });
        }

        @Query(() => [PageTreeNode])
        async pageTreeNodeList(
            @Args("scope", { type: () => Scope }) scope: ScopeInterface,
            @Args("category", { type: () => String, nullable: true }) category: PageTreeNodeCategory,
        ): Promise<PageTreeNodeInterface[]> {
            await this.pageTreeReadApi.preloadNodes(scope);
            return this.pageTreeReadApi.getNodes({ scope: nonEmptyScopeOrNothing(scope), category });
        }

        @Query(() => PaginatedPageTreeNodes)
        async paginatedPageTreeNodes(
            @Args() { scope, category, sort, offset, limit, documentType }: PaginatedPageTreeNodesArgs,
        ): Promise<typeof PaginatedPageTreeNodes> {
            await this.pageTreeReadApi.preloadNodes(scope);
            const nodes = await this.pageTreeReadApi.getNodes({ scope: nonEmptyScopeOrNothing(scope), category, offset, limit, sort, documentType });
            const count = await this.pageTreeReadApi.getNodesCount({ scope: nonEmptyScopeOrNothing(scope), category, documentType });

            return new PaginatedPageTreeNodes(nodes, count);
        }

        @Query(() => SlugAvailability)
        async pageTreeNodeSlugAvailable(
            @Args("scope", { type: () => Scope }) scope: ScopeInterface,
            @Args("parentId", { type: () => ID, nullable: true }) parentId: string,
            @Args("slug") slug: string,
        ): Promise<SlugAvailability> {
            const requestedPath = await this.pageTreeService.pathForParentAndSlug(parentId || null, slug);

            if (this.config.reservedPaths.includes(requestedPath)) {
                return SlugAvailability.Reserved;
            }

            if (slug == "home" && requestedPath !== "/home") {
                return SlugAvailability.Reserved;
            }

            const nodeWithSamePath = await this.pageTreeService.nodeWithSamePath(requestedPath, nonEmptyScopeOrNothing(scope));

            if (nodeWithSamePath) {
                return SlugAvailability.Taken;
            }

            return SlugAvailability.Available;
        }

        @ResolveField(() => [PageTreeNode])
        async childNodes(@Parent() node: PageTreeNodeInterface): Promise<PageTreeNodeInterface[]> {
            return this.pageTreeReadApi.getChildNodes(node);
        }

        @ResolveField(() => Int)
        async numberOfDescendants(@Parent() node: PageTreeNodeInterface): Promise<number> {
            const childNodes = await this.pageTreeReadApi.getChildNodes(node);
            let numberOfDescendants = childNodes.length;

            for (const childNode of childNodes) {
                numberOfDescendants += await this.numberOfDescendants(childNode);
            }

            return numberOfDescendants;
        }

        @ResolveField(() => PageTreeNode, { nullable: true })
        async parentNode(@Parent() node: PageTreeNodeInterface): Promise<PageTreeNodeInterface | null> {
            return this.pageTreeReadApi.getParentNode(node);
        }

        @ResolveField(() => String)
        async path(@Parent() node: PageTreeNodeInterface): Promise<string> {
            return this.pageTreeReadApi.nodePath(node);
        }

        @ResolveField(() => [PageTreeNode])
        async parentNodes(@Parent() node: PageTreeNodeInterface): Promise<PageTreeNodeInterface[]> {
            return this.pageTreeReadApi.parentNodes(node);
        }

        @ResolveField(() => pageContentUnion, { nullable: true })
        async document(@Parent() node: PageTreeNodeInterface, @Info() info: GraphQLResolveInfo): Promise<typeof pageContentUnion | undefined> {
            if (info.fieldNodes.length === 1) {
                /*
                try to avoid loading document for queries such as
                  document {
                    __typename
                     ... on Link {
                       content
                     }
                  }

                  - loads __typename without loading document
                  - detects ... on Link and loads document only if type matches
                  - and only if required passes on to DataLoader (which then loads in batch)
                */

                const fieldNode = info.fieldNodes[0];

                if (fieldNode.selectionSet) {
                    const ret = fieldNode.selectionSet.selections.reduce(
                        (acc, selection) => {
                            if (!acc) {
                                return acc;
                            }
                            if (selection.kind == "Field" && selection.name.value === "__typename") {
                                //__typename is already in acc
                                return acc;
                            } else if (
                                selection.kind === "InlineFragment" &&
                                selection.typeCondition &&
                                selection.typeCondition.kind == "NamedType"
                            ) {
                                if (
                                    selection.typeCondition.name.value === node.documentType ||
                                    selection.typeCondition.name.value === DocumentInterface.name
                                ) {
                                    //documentType is matching, return full document (fall thru)
                                    return undefined;
                                } else {
                                    //documentType is not matching, return nothing more
                                    return acc;
                                }
                            } else {
                                // load full document (fall thru)
                                return undefined;
                            }
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        { __typename: node.documentType } as any,
                    );
                    if (ret) {
                        //we have all the information needed, return early
                        return ret;
                    } else {
                        //fall thru to load full document
                    }
                }
            }

            //if document needs to be loaded use DataLoader for batch loading
            return this.attachedDocumentLoaderService.load(node);
        }

        @Mutation(() => PageTreeNode)
        @AffectedEntity(PageTreeNode)
        async updatePageTreeNode(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => PageTreeNodeUpdateInput }, new DynamicDtoValidationPipe(PageTreeNodeUpdateInput))
            input: PageTreeNodeUpdateInputInterface,
        ): Promise<PageTreeNodeInterface> {
            // Archived pages cannot be updated
            const pageTreeReadApi = this.pageTreeService.createReadApi({
                visibility: "all",
            });
            const node = await pageTreeReadApi.getNodeOrFail(id);
            if (node.visibility === Visibility.Archived) {
                throw new GraphQLError("Can not update an archived page.");
            }

            return this.pageTreeService.updateNode(id, input);
        }

        @Mutation(() => Boolean)
        @AffectedEntity(PageTreeNode)
        async deletePageTreeNode(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            if (!this.config.allowPageDelete) {
                throw new GraphQLError("Page deletion is disabled in the configuration.");
            }

            const pageTreeReadApi = this.pageTreeService.createReadApi({
                visibility: "all",
            });
            const pageTreeNode = await pageTreeReadApi.getNodeOrFail(id);

            return this.pageTreeService.delete(pageTreeNode);
        }

        @Mutation(() => PageTreeNode)
        @AffectedEntity(PageTreeNode)
        async updatePageTreeNodeVisibility(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => PageTreeNodeUpdateVisibilityInput }) input: PageTreeNodeUpdateVisibilityInput,
        ): Promise<PageTreeNodeInterface> {
            await this.pageTreeService.updateNodeVisibility(id, input.visibility);

            const pageTreeReadApi = this.pageTreeService.createReadApi({ visibility: "all" });
            return pageTreeReadApi.getNodeOrFail(id);
        }

        @Mutation(() => PageTreeNode)
        @AffectedEntity(PageTreeNode)
        async updatePageTreeNodeSlug(
            @Args("id", { type: () => ID }) id: string,
            @Args("slug", { type: () => String }) slug: string,
        ): Promise<PageTreeNodeInterface> {
            return this.pageTreeService.updateNodeSlug(id, slug);
        }

        @Mutation(() => [PageTreeNode])
        @AffectedEntity(PageTreeNode, { idArg: "ids" })
        async movePageTreeNodesByPos(
            @Args("ids", { type: () => [ID] }) ids: string[],
            @Args("input", { type: () => MovePageTreeNodesByPosInput }) input: MovePageTreeNodesByPosInput,
        ): Promise<PageTreeNodeInterface[]> {
            // Archived pages cannot be updated
            const pageTreeReadApi = this.pageTreeService.createReadApi({
                visibility: "all",
            });

            if (input.parentId !== null) {
                if (ids.includes(input.parentId)) {
                    throw new GraphQLError("A page cannot be its own parent.");
                }

                const newParentNode = await pageTreeReadApi.getNodeOrFail(input.parentId);

                let parentId = newParentNode.parentId;
                while (parentId !== null) {
                    if (ids.includes(parentId)) {
                        throw new GraphQLError("Cannot make a page its own child.");
                    }

                    const parentNode = await pageTreeReadApi.getNodeOrFail(parentId);
                    parentId = parentNode.parentId;
                }
            }

            const nodes: PageTreeNodeInterface[] = [];
            for (const id of ids) {
                const node = await pageTreeReadApi.getNodeOrFail(id);
                if (node.visibility === Visibility.Archived) {
                    throw new GraphQLError("Cannot update an archived page.");
                }

                if (node.slug === "home" && input.parentId !== null) {
                    throw new GraphQLError(`Page "home" cannot be moved to subtree.`);
                }

                nodes.push(node);
            }

            let pos = input.pos;
            const modifiedPageTreeNodes: PageTreeNodeInterface[] = [];
            for (const node of nodes) {
                const modifiedPageTreeNode = await this.pageTreeService.updateNodePosition(node.id, { parentId: input.parentId, pos });
                pos = modifiedPageTreeNode.pos + 1;

                modifiedPageTreeNodes.push(modifiedPageTreeNode);
            }

            return modifiedPageTreeNodes;
        }

        @Mutation(() => [PageTreeNode])
        @AffectedEntity(PageTreeNode, { idArg: "ids" })
        async movePageTreeNodesByNeighbour(
            @Args("ids", { type: () => [ID] }) ids: string[],
            @Args("input", { type: () => MovePageTreeNodesByNeighbourInput }) input: MovePageTreeNodesByNeighbourInput,
        ): Promise<PageTreeNodeInterface[]> {
            // Archived pages cannot be updated
            const pageTreeReadApi = this.pageTreeService.createReadApi({
                visibility: "all",
            });

            let newPos: number;
            if (input.afterId !== null && input.beforeId !== null) {
                throw new GraphQLError("You must only send a beforeId OR an afterId");
            } else if (input.afterId) {
                const afterNode = await pageTreeReadApi.getNodeOrFail(input.afterId);

                if (afterNode.parentId !== input.parentId) {
                    throw new GraphQLError("The requested after page does not have the requested parentId.");
                }

                newPos = afterNode.pos + 1;
            } else if (input.beforeId) {
                const beforeNode = await pageTreeReadApi.getNodeOrFail(input.beforeId);

                if (beforeNode.parentId !== input.parentId) {
                    throw new GraphQLError("The requested after page does not have the requested parentId.");
                }

                newPos = beforeNode.pos;
            } else {
                newPos = 0;
            }

            return this.movePageTreeNodesByPos(ids, { parentId: input.parentId, pos: newPos });
        }

        @Mutation(() => PageTreeNode)
        @AffectedEntity(PageTreeNode)
        async updatePageTreeNodeCategory(
            @Args("id", { type: () => ID }) id: string,
            @Args("category", { type: () => String }) category: PageTreeNodeCategory,
        ): Promise<PageTreeNodeInterface> {
            // Archived pages cannot be updated
            const pageTreeReadApi = this.pageTreeService.createReadApi({
                visibility: "all",
            });
            const node = await pageTreeReadApi.getNodeOrFail(id);
            if (node.visibility === Visibility.Archived) {
                throw new GraphQLError("Can not update category of an archived page.");
            }
            await this.pageTreeService.updateCategory(id, category);

            return this.pageTreeNode(id);
        }

        @Mutation(() => PageTreeNode)
        async createPageTreeNode(
            @Args("input", { type: () => PageTreeNodeCreateInput }, new DynamicDtoValidationPipe(PageTreeNodeCreateInput))
            input: PageTreeNodeCreateInputInterface,
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope)) scope: ScopeInterface,
            @Args("category", { type: () => String }) category: PageTreeNodeCategory,
        ): Promise<PageTreeNodeInterface> {
            // Can not add a subpage under an archived page
            if (input.parentId) {
                const pageTreeReadApi = this.pageTreeService.createReadApi({
                    visibility: "all",
                });
                const parentNode = await pageTreeReadApi.getNodeOrFail(input.parentId);
                if (parentNode.visibility === Visibility.Archived) {
                    throw new GraphQLError("Can not add a subpage to an an archived page.");
                }
            }

            const newNode = await this.pageTreeService.createNode(input, category, nonEmptyScopeOrNothing(scope));

            // when no position is passed we are done
            if (!Number.isInteger(input.pos)) {
                return newNode;
            }
            // when a position is passed, update all concerened nodes
            await this.pageTreeService.updateNodePosition(newNode.id, { pos: input.pos as number, parentId: newNode.parentId });
            return this.pageTreeNode(newNode.id); // refetch new version
        }
    }

    if (hasNonEmptyScope) {
        @Resolver(() => PageTreeNode)
        class ScopedPageTreeResolver extends PageTreeResolver {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            @ResolveField(() => Scope!)
            scope(@Parent() node: PageTreeNodeInterface): ScopeInterface {
                return node.scope as ScopeInterface;
            }
        }

        return ScopedPageTreeResolver;
    }

    return PageTreeResolver;
}
