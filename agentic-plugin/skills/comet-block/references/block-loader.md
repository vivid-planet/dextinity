# Block Loader Rules

Detailed rules for creating block loaders that fetch server-side data in the site layer. Load this file when a block references an entity by ID and needs to resolve that entity's data at render time.

---

## Overview

A block loader is an async function that runs server-side before the block component renders. It fetches data (typically from the Comet GraphQL API via `graphQLFetch`) and attaches the result to the block's data under a `loaded` property. The `recursivelyLoadBlockData` utility walks the block tree, finds blocks with registered loaders, and runs them in parallel.

---

## When to use

| Scenario                                                             | Use a block loader? |
| -------------------------------------------------------------------- | ------------------- |
| Block stores an entity ID and needs the entity's data at render time | Yes                 |
| Block stores a list of entity IDs and needs to resolve them          | Yes                 |
| Block needs scope-aware server-side data (e.g., page tree nodes)     | Yes                 |
| Block only contains static content (text, images, enums)             | No                  |
| Data is already embedded in the block's persisted state              | No                  |

---

## File structure

Each loader lives alongside its block component in the site blocks directory:

```
site/src/.../blocks/
├── MyEntityBlock.tsx              # Site component
├── MyEntityBlock.loader.ts        # Loader function
└── MyEntityBlock.loader.generated.ts  # Auto-generated GraphQL types
```

**Naming convention:** `{BlockName}Block.loader.ts` — matches the site component file name with `.loader` inserted before the extension.

---

## Loader function

### Signature

```ts
import { type BlockLoaderOptions, gql } from "@comet/site-nextjs";
import { type MyBlockData } from "@src/blocks.generated";

import { type GQLMyBlockQuery, type GQLMyBlockQueryVariables } from "./MyBlock.loader.generated";

export type LoadedData = Awaited<ReturnType<typeof loader>>;

export const loader = async ({ blockData, graphQLFetch }: BlockLoaderOptions<MyBlockData>) => {
    // Fetch and return data
};
```

### Key imports

| Import                | Source                       | Purpose                                                                                                             |
| --------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `BlockLoaderOptions`  | `@comet/site-nextjs`         | Types the loader function parameter (provides `blockData`, `graphQLFetch`, `fetch`, and any augmented dependencies) |
| `gql`                 | `@comet/site-nextjs`         | Tagged template literal for GraphQL queries                                                                         |
| Block data type       | `@src/blocks.generated`      | Type for the block's persisted data (`blockData` parameter)                                                         |
| Generated query types | `./MyBlock.loader.generated` | Auto-generated types for the GraphQL query and variables                                                            |

### `LoadedData` type export

Always export the loader's return type so the site component can import it:

```ts
export type LoadedData = Awaited<ReturnType<typeof loader>>;
```

This keeps the component's type in sync with the loader automatically — no manual type definitions needed.

### Accessing additional dependencies

Projects augment `BlockLoaderDependencies` (via module declaration merging in `site/src/util/recursivelyLoadBlockData.ts`) to provide additional context such as `scope` and `pageTreeNodeId`. These are available on the loader's options object:

```ts
export const loader = async ({ blockData, graphQLFetch, scope }: BlockLoaderOptions<MyBlockData>) => {
    // `scope` is available because the project augments BlockLoaderDependencies
};
```

Check the project's `recursivelyLoadBlockData.ts` for the available augmented dependencies.

---

## Common loader patterns

### Single entity by ID

Fetch one entity by its stored ID. Return `null` when the ID is missing or the entity is not found.

```ts
export const loader = async ({ blockData, graphQLFetch }: BlockLoaderOptions<MyEntityBlockData>) => {
    if (!blockData.id) return null;

    const data = await graphQLFetch<GQLMyEntityBlockQuery, GQLMyEntityBlockQueryVariables>(
        gql`
            query MyEntityBlock($id: ID!) {
                myEntity(id: $id) {
                    id
                    title
                    description
                }
            }
        `,
        { id: blockData.id },
    );

    return data.myEntity;
};
```

