import { PageTreeNodeInterface, PageTreeReadApiService, RequiredPermission } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category";

import { MainMenuObject } from "./dto/main-menu.object";
import { MainMenuItem } from "./entities/main-menu-item.entity";

@Resolver(() => MainMenuObject)
@RequiredPermission("pageTree")
export class MenusResolver {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeReadApi: PageTreeReadApiService,
    ) {}

    @Query(() => MainMenuObject)
    async mainMenu(@Args("scope", { type: () => PageTreeNodeScope }) scope: PageTreeNodeScope): Promise<MainMenuObject> {
        await this.pageTreeReadApi.preloadNodes(scope);
        const rootNodes = await this.pageTreeReadApi.pageTreeRootNodeList({
            scope,
            excludeHiddenInMenu: true,
            category: PageTreeNodeCategory.mainNavigation,
        });

        const items = await Promise.all(
            rootNodes.map<Promise<MainMenuItem>>(async (node) => {
                const item = await this.entityManager.findOne(MainMenuItem, {
                    node: node as unknown as PageTreeNode,
                });
                return (
                    item ??
                    this.entityManager.create(MainMenuItem, {
                        node: node as PageTreeNode,
                        content: null,
                    })
                ); // @TODO: implement PageTreeService<PageTreeNode> to avoid "as"
            }),
        );

        return {
            items,
        };
    }

    @Query(() => [PageTreeNode])
    async topMenu(@Args("scope", { type: () => PageTreeNodeScope }) scope: PageTreeNodeScope): Promise<PageTreeNodeInterface[]> {
        //don't preloadNodes for topMenu as that consists only of a few nodes (and preloading would be more expensive than doing live queries)
        return this.pageTreeReadApi.pageTreeRootNodeList({ scope, category: PageTreeNodeCategory.mainNavigation, excludeHiddenInMenu: true });
    }
}
