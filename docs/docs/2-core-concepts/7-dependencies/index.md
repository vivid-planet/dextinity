---
title: Block Index / Dependencies
sidebar_position: 7
---

# Block Index / Dependencies

Blocks can have references to entities.
But since block data is stored as JSON, there is no actual database relationship.

If you still need to know which entities a block references or in which blocks an entity is used, you can use Dextinity's block index.

---

## Configuration Guide

Follow the upcoming guide if you want to

- make the "Dependents" tab in the DAM work
- display the dependencies or dependents of an entity somewhere in your admin app

### Configuring the block index

#### 1. API: Register fields to be added to the block index

First, you must "tell" the block index which database fields contain block data.
It will scan these fields for dependency information.

To do that, you must

- Annotate the entity with `@RootBlockEntity()`
- Annotate all columns containing block data with `@RootBlock(ExampleBlock)`

For example:

```diff
+   @RootBlockEntity()
    export class News extends BaseEntity {
        // ...

+       @RootBlock(DamImageBlock)
        @Property({ type: new RootBlockType(DamImageBlock) })
        @Field(() => RootBlockDataScalar(DamImageBlock))
        image: BlockDataInterface;

+       @RootBlock(NewsContentBlock)
        @Property({ type: new RootBlockType(NewsContentBlock) })
        @Field(() => RootBlockDataScalar(NewsContentBlock))
        content: BlockDataInterface;

        // ...
    }
```

#### 2. Create the block index

You must then create the block index by calling `npm run console createBlockIndexViews` in your `/api` directory.
This creates a materialized view called `block_index_dependencies` in your database.

You must recreate the block index views after

- executing database migrations
- executing the fixtures (because they drop the whole database and recreate it)

