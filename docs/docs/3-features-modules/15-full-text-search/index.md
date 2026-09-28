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

- **`EntityInfoFullText`** — created only when `FullTextSearchModule` is imported. It is a `UNION ALL` of all entities that have a `fullText` column referenced in their `@EntityInfo` decorator. Each row contains `id`, `entityName`, the `tsvector` value, `requiredPermission`, and `scopes`. It joins back to the `EntityInfo` view to read display data such as `name` and `secondaryInformation`.

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

The `myFullTextSearch` GraphQL query requires the `fullTextSearch` permission. Add it to the appropriate roles in your user permissions configuration.

#### 5. The GraphQL query

Once the module is set up, the following query is available:

```graphql
query MySearch($search: String!, $scope: JSONObject) {
    myFullTextSearch(search: $search, scope: $scope, limit: 10) {
        nodes {
            id
            entityName
            name
            secondaryInformation
        }
        totalCount
    }
}
```

The optional `scope` parameter restricts results to a specific content scope.

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

### Site

Unlike the admin search bar, there is no ready-to-use resolver or block for site search. You need to implement both in your application. Dextinity does provide the underlying PostgreSQL views (`EntityInfoFullTextObject`) and the GraphQL types (`PaginatedEntityInfo`, `EntityInfoObject`) that you can build on, so the integration is straightforward.

Site search must also be publicly accessible without user authentication. The built-in `myFullTextSearch` query enforces permission checks and is therefore only suitable for the admin. For site search, you expose a separate resolver that skips permission checks but explicitly restricts the result set to entities whose content is meant to be publicly visible.

#### 1. Create a public resolver

Create a new resolver that uses `EntityInfoFullTextObject` and `PaginatedEntityInfo` from `@dextinity/cms-api`. Mark it with `@RequiredPermission(DisablePermissionCheck)` to make it accessible without authentication, and explicitly list which entity types may appear in results:

```typescript title="site-full-text-search.resolver.ts"
import {
    ContentScope,
    DisablePermissionCheck,
    EntityInfoFullTextObject,
    EntityInfoObject,
    PaginatedEntityInfo,
    RequiredPermission,
} from "@dextinity/cms-api";
import { EntityManager, type FilterQuery } from "@mikro-orm/postgresql";
import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";

// Only list entities whose content is meant to be publicly searchable.
const searchableEntityNames = ["PageTreeNode", "News"];

@Resolver(() => EntityInfoObject)
export class SiteFullTextSearchResolver {
    constructor(private readonly entityManager: EntityManager) {}

    @Query(() => PaginatedEntityInfo)
    @RequiredPermission(DisablePermissionCheck)
    async siteFullTextSearch(
        @Args("search") search: string,
        @Args("offset", { type: () => Int, defaultValue: 0 }) offset: number,
        @Args("limit", { type: () => Int, defaultValue: 25 }) limit: number,
        @Args("scope", { type: () => GraphQLJSONObject, nullable: true }) scope?: ContentScope,
    ): Promise<PaginatedEntityInfo> {
        const where: FilterQuery<EntityInfoFullTextObject> = {
            fullText: { $fulltext: search },
            entityName: { $in: searchableEntityNames },
            entityInfo: { visible: true },
        };

        if (scope) {
            // GraphQL sends the scope object with a null prototype, which breaks MikroORM's
            // internal hasOwnProperty calls. Spreading into a plain object fixes this.
            where.scopes = { $contains: [{ ...scope }] };
        }

        const [matches, totalCount] = await this.entityManager.findAndCount(EntityInfoFullTextObject, where, {
            offset,
            limit,
            populate: ["entityInfo"],
        });

        return new PaginatedEntityInfo(
            matches.map((match) => match.entityInfo),
            totalCount,
        );
    }
}
```

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