### Multiple entities by IDs

Fetch a list of entities. Return an empty array when no IDs are stored.

```ts
export const loader = async ({ blockData, graphQLFetch }: BlockLoaderOptions<MyEntityListBlockData>) => {
    if (blockData.ids.length === 0) return [];

    const data = await graphQLFetch<GQLMyEntityListBlockQuery, GQLMyEntityListBlockQueryVariables>(
        gql`
            query MyEntityListBlock($ids: [ID!]!) {
                myEntitiesByIds(ids: $ids) {
                    id
                    title
                    slug
                }
            }
        `,
        { ids: blockData.ids },
    );

    return data.myEntitiesByIds;
};
```

### Scope-aware queries

Use the augmented `scope` dependency when the query requires a content scope.

```ts
export const loader = async ({ graphQLFetch, scope }: BlockLoaderOptions<MyIndexBlockData>) => {
    const data = await graphQLFetch<GQLMyIndexQuery, GQLMyIndexQueryVariables>(
        gql`
            query MyIndex($scope: ContentScopeInput!) {
                myEntities(scope: $scope) {
                    id
                    title
                    path
                }
            }
        `,
        { scope },
    );

    return data.myEntities;
};
```

### Entity with nested block content

When a block loader fetches an entity that has a field containing block data (e.g. a blocks-block such as page content), that nested block data must be passed through `recursivelyLoadBlockData` so that nested blocks' loaders run. Otherwise, nested blocks that depend on loaded data receive `undefined` and may throw or render incorrectly.

This pattern commonly applies to blocks like **GlobalContent**, where the block stores an entity ID and the entity's content field holds a full block tree (e.g. `PageContent`) that may contain blocks with their own loaders.

After fetching the entity, call `recursivelyLoadBlockData` on the nested block field, passing the same dependencies your loader receives (e.g. `scope`, `graphQLFetch`, `fetch`). Use the correct root block type name for the nested content (e.g. `"PageContent"`).

```ts
import { type BlockLoader, gql } from "@comet/site-nextjs";
import { type MyContentBlockData } from "@src/blocks.generated";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";

import { type GQLMyContentQuery, type GQLMyContentQueryVariables } from "./MyContentBlock.loader.generated";

export const loader: BlockLoader<MyContentBlockData> = async ({ blockData, graphQLFetch, scope, fetch }) => {
    if (!blockData.id) return { entity: null };

    const { entity } = await graphQLFetch<GQLMyContentQuery, GQLMyContentQueryVariables>(
        gql`
            query MyContent($id: ID!) {
                entity(id: $id) {
                    id
                    content
                }
            }
        `,
        { id: blockData.id },
    );

    entity.content = await recursivelyLoadBlockData({
        blockData: entity.content,
        blockType: "PageContent",
        scope,
        fetch,
        graphQLFetch,
    });

    return { entity };
};
```

### Exporting additional types

When the site component needs a named type for individual items (e.g., for helper functions or recursive rendering), export it from the loader:

```ts
export type MyEntityItem = GQLMyIndexQuery["myEntities"][number];
export type LoadedData = Awaited<ReturnType<typeof loader>>;
```

---

## Visibility filtering

Entities with a `visible` field or `status` enum must never reach public users when hidden or unpublished. Apply visibility filtering in the loader — this is the last line of defense before data reaches the client.

### Filter in the GraphQL query

The preferred approach is to use GraphQL filter arguments so hidden entities are never transferred over the wire:

```ts
export const loader = async ({ blockData, graphQLFetch }: BlockLoaderOptions<MyEntityBlockData>) => {
    if (!blockData.id) return null;

    const data = await graphQLFetch<GQLMyEntityBlockQuery, GQLMyEntityBlockQueryVariables>(
        gql`
            query MyEntityBlock($id: ID!, $filter: MyEntityFilter) {
                myEntity(id: $id, filter: $filter) {
                    id
                    title
                }
            }
        `,
        {
            id: blockData.id,
            filter: { visible: { equal: true } },
        },
    );

    return data.myEntity ?? null;
};
```

