---
title: Full Text Search
---

# Full Text Search

:::caution Experimental
The Full Text Search module is experimental. Its API may change in future releases.
:::

## Introduction

The `FullTextSearchModule` provides a simple, PostgreSQL-native full text search for Dextinity applications. It uses PostgreSQL's built-in `tsvector` type and full text index — no external search engine required.

**This module is not a replacement for Elasticsearch-based search.** It is intentionally simple and suitable for moderate content sizes. Consider it when:

- You need a **global search bar in the admin header** to find any content item across entity types.
- You are building an **MCP server** that needs to locate content by keyword.
- You need **site search** and the content volume is small enough that Elasticsearch would be overkill.

For large catalogs, complex relevance tuning, faceted filtering, or multilingual stemming, use a dedicated search engine instead.

### How it works

The module builds on two PostgreSQL views that are created by running the `createBlockIndexViews` console command (executed after database migrations):

- **`EntityInfo`** — always created by the core framework (not specific to `FullTextSearchModule`). It provides display data for every entity decorated with `@EntityInfo`: `name`, `secondaryInformation`, `visible`, `id`, `entityName`, and `requiredPermission`.

- **`EntityInfoFullText`** — created only when `FullTextSearchModule` is imported. It is a `UNION ALL` of all entities that have a `fullText` column referenced in their `@EntityInfo` decorator. Each row contains `id`, `entityName`, `type`, the `tsvector` value, `requiredPermission`, and `scopes`. It joins back to the `EntityInfo` view to read display data such as `name` and `secondaryInformation`.

The `type` column is the entity name for entities. For page tree nodes, it is the node's `documentType` (e.g. `Page` or `Link`), so search results can be filtered by document type. Page tree nodes are always part of the view, also when their document has no full text (e.g. a `Link`). Such nodes, and nodes saved before their full text was stored, are matched by their name and slug.

Because both are standard PostgreSQL views (not materialized views), they always reflect the current state of the underlying tables — no manual refresh is needed when content changes.

## Usage

### API

#### 1. Add the module

Import `FullTextSearchModule` in your root `AppModule`:

```typescript title="app.module.ts"
import { FullTextSearchModule } from "@dextinity/cms-api";

@Module({
    imports: [
        // ...
        FullTextSearchModule,
    ],
})
export class AppModule {}
```

#### 2. Add a full text column to an entity

Each entity you want to make searchable needs:

