---
"@dextinity/cms-api": major
---

Add `createPageTreeNodeEntity` to create the page tree node entity

`PageTreeNodeBase` no longer defines the `parent` relation, since it has to reference the application's page tree node entity.
Create the entity with `createPageTreeNodeEntity` instead of extending `PageTreeNodeBase`.
It defines the `parent` relation, the `scope` and the `category`:

```ts
// Before
@Entity({ tableName: PageTreeNodeBase.tableName })
@ObjectType("PageTreeNode")
export class PageTreeNode extends PageTreeNodeBase {
    @Embedded(() => PageTreeNodeScope)
    @Field(() => PageTreeNodeScope)
    scope: PageTreeNodeScope;

    @ManyToOne(() => PageTreeNode, { nullable: true, joinColumn: "parentId" })
    @Index()
    parent?: PageTreeNode;

    @Enum({ items: () => PageTreeNodeCategory })
    @Field(() => PageTreeNodeCategory)
    category: PageTreeNodeCategory;
}

// After
export const PageTreeNode = createPageTreeNodeEntity({ Scope: PageTreeNodeScope, Category: PageTreeNodeCategory });
export type PageTreeNode = InstanceType<typeof PageTreeNode>;
```

Application-specific properties go into an abstract entity extending `PageTreeNodeBase`, which is passed as `Base`:

```ts
@Entity({ abstract: true })
@ObjectType({ isAbstract: true })
abstract class PageTreeNodeWithUserGroup extends PageTreeNodeBase {
    @Enum({ items: () => UserGroup })
    @Field(() => UserGroup, { defaultValue: UserGroup.all })
    userGroup: UserGroup;
}

export const PageTreeNode = createPageTreeNodeEntity({ Base: PageTreeNodeWithUserGroup, Scope: PageTreeNodeScope, Category: PageTreeNodeCategory });
```