You can automate this process by following the steps in the [migration guide](/docs/migration-guide/migration-from-v5-to-v6/#block-index).
For new projects, it should already be automated.

### Providing dependency information

If your block depends on certain entities, you should provide dependency information.
You can do that using the `indexData()` method in your block data class like this:

```ts
class MyCustomBlockData extends BlockData {
    // ...

    indexData(): BlockIndexData {
        if (this.damFileId === undefined) {
            return {};
        }

        return {
            dependencies: [
                {
                    targetEntityName: DamFile.name,
                    id: this.damFileId,
                },
            ],
        };
    }
}
```

This works for all entities - not just `DamFile`.

### Displaying dependencies in the admin interface

Next, you probably want to display the dependencies or dependents (usages) of an entity in the admin interface.

#### 1. API: Add `@EntityInfo()` to entity

The `@EntityInfo()` decorator allows you to configure which information about an entity should be displayed in the admin interface.
You can provide a `name` and `secondaryInformation`.

##### Object-based (recommended)

Pass an object with dot-notation field paths. Supports direct fields as well as ManyToOne/OneToOne relations and embeddables.

```ts
// news.entity.ts
@EntityInfo<News>({ name: "title", secondaryInformation: "slug" })
```

Use the `visible` field (a MikroORM `ObjectQuery`) to control whether the entity is considered visible in dependency/warning lists:

```ts
@EntityInfo<News>({ name: "title", secondaryInformation: "slug", visible: { status: { $eq: NewsStatus.active } } })
```

Dot-notation resolves nested relations and embeddables:

```ts
@EntityInfo<Product>({ name: "title", secondaryInformation: "manufacturer.name" })
```

##### Raw SQL string

For cases where the object syntax is insufficient (e.g. when entity info is computed from a dedicated SQL view), pass a raw `SELECT` statement.
The query must return the columns `name`, `secondaryInformation`, `visible`, `id`, and `entityName`:

```ts
@EntityInfo<DamFile>(`SELECT "name", "secondaryInformation", "visible", "id", 'DamFile' AS "entityName" FROM "DamFileEntityInfo"`)
```

##### Documents (Page, Link, etc.)

Document entities do **not** need an `@EntityInfo()` decorator.
Their entity info is derived automatically from the `PageTreeNodeEntityInfo` SQL view, which resolves the page tree name and path for you.

#### 2. Admin: Implement the `DependencyInterface`

The DependencyInterface requires a translatable `displayName` and a `resolvePath()` method.
`resolvePath` provides a URL path to the edit page of an entity or a specific block.

<details>

<summary>Example of a `resolvePath` method</summary>

```tsx
// NewsDependency.tsx
export const NewsDependency: DependencyInterface = {
    displayName: <FormattedMessage id="news.displayName" defaultMessage="News" />,
    resolvePath: async ({ apolloClient, id, rootColumnName, jsonPath }) => {
        const { data, error } = await apolloClient.query<
            GQLNewsDependencyQuery,
            GQLNewsDependencyQueryVariables
        >({
            query: gql`
                query NewsDependency($id: ID!) {
                    news(id: $id) {
                        id
                        content
                    }
                }
            `,
            variables: {
                id,
            },
        });

        if (error) {
            throw new Error(`News.getUrl: Could not find a News with id ${id}`);
        }

        let dependencyPath = "";
        if (rootColumnName === "content") {
            dependencyPath = `form/${NewsContentBlock.resolveDependencyPath(
                NewsContentBlock.input2State(data.news.content),
                jsonPath.substring("root.".length),
            )}`;
        }

        return `/structured-content/news/${data.news.id}/edit/${dependencyPath}`;
    },
};
```

</details>

Usually, you don't have to write the `resolvePath` method yourself.
Instead, use one of our helpers:

##### `createDependencyMethods`

For most entities, you can use the `createDependencyMethods` helper.

The `rootQueryName` specifies the name of the GraphQL query used to load the entity.
It should normally be the camelCase version of the entity name.

The `rootBlocks` specify which of the entity's fields contain block data.
These should be the same fields you annotated with `@RootBlock()` in the API.
You must also specify the used Block and - if necessary - the path under which the block is available.

The `basePath` option specifies the URL path to the entity's edit page.

```tsx
// NewsDependency.tsx
import { createDependencyMethods } from "@dextinity/cms-admin";

// ...

export const NewsDependency: DependencyInterface = {
    displayName: <FormattedMessage id="news.displayName" defaultMessage="News" />,
    ...createDependencyMethods({
        rootQueryName: "news",
        rootBlocks: { content: { block: NewsContentBlock, path: "/form" }, image: DamImageBlock },
        basePath: ({ id }) => `/structured-content/news/${id}/edit`,
    }),
};
```

##### `createDocumentDependencyMethods`

For document types you can use the `createDocumentDependencyMethods` helper.
It loads the document and also the `PageTreeNode` the document is attached to.

```tsx
// Page.tsx
import { createDocumentDependencyMethods } from "@dextinity/cms-admin";

// ...

export const Page: DocumentInterface<Pick<GQLPage, "content" | "seo">, GQLPageInput> &
    DependencyInterface = {
    // ...
    ...createDocumentDependencyMethods({
        rootQueryName: "page",
        rootBlocks: {
            content: PageContentBlock,
            seo: { block: SeoBlock, path: "/config" },
        },
        basePath: ({ pageTreeNode }) =>
            `/pages/pagetree/${categoryToUrlParam(pageTreeNode.category)}/${pageTreeNode.id}/edit`,
    }),
};
```

#### 3. Admin: Register the `DependencyInterface` at the `DependenciesConfigProvider`

The key must be the name of the GraphQL object type associated with the entity.

```tsx
// App.tsx
// ...
<DependenciesConfigProvider
    entityDependencyMap={{
        // ...
        News: NewsDependency,
    }}
>
    // ...
</DependenciesConfigProvider>
// ...
```

Now, the DAM's "Dependents" tab should work.
If that was your goal, you can stop here.
Otherwise, continue following the guide.

#### 4. API: Add field resolvers

If you want to query the dependencies or dependents of an entity, use the factories provided by the library.
**Only do this where it makes sense.**

```ts
// news.module.ts
@Module({
    // ...
    providers: [
        // ...
        DependenciesResolverFactory.create(News),
        DependentsResolverFactory.create(News),
    ],
})
export class NewsModule {}
```

#### 5. Admin: Display dependencies with `DependenciesList` or `DependentsList`

Use `DependenciesList` to display what an entity depends on, or `DependentsList` to display what depends on an entity. Both components are provided by `@dextinity/cms-admin`. The DAM uses `DependentsList` in its "Dependents" tab.

Each component requires two props:

- `query`: A GraphQL query. `DependenciesList` requires a `dependencies` field resolver; `DependentsList` requires a `dependents` field resolver.
- `variables`: The variables for the query.

<details>

<summary>A usage could look like this</summary>

```tsx
<DependentsList
    query={gql`
        query DamFileDependents(
            $id: ID!
            $offset: Int!
            $limit: Int!
            $forceRefresh: Boolean = false
            $filter: DependentFilter
            $sort: [DependencySort!]
        ) {
            item: damFile(id: $id) {
                id
                dependents(offset: $offset, limit: $limit, forceRefresh: $forceRefresh, filter: $filter, sort: $sort) {
                    nodes {
                        rootGraphqlObjectType
                        rootId
                        rootColumnName
                        jsonPath
                        name
                        secondaryInformation
                        visible
                    }
                    totalCount
                }
            }
        }
    `}
    variables={{
        id: id,
    }}
/>
```

</details>
