import { createPageTreeNodeEntity, PageTreeNodeBase } from "@dextinity/cms-api";
import { Entity, Enum } from "@mikro-orm/postgresql";
import { Field, ObjectType } from "@nestjs/graphql";
import { UserGroup } from "@src/user-groups/user-group";

import { PageTreeNodeScope } from "../dto/page-tree-node-scope";
import { PageTreeNodeCategory } from "../page-tree-node-category";

@Entity({ abstract: true })
@ObjectType({ isAbstract: true })
abstract class PageTreeNodeWithUserGroup extends PageTreeNodeBase {
    @Enum({ items: () => UserGroup })
    @Field(() => UserGroup, { defaultValue: UserGroup.all })
    userGroup: UserGroup;
}

export const PageTreeNode = createPageTreeNodeEntity({ Base: PageTreeNodeWithUserGroup, Scope: PageTreeNodeScope, Category: PageTreeNodeCategory });
export type PageTreeNode = InstanceType<typeof PageTreeNode>;