For entities with a `status` enum:

```ts
filter: {
    status: {
        equal: "Published";
    }
}
```

### Filter after fetching

When the API does not support filter arguments on the query (e.g., `byIds` queries), filter in the loader after fetching:

```ts
export const loader = async ({ blockData, graphQLFetch }: BlockLoaderOptions<MyEntityListBlockData>) => {
    if (blockData.ids.length === 0) return [];

    const data = await graphQLFetch<GQLMyEntityListBlockQuery, GQLMyEntityListBlockQueryVariables>(
        gql`
            query MyEntityListBlock($ids: [ID!]!) {
                myEntitiesByIds(ids: $ids) {
                    id
                    title
                    visible
                }
            }
        `,
        { ids: blockData.ids },
    );

    return data.myEntitiesByIds.filter((entity) => entity.visible);
};
```

### Return `null` for hidden single entities

When loading a single entity that turns out to be hidden, return `null`. The site component must handle this gracefully (see "Site component" section below).

---

## Registration

Register the loader in the project's `recursivelyLoadBlockData.ts` wrapper (typically at `site/src/util/recursivelyLoadBlockData.ts`).

### Steps

1. Import the loader function.
2. Add an entry to the `blockLoaders` record, keyed by the **block type name** (the name string passed to `createBlock` in the API, without the `Block` suffix in the key).

```ts
import { type BlockLoader, type BlockLoaderDependencies, recursivelyLoadBlockData as cometRecursivelyLoadBlockData } from "@comet/site-nextjs";
import { type AllBlockNames } from "@src/blocks.generated";
import { loader as myEntityLoader } from "@src/path/to/blocks/MyEntityBlock.loader";

const blockLoaders: Partial<Record<AllBlockNames, BlockLoader>> = {
    // existing loaders...
    MyEntity: myEntityLoader,
};
```

The key must match the block's type name exactly. This is the string used as the last argument in `createBlock(Data, Input, "MyEntity")` in the API layer.

---

## Site component

### Typing

The component receives the loader's return value under `data.loaded`. Type it by intersecting the block data with `{ loaded: LoadedData }`:

```tsx
import { type PropsWithData, withPreview } from "@comet/site-nextjs";
import { type MyEntityBlockData } from "@src/blocks.generated";

import { type LoadedData } from "./MyEntityBlock.loader";

export const MyEntityBlock = withPreview(
    ({ data: { loaded } }: PropsWithData<MyEntityBlockData & { loaded: LoadedData }>) => {
        if (!loaded) return null;

        return <div>{loaded.title}</div>;
    },
    { label: "My Entity" },
);
```

### Null handling

When the loader returns `null` (entity missing, hidden, or unpublished), the component must handle it gracefully:

- **Single entity:** Check `!loaded` and return `null` (render nothing).
- **List of entities:** Check `loaded.length === 0` and return `null` or a fallback.

Never assume `loaded` contains data — the referenced entity may have been deleted or unpublished since the block was saved.

### Destructuring the `loaded` property

Rename `loaded` to a descriptive variable during destructuring for readability:

```tsx
({ data: { loaded: product } }: PropsWithData<ProductBlockData & { loaded: LoadedData }>)

({ data: { loaded: newsList } }: PropsWithData<NewsListBlockData & { loaded: LoadedData }>)
```

---

## Checklist

Use this checklist when creating a block loader:

1. Create `{BlockName}Block.loader.ts` alongside the site component.
2. Export `loader` as a named `const` (async function).
3. Export `LoadedData` type alias (`Awaited<ReturnType<typeof loader>>`).
4. Handle empty/missing input (`!blockData.id` → return `null`, empty IDs array → return `[]`).
5. Apply visibility filtering (prefer query-level filters; fall back to post-fetch filtering).
6. Register the loader in `site/src/util/recursivelyLoadBlockData.ts`.
7. Update the site component to type `data` as `BlockData & { loaded: LoadedData }`.
8. Handle `null`/empty `loaded` in the component — render nothing or a fallback.