1. A `tsvector` column to store the index (maintained automatically by MikroORM's `onCreate`/`onUpdate` hooks).
2. The `@EntityInfo` decorator to register the entity with the module.

```typescript title="news.entity.ts"
import { EntityInfo, entityToMikroOrmFullText } from "@dextinity/cms-api";
import { FullTextType, Index, Property } from "@mikro-orm/postgresql";

@EntityInfo<News>({
    name: "title", // field shown as the result title
    secondaryInformation: "slug", // optional subtitle shown below the title
    visible: { status: { $eq: NewsStatus.active } }, // optional filter: only index visible items
    fullText: "fullText", // name of the tsvector column below
})
@Entity()
export class News extends BaseEntity {
    // ... other fields ...

    @Index({ type: "fulltext" })
    @Property<News>({
        nullable: true,
        type: new FullTextType(),
        onCreate: (news) => entityToMikroOrmFullText({ A: news.title, D: news.slug }, news.content),
        onUpdate: (news) => entityToMikroOrmFullText({ A: news.title, D: news.slug }, news.content),
    })
    fullText?: string;
}
```

The `entityToMikroOrmFullText` helper builds the weighted `tsvector` value. It accepts:

- A `WeightedFullTextValue` object mapping PostgreSQL weight letters (`A`–`D`) to plain-text strings. Weight `A` is the most relevant, `D` the least.
- Zero or more block data objects (see below).

#### 3. Enable full text search on the page tree (optional)

If your application uses `PageTreeModule`, pass `fullText: true` to its configuration to include page tree nodes and their documents in search results:

```typescript title="app.module.ts"
PageTreeModule.forRoot({
    // ...
    fullText: true,
}),
```

#### 4. Grant the permission

The `fullTextSearch` GraphQL query requires the `fullTextSearch` permission. Add it to the appropriate roles in your user permissions configuration.

A user only finds an entity if they have one of the permissions its resolver requires (`@RequiredPermission`), for the scope of the entity. For example, a user who has the `pageTree` permission only for the `main` domain doesn't find pages of other domains. Entities without a scope only require the permission.

#### 5. The GraphQL query

Once the module is set up, the `fullTextSearch` query is available:

```graphql
query Search($search: String!, $scope: JSONObject, $types: [String!]) {
    fullTextSearch(search: $search, scope: $scope, types: $types, limit: 10) {
        totalCount
        types {
            type
            entityName
            count
        }
        nodes {
            id
            entityName
            type
            name
            secondaryInformation
            titleMatch
            title {
                text
                highlights {
                    start
                    end
                }
            }
            snippet {
                text
                truncatedStart
                truncatedEnd
                highlights {
                    start
                    end
                }
            }
        }
    }
}
```

Arguments:

- `search`: the search text, at most 200 characters. All words must match. The last word matches as a prefix, so `Navig` finds `Navigation`.
- `scope`: restricts the results to a content scope. Entities without a scope, for instance products, are part of every scope.
- `types`: restricts the results to these types, for instance `["Page", "News"]`.
- `offset` and `limit`: pagination. `limit` defaults to 25 and can be at most 50, because a snippet is built for every result.

Each result contains:

- `entityName`: the entity, e.g. `PageTreeNode` or `News`. Use it together with `id` to open the result.
- `type`: the type shown to the user: the document type for page tree nodes (`Page`, `Link`, …), otherwise the entity name.
- `title`: the name with the matching words highlighted. `titleMatch` is `true` when the name matches the search.
- `snippet`: the paragraph of the content that matches best, cut to about 160 characters, with the matching words highlighted. It's `null` when no paragraph matches. `truncatedStart` and `truncatedEnd` tell whether the text was cut, so clients can render an ellipsis.

The highlights are UTF-16 offsets into `text`, with an exclusive `end`. The text is plain text, never HTML, so render it as text.

The results are ordered as follows:

1. Results whose name equals the search, then results whose name contains all words, then results whose name contains some words.
2. Within each group, by `ts_rank` of the full text, where weight `A` counts most.
3. By the length of the name, the entity name and the id, so pagination is stable.

`types` holds the number of results per type. It ignores the `types` argument, so clients can show the counts as filter options. `totalCount` is the number of results for the selected types.

Ids are only unique per entity. When caching results with Apollo Client, use `fetchPolicy: "no-cache"` or `keyFields: ["entityName", "id"]` for `FullTextSearchResult`.

:::note Deprecated
The `myFullTextSearch` query is deprecated and will be removed in version 11. Use `fullTextSearch` instead. `myFullTextSearch` returns the results in the same order as `fullTextSearch`.
:::

#### 6. Snippet sources

The snippet is built from the text of the entity:

- The text of the root blocks of the entity (for page tree nodes: of the attached document), in the order the root blocks are declared and in the order of the content.
- The result of the `onUpdate` (or `onCreate`) callback of the full text property. The block texts that `entityToMikroOrmFullText` appends are left out, because they are part of the root block texts already.

Texts that equal the name or the secondary information are left out, because the result shows them already.

The callback is called again when the snippet is built. Keep full text callbacks pure: they must not change the entity and must not depend on relations that may not be loaded.

### How to index blocks

Block content is indexed by extracting all text from the block tree and weighting it by heading level:

| HTML heading | PostgreSQL weight |
| ------------ | ----------------- |
| `h1`         | A (highest)       |
| `h2`         | B                 |
| `h3`         | C                 |
| `h4`–`h6`, other text | D (lowest) |

Pass block data directly to `entityToMikroOrmFullText` as additional arguments after the weighted fields object:

```typescript
entityToMikroOrmFullText(
    { A: news.title, D: news.slug }, // plain text fields with explicit weights
    news.content,                    // block data — text extracted and weighted automatically
    news.teaser,                     // additional blocks can be added
)
```

Text extraction works by traversing the block tree depth-first and calling `searchText()` on each visible block. Built-in blocks such as `createRichTextBlock` already implement this method. For custom blocks, implement `searchText()` on the `BlockData` class to return the text that should be indexed:

```typescript title="teaser.block.ts"
import { BlockData, BlockInput, SearchText, blockInputToData, createBlock } from "@dextinity/cms-api";

class TeaserBlockData extends BlockData {
    @BlockField()
    heading: string;

    @BlockField()
    text: string;

    searchText(): SearchText[] {
        return [
            { weight: "h2", text: this.heading },
            this.text, // plain string — indexed with weight "other" (D)
        ];
    }
}
```

Child blocks do not need to collect their children's text manually — the traversal handles that automatically.

### Admin

#### Search bar in the admin header

`@dextinity/cms-admin` exports a ready-to-use `SearchHeaderItem` component. Add it to your application's `Header`:

```tsx title="MasterHeader.tsx"
import { BuildEntry, ContentScopeControls, Header, SearchHeaderItem, UserHeaderItem } from "@dextinity/cms-admin";

const MasterHeader = () => {
    return (
        <Header>
            <SearchHeaderItem />
            <ContentScopeControls />
            <BuildEntry />
            <UserHeaderItem />
        </Header>
    );
};
```

The header shows a search field that opens the search in a dialog. <kbd>Ctrl</kbd>+<kbd>K</kbd> (<kbd>⌘</kbd>+<kbd>K</kbd> on macOS) opens it from anywhere in the admin.

The dialog shows a tab per type with its number of results. Selecting a tab shows only the results of that type. The results are grouped by type, and each result shows the title and a snippet with the matching words highlighted. With the gear button next to the search field, users choose which types are searched. The choice is stored in the browser's local storage.

The labels of the types and the links to the results come from the `entityDependencyMap` of the `DextinityConfigProvider`:

- The label of a type is the `displayName` of `entityDependencyMap[type]`, or of `entityDependencyMap[entityName]` if there is no entry for the type. For page tree nodes, the document types (e.g. `Page`) are the keys. Without an entry, the type is shown in capital case.
- A result is opened with the `resolvePath` of `entityDependencyMap[entityName]`. Results without an entry are shown, but can't be opened.

```tsx title="App.tsx"
<DextinityConfigProvider
    dependencies={{
        entityDependencyMap: {
            Page,
            Link,
            PageTreeNode: PageTreeNodeDependency,
            News: NewsDependency,
            Product: ProductDependency,
        },
    }}
>
```

### Site

Unlike the admin search bar, there is no ready-to-use resolver or block for site search. You need to implement both in your application. Dextinity provides the services behind the `fullTextSearch` query, so the resolver gets the same ranking, type counts and snippets:

- `FullTextSearchQueryService` finds and orders the matching rows and counts them per type.
- `FullTextSnippetService` builds the highlighted titles and snippets for these rows.

Site search must also be publicly accessible without user authentication. The built-in `fullTextSearch` query enforces permission checks and is therefore only suitable for the admin. For site search, you expose a separate resolver that skips permission checks but explicitly restricts the result set to entities whose content is meant to be publicly visible.

#### 1. Create a public resolver

Create a new resolver and mark it with `@RequiredPermission(DisablePermissionCheck)` to make it accessible without authentication. `FullTextSearchQueryService` only returns rows whose entity requires one of the given `permissions`, in one of the permission's `contentScopes`. So pass the permissions of the entities that may appear in public results, for the scope of the site:

```typescript title="site-full-text-search.resolver.ts"
import {
    ContentScope,
    DisablePermissionCheck,
    FullTextSearchQueryService,
    FullTextSearchResults,
    FullTextSnippetService,
    RequiredPermission,
} from "@dextinity/cms-api";
import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";

// The required permissions of the entities whose content is meant to be publicly searchable
const publiclySearchablePermissions = ["pageTree", "news"];

@Resolver(() => FullTextSearchResults)
export class SiteFullTextSearchResolver {
    constructor(
        private readonly fullTextSearchQueryService: FullTextSearchQueryService,
        private readonly fullTextSnippetService: FullTextSnippetService,
    ) {}

    @Query(() => FullTextSearchResults)
    @RequiredPermission(DisablePermissionCheck)
    async siteFullTextSearch(
        @Args("search") search: string,
        @Args("offset", { type: () => Int, defaultValue: 0 }) offset: number,
        @Args("limit", { type: () => Int, defaultValue: 25 }) limit: number,
        @Args("scope", { type: () => GraphQLJSONObject }) scope: ContentScope,
    ): Promise<FullTextSearchResults> {
        const { rows, totalCount, types } = await this.fullTextSearchQueryService.search({
            search,
            scope,
            offset,
            limit: Math.min(limit, 50),
            permissions: publiclySearchablePermissions.map((permission) => ({ permission, contentScopes: [scope] })),
            includeInvisible: false,
        });
        const nodes = await this.fullTextSnippetService.buildResults(rows, search);

        return new FullTextSearchResults({ nodes, totalCount, types });
    }
}
```

Validate `search` in a real application, for instance with an `@ArgsType` that limits its length like `FullTextSearchArgs` does.

Register the resolver in its own module and import it in `AppModule` alongside `FullTextSearchModule`:

```typescript title="site-full-text-search.module.ts"
import { Module } from "@nestjs/common";
import { SiteFullTextSearchResolver } from "./site-full-text-search.resolver";

@Module({
    providers: [SiteFullTextSearchResolver],
})
export class SiteFullTextSearchModule {}
```

#### 2. Create a FullTextSearch block (API)

The search UI on the site is rendered by a block placed in the page content. The block itself carries no data — it is just a marker that tells the site to render the search component at that position:

```typescript title="full-text-search.block.ts"
import { BlockData, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";

class FullTextSearchBlockData extends BlockData {}

class FullTextSearchBlockInput extends BlockInput {
    transformToBlockData(): FullTextSearchBlockData {
        return blockInputToData(FullTextSearchBlockData, this);
    }
}

export const FullTextSearchBlock = createBlock(FullTextSearchBlockData, FullTextSearchBlockInput, "FullTextSearch");
```

Add it to your page content block's `supportedBlocks` map:

```typescript title="page-content.block.ts"
import { FullTextSearchBlock } from "@src/common/blocks/full-text-search.block";

const supportedBlocks = {
    // ... other blocks
    fullTextSearch: FullTextSearchBlock,
};
```

#### 3. Create a FullTextSearch block (Admin)

On the admin side, create a minimal block definition so editors can place the search component on a page:

```typescript title="FullTextSearchBlock.tsx"
import { type BlockInterface, createBlockSkeleton } from "@dextinity/cms-admin";
import type { FullTextSearchBlockData, FullTextSearchBlockInput } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

export const FullTextSearchBlock: BlockInterface<FullTextSearchBlockData, Record<string, never>, FullTextSearchBlockInput> = {
    ...createBlockSkeleton(),
    name: "FullTextSearch",
    displayName: <FormattedMessage id="blocks.fullTextSearch" defaultMessage="Full Text Search" />,
    defaultValues: () => ({}),
};
```

#### 4. Create a FullTextSearch block (Site)

The site block component is a client component that renders the search input, debounces the query, fetches results from `siteFullTextSearch`, and renders them as links.

Search results do not carry a target URL. Derive the path from the entity type using `secondaryInformation`, which holds the routing key configured via `@EntityInfo` — the page-tree path for `PageTreeNode` entries and the slug for `News`:

```typescript title="FullTextSearchBlock.tsx"
"use client";
import { gql, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { FullTextSearchBlockData } from "@src/blocks.generated";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const fullTextSearchQuery = gql`
    query FullTextSearch($search: String!, $scope: JSONObject!) {
        siteFullTextSearch(search: $search, scope: $scope) {
            nodes {
                id
                entityName
                name
                secondaryInformation
            }
            totalCount
        }
    }
`;

type SearchResult = { id: string; entityName: string; name: string; secondaryInformation?: string | null };

export const FullTextSearchBlock = withPreview(
    (_props: PropsWithData<FullTextSearchBlockData>) => {
        const intl = useIntl();
        const params = useParams<{ domain: string; language: string }>();
        const [query, setQuery] = useState("");
        const [results, setResults] = useState<SearchResult[]>([]);
        const [totalCount, setTotalCount] = useState(0);
        const [isLoading, setIsLoading] = useState(false);
        const [hasSearched, setHasSearched] = useState(false);

        useEffect(() => {
            const search = query.trim();

            if (search.length === 0) {
                setResults([]);
                setTotalCount(0);
                setHasSearched(false);
                setIsLoading(false);
                return;
            }

            let isCurrent = true;
            setIsLoading(true);

            const timeout = setTimeout(async () => {
                const graphQLFetch = createGraphQLFetch();
                try {
                    const { siteFullTextSearch } = await graphQLFetch(fullTextSearchQuery, {
                        search,
                        scope: { domain: params?.domain, language: params?.language },
                    });
                    if (isCurrent) {
                        setResults(siteFullTextSearch.nodes);
                        setTotalCount(siteFullTextSearch.totalCount);
                        setHasSearched(true);
                    }
                } finally {
                    if (isCurrent) setIsLoading(false);
                }
            }, 300);

            return () => {
                isCurrent = false;
                clearTimeout(timeout);
            };
        }, [query, params]);

        return (
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={intl.formatMessage({ id: "fullTextSearch.placeholder", defaultMessage: "Search…" })}
            />
            // render isLoading, hasSearched, results, totalCount …
        );
    },
    { label: "Full Text Search" },
);
```

Register the block in your page content block's `supportedBlocks` map on the site:

```typescript title="PageContentBlock.tsx"
import { FullTextSearchBlock } from "@src/common/blocks/FullTextSearchBlock";

const supportedBlocks: SupportedBlocks = {
    // ... other blocks
    fullTextSearch: (props) => <FullTextSearchBlock data={props} />,
};
```
