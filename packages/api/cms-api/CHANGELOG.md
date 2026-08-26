# @comet/cms-api

## 10.1.0

## 10.0.1

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/cms-api` to `@dextinity/cms-api`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename `CometException` and its subclasses: `CometValidationException` -> `DextinityValidationException`, `CometEntityNotFoundException` -> `DextinityEntityNotFoundException`, `CometImageResolutionException` -> `DextinityImageResolutionException`. The error codes returned by the API change accordingly, so a matching `@dextinity/cms-admin` version is required
    - Rename `CometAuthGuard` to `DextinityAuthGuard` and the `@DisableCometGuards()` decorator to `@DisableDextinityGuards()`
    - Rename the database tables `CometFileUpload`, `CometUserPermission` and `CometUserContentScopes` to `DextinityFileUpload`, `DextinityUserPermission` and `DextinityUserContentScopes`. A migration is shipped with the package, so running the migrations is sufficient
    - Rename the site preview cookie from `__comet_site_preview` to `__dextinity_site_preview` and the impersonation cookie from `comet-impersonate-user-id` to `dextinity-impersonate-user-id`

### Minor Changes

- 86f90cb: Support `dextinity.com/*` Kubernetes labels and annotations

    The Builds, Cron Jobs and Kubernetes modules now read the labels and annotations of Kubernetes resources with the `dextinity.com` prefix:

    | Previously                      | Now                             |
    | ------------------------------- | ------------------------------- |
    | `comet-dxp.com/instance`        | `dextinity.com/instance`        |
    | `comet-dxp.com/parent-cron-job` | `dextinity.com/parent-cron-job` |
    | `comet-dxp.com/label`           | `dextinity.com/label`           |
    | `comet-dxp.com/builder`         | `dextinity.com/builder`         |
    | `comet-dxp.com/trigger`         | `dextinity.com/trigger`         |
    | `comet-dxp.com/content-scope`   | `dextinity.com/content-scope`   |

    The `comet-dxp.com` prefix is still supported, so existing Helm charts keep working without changes.
    Resources are expected to use one prefix or the other: if no resource matches the `dextinity.com` labels, the `comet-dxp.com` ones are used instead.

    **Example**

    ```yaml
    metadata:
        annotations:
            dextinity.com/label: "Demo Cron Job"
            dextinity.com/content-scope: '{ "domain": "main", "language": "en" }'
    ```

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/cms-api` to `@dextinity/cms-api`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename `CometException` and its subclasses: `CometValidationException` -> `DextinityValidationException`, `CometEntityNotFoundException` -> `DextinityEntityNotFoundException`, `CometImageResolutionException` -> `DextinityImageResolutionException`. The error codes returned by the API change accordingly, so a matching `@dextinity/cms-admin` version is required
    - Rename `CometAuthGuard` to `DextinityAuthGuard` and the `@DisableCometGuards()` decorator to `@DisableDextinityGuards()`
    - Rename the database tables `CometFileUpload`, `CometUserPermission` and `CometUserContentScopes` to `DextinityFileUpload`, `DextinityUserPermission` and `DextinityUserContentScopes`. A migration is shipped with the package, so running the migrations is sufficient
    - Rename the site preview cookie from `__comet_site_preview` to `__dextinity_site_preview` and the impersonation cookie from `comet-impersonate-user-id` to `dextinity-impersonate-user-id`

### Minor Changes

- 86f90cb: Support `dextinity.com/*` Kubernetes labels and annotations

    The Builds, Cron Jobs and Kubernetes modules now read the labels and annotations of Kubernetes resources with the `dextinity.com` prefix:

    | Previously                      | Now                             |
    | ------------------------------- | ------------------------------- |
    | `comet-dxp.com/instance`        | `dextinity.com/instance`        |
    | `comet-dxp.com/parent-cron-job` | `dextinity.com/parent-cron-job` |
    | `comet-dxp.com/label`           | `dextinity.com/label`           |
    | `comet-dxp.com/builder`         | `dextinity.com/builder`         |
    | `comet-dxp.com/trigger`         | `dextinity.com/trigger`         |
    | `comet-dxp.com/content-scope`   | `dextinity.com/content-scope`   |

    The `comet-dxp.com` prefix is still supported, so existing Helm charts keep working without changes.
    Resources are expected to use one prefix or the other: if no resource matches the `dextinity.com` labels, the `comet-dxp.com` ones are used instead.

    **Example**

    ```yaml
    metadata:
        annotations:
            dextinity.com/label: "Demo Cron Job"
            dextinity.com/content-scope: '{ "domain": "main", "language": "en" }'
    ```

### Patch Changes

## 9.5.0

### Minor Changes

- 4eadaf5: Deprecate `FilesService.calculateDominantColor`

    Computing the dominant color of an image was the only part of `FilesService` that used imgproxy. It moved to an internal service that `DamImagesModule` provides, so file handling no longer depends on imgproxy.

    `FilesService.calculateDominantColor` returns the color when `DamImagesModule` is registered, and `undefined` when it is not.

- 4eadaf5: Split `DamModule` into composable sub-modules

    `DamModule` is now a facade composing four sub-modules: `DamFilesModule` (file and folder storage, upload and serving), `DamImagesModule` (image scaling via imgproxy, dominant color), `DamBlocksModule` (block transformers) and `DamDependentsModule` (the `dependents` field on `DamFile`). `DamModule.register()` keeps its signature and still composes all four.

    `DamModule` and its sub-modules now throw when they are registered more than once in the same process. A second registration would mount the DAM routes twice and add the `dependents` field to the file type again, so it never worked as intended.

    Projects that only need DAM file upload and storage can register `DamFilesModule` on its own, without `ImgproxyModule` and without `DependenciesModule`:

    ```ts
    DamFilesModule.register({ damConfig, Scope: DamScope, File: DamFile, Folder: DamFolder });
    ```

    In that setup, `FilesService` receives no dominant color calculator, so uploads skip the color and `FilesService.calculateDominantColor` returns `undefined`.

## 9.4.0

### Patch Changes

- 0dac371: Keep the list nesting when migrating Draft.js content to TipTap

    The `migrateFromDraftJs` option of `createTipTapRichTextBlock` ignored the `depth` of Draft.js list items, so nested lists were flattened into a single list. The migration now converts the `depth` into nested TipTap lists.

    Nesting is limited by the block's `listLevelMax` option: list items that are indented deeper are placed on the deepest allowed level instead of being dropped.

- 14d481e: Keep the text block type when the Draft.js → TipTap migration maps a block type to a `textBlockStyle`

    A Draft.js block type listed in `migrateFromDraftJs.textBlockStyleMap` was always converted to a paragraph, so a `header-two` block mapped to a `headline450` style lost its heading tag and was rendered with whatever tag the style defaults to. Mapped header types now keep their heading level and only receive the mapped `textBlockStyle`.

    For custom Draft.js block types that were rendered as a heading (e.g. a `headline450` block type rendered as `<h2>`), the target text block type can now be set explicitly by passing an object instead of a style name:

    **Example**

    ```ts
    createTipTapRichTextBlock({
        textBlockStyles: [{ name: "headline450", appliesTo: ["heading-2"] }],
        migrateFromDraftJs: {
            textBlockStyleMap: { headline450: { textBlockType: "heading-2", textBlockStyle: "headline450" } },
        },
    });
    ```

    `textBlockType` accepts `paragraph` and `heading-1` … `heading-6`, and both properties are optional.

- 8c6be74: Improve performance of the `contentScopesCount` field when querying the users list

    When resolving `contentScopesCount` for a list of users, the available content scopes were recomputed (and deduplicated) once per row. They are now resolved a single time per request through a request-scoped `DataLoader`, which noticeably speeds up the users list when many content scopes are configured.

## 9.3.0

### Minor Changes

- 924b66c: Add `underline` support to `createTipTapRichTextBlock`

    The `underline` inline style is now part of the `supports` list and can be toggled via a new toolbar button. The underline mark is validated by the API, rendered as `<u>` by `renderTipTapRichText`, and the DraftJS migration maps the `UNDERLINE` inline style to it when supported. Per default it is disabled, pass a `supports` list with `underline` to enable it.

### Patch Changes

- a8e8f02: Export `DamFileAiContentType` enum

## 9.2.2

### Patch Changes

- d1022e2: Improve performance of the `block_index_dependencies` materialized view refresh

    Resolve the `EntityInfo` of the root and target entity once over the union of all root blocks, instead of joining `EntityInfo` inside each root block's `SELECT`. Previously the `EntityInfo` view (a `UNION` over every entity, including a recursive DAM folder-path CTE) was re-evaluated once per root block, which dominated the refresh cost on large datasets. The refreshed view's columns and contents are unchanged.

- a2515ce: Add timing and outcome logs to the `refreshBlockIndexViews` command

    The command now logs how long the refresh took and whether a refresh was actually performed or skipped because the block index views were still fresh enough.

## 9.2.1

## 9.2.0

### Minor Changes

- ee0bf93: Add AI content disclosure for DAM assets (EU AI Act, Article 50)

    Editors can mark a DAM asset as **AI generated** or **AI modified** in the file settings. When such an asset is published, the site renders the official EU AI-content label and merges the disclosure into the media element's accessible name, so screen-reader users learn which asset is AI.

    **API**

    New `aiContentType` field (`Generated` | `Modified`) on DAM files, exposed through the `PixelImage` and `DamVideo` blocks.

    **Admin**

    New "AI content" field in the DAM file settings, shown for image, video and audio assets only (other file types cannot constitute a deep fake).

    **Site**

    `PixelImageBlock` and `DamVideoBlock` render the disclosure automatically for marked assets. Both accept props to customize it:
    - `aiContentDisclosureProps` — override the badge.
    - `customAiContentDisclosure` — render your own disclosure, or `null` for none.
    - `aiContentAltTextPrefixLabels` — localize the accessible-name prefix (defaults to English).

    `@comet/site-react` also exports the `AiContentDisclosure` badge and the `getAiContentAltTextWithPrefix` helper.

- 8d46a98: Remove special handling that excluded DAM URLs from the access log

    Previously, requests to DAM routes were excluded from the access log. They are now logged like any other HTTP request.

### Patch Changes

- 3c28742: Prevent `pg_advisory_xact_lock` query spam when refreshing block index dependencies

    `DependenciesService.refreshViews()` runs once per resolved `dependents`/`dependencies` field, so a single view (e.g. the DAM "Usages" column) triggers many parallel refreshes. When the last refresh was older than 15 minutes (or none existed), each took the blocking lock path and piled up waiting, each holding a database connection. This could exhaust the connection pool and surface as `Knex: Timeout acquiring a connection` errors.

    Parallel refreshes within a process are now deduplicated into a single in-flight refresh, so at most one advisory lock is taken per instance, while the cross-instance advisory lock still prevents concurrent `REFRESH MATERIALIZED VIEW` runs.

## 9.1.1

## 9.1.0

### Minor Changes

- 319f5b8: Allow filtering, searching and sorting warnings by name, info and type

    The warnings data grid now supports filtering and full-text searching by the related entity's name and secondary information, filtering by type, and sorting by name and type.

    On the API, the `WarningFilter` gains `name` and `secondaryInformation` fields and `WarningSortField` gains a `name` value. The related entity's name and secondary information are resolved by joining the `EntityInfo` view, while the type is read from the warning's `sourceInfo`. The view is only joined when a query actually references name or info. A migration adds an index on the `EntityInfo` join keys to keep that join fast.

## 9.0.1

## 9.0.0

### Major Changes

- 8c2fdde: Add filtering and sorting to `DependenciesList` and `DependentsList`

    Users can now filter dependencies/dependents by name, type, secondary information, and visibility, and sort by all columns. A default filter shows only visible items. The `GqlFilter` type is now exported from `@comet/admin`.

    **Breaking changes:**

    **`@comet/cms-api`:** `DependencyFilter.targetGraphqlObjectType` and `DependentFilter.rootGraphqlObjectType` changed from `string` to `StringFilter`. Update any code passing a plain string to use `{ equal: "..." }` instead.

    **`@comet/cms-api`:** `DependenciesService.getDependents()` and `getDependencies()` consolidated the `filter`, `paginationArgs`, and `options` parameters into a single `options` object. If you call these methods directly, merge the arguments:

    ```ts
    // Before
    service.getDependents(target, filter, { offset, limit }, { forceRefresh, sort });

    // After
    service.getDependents(target, { filter, offset, limit, forceRefresh, sort });
    ```

    **`@comet/cms-admin`:** The GQL queries passed to `DependenciesList` and `DependentsList` must now accept `$filter` and `$sort` variables and forward them to the `dependencies`/`dependents` field. Update your queries as follows:

    ```graphql
    # DependentsList
    query MyDependents($id: ID!, $offset: Int!, $limit: Int!, $forceRefresh: Boolean = false, $filter: DependentFilter, $sort: [DependencySort!]) {
        item: myEntity(id: $id) {
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

    # DependenciesList
    query MyDependencies($id: ID!, $offset: Int!, $limit: Int!, $forceRefresh: Boolean = false, $filter: DependencyFilter, $sort: [DependencySort!]) {
        item: myEntity(id: $id) {
            id
            dependencies(offset: $offset, limit: $limit, forceRefresh: $forceRefresh, filter: $filter, sort: $sort) {
                nodes {
                    targetGraphqlObjectType
                    targetId
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
    ```

- 0e7d7e9: Import blob storage backends dynamically

    `BlobStorageAzureConfig`, `BlobStorageAzureStorage`, `BlobStorageFileConfig`, and `BlobStorageFileStorage` are no longer exported from `@comet/cms-api` as they are now loaded dynamically based on the configured driver. Only the relevant backend class is imported, which avoids loading unused optional dependencies (e.g., `@azure/storage-blob` or `aws-sdk`).

- 3f3da52: Switch to SQL-based entity info system

    The `@EntityInfo` decorator now accepts a field-path-based object or a raw SQL string instead of a TypeScript function or service class.
    This enables efficient SQL-level filtering and sorting of dependencies and warnings based on entity info.

    **Breaking changes:**
    - `@EntityInfo` decorator API changed: now accepts `{ name, secondaryInformation?, visible? }` with dot-notation field paths, or a raw SQL string
    - `EntityInfoServiceInterface` has been removed from exports
    - `PageTreeNodeDocumentEntityInfoService` has been removed; `@EntityInfo` on `Page`, `Link`, and similar document entities is no longer needed
    - `block_index_dependencies` view exposes two new columns `blockVisible` and `entityVisible`; `visible` is now their logical AND (previously only reflected block-level visibility)
    - `block_index_dependencies` view now includes `rootName`, `rootSecondaryInformation`, `targetName`, and `targetSecondaryInformation` columns from `EntityInfo`, removing the need for a runtime JOIN when querying dependencies/dependents

- 962a320: Remove `importDamFileByDownload` mutation
- 2ea835c: Rename `RedirectSourceTypeValues` to `RedirectSourceType`
- 171c335: Redirects: add `domain` source type

    To fully support domain redirects, additional handling is required in the site middleware.

### Minor Changes

- f1a473a: Allow `AffectedScope` to return multiple scopes

    The `argsToScope` function can now return `ContentScope[]` in addition to a single `ContentScope`. When multiple scopes are returned, the user must have access to all of them (AND relationship).

    ```ts
    @AffectedScope((args: MyArgs) => [{ domain: args.fromDomain }, { domain: args.toDomain }])
    ```

- 8954d64: Add `findUser` / `findUserOrThrow` (and `findUserForLogin` / `findUserForLoginOrThrow`) to `UserPermissionsUserServiceInterface`

    The throwing `getUser` and `getUserForLogin` methods on `UserPermissionsUserServiceInterface` are now deprecated in favor of paired find methods:
    - `findUser(id): Promise<User | null>` / `findUserOrThrow(id): Promise<User>`
    - `findUserForLogin(id): Promise<User | null>` / `findUserForLoginOrThrow(id): Promise<User>`

    This lets consumers opt into a non-throwing path without wrapping lookups in `try`/`catch`. Existing implementations that only define `getUser` / `getUserForLogin` continue to work; the service falls back to them.

    **Example**

    ```ts
    export class UserService implements UserPermissionsUserServiceInterface {
        async findUser(id: string): Promise<User | null> {
            return this.users.find((user) => user.id === id) ?? null;
        }

        async findUserOrThrow(id: string): Promise<User> {
            const user = await this.findUser(id);
            if (!user) {
                throw new Error(`User not found: ${id}`);
            }
            return user;
        }

        // ...
    }
    ```

- 4c1aeb2: Add `noFollow` option to `ExternalLinkBlock`

    Editors can now mark an external link as `nofollow` via a new checkbox in the admin form. When enabled, the rendered `<a>` tag receives `rel="nofollow"`. Existing links are unaffected by an automatic block-data migration that sets `noFollow` to `false`.

- 67938b2: Filter `myFullTextSearch` results by the entity's required permission

    The `requiredPermission` of an entity (declared via the `@RequiredPermission` decorator) is now included in both the `EntityInfo` and `EntityInfoFullText` SQL views.

    The `myFullTextSearch` query (formerly `fullTextSearch`) filters results based on the current user's permissions, only returning entities where the user has the required permission. Entries without a required permission are excluded from results, as the permission cannot be determined. The `my` prefix reflects that the query operates on the current user and only returns entities the user is allowed to see.

    **Example usage:**

    ```ts
    @EntityInfo<Product>({
        name: "title",
        secondaryInformation: "category.name",
        visible: { status: { $eq: ProductStatus.Published } },
        fullText: "fullText",
    })
    @RequiredPermission("products")
    @ObjectType()
    @Entity()
    export class Product {
        // ...
    }
    ```

- c0cee12: Add `placeholders` option to `createTipTapRichTextBlock` that allows inserting pre-defined placeholder tokens into the rich text editor. Placeholders are rendered as non-editable chips and can only be removed as a whole unit.
- 7fbe2a7: Add `allowPageDelete` option to disable deletion of pages in the PageTree. When set to `false`, the delete option is hidden in the Admin UI and the API blocks deletion attempts.
- 54f57dd: Support loading data for child blocks embedded in rich text content in `recursivelyLoadBlockData`

    Child blocks embedded in a `createTipTapRichTextBlock` rich text block (stored as `cmsBlock`/`cmsInlineBlock` nodes) are now traversed by `recursivelyLoadBlockData`, so their registered block loaders run just like for any other nested block. This allows rich text child blocks to load additional data (e.g. via a GraphQL query) without relying on a `BlockTransformerService` on the API side.

    To support this, the `tipTapContent` field of a `createTipTapRichTextBlock` block is now declared with a dedicated `TipTapRichTextBlock` block meta kind (instead of `Json`) that carries the configured child blocks. The block loader uses this kind to detect rich text content instead of inspecting arbitrary `Json` fields.

    Also re-exported from `@comet/site-nextjs`.

- a50793a: Add `listFiles` method to `BlobStorageBackendService`
- cac2b3b: Add fullText query support for PageTree (pageTreeFullTextSearch query)

    To enable add a fullText column for a PageTree document (Page or others):

    ```ts
    @Index({ type: "fulltext" })
    @Property<Page>({ nullable: true, type: new FullTextType(), onUpdate: (page) => blockToMikroOrmFullText(page.content) })
    searchableContent?: string;
    ```

    and enable fullText option for PageTreeModule

- 9d5f045: Add a `urlTemplate` field resolver to `FileImagesResolver`
- c6703db: Add `ids` filter to `damFilesList`

    `FileFilterInput` now accepts an optional `ids: [ID!]` to restrict the result set to specific files. Useful for batch-loading a known selection (e.g. after a multi-file picker confirms) in a single request.

- b0ceb9c: Export `IsLinkTarget` validator
- 127a492: Add TipTapRichTextBlock as an alternative to RichTextBlock
- 1b37655: Add scope support to `myFullTextSearch`

    The `EntityInfoFullText` view now includes a `scopes` column, and the `myFullTextSearch` query accepts an optional `scope` argument to restrict results to a single content scope.

    The scopes are derived from either a `scope` property on the entity (simple case) or the `@ScopedEntity` decorator. To support building the scopes in SQL, `@ScopedEntity` accepts a new declarative, SQL-convertible variant in addition to the existing callback/service:

    ```ts
    // Field path to the scope object (an embeddable)
    @ScopedEntity("company.scope")

    // Object mapping scope properties to field paths
    @ScopedEntity({ companyId: "company.id" })

    // Multiple scopes
    @ScopedEntity(["company.scope", "otherCompany.scope"])
    ```

    The existing callback and service variants keep working everywhere `@ScopedEntity` is used (e.g. the auth guard). They cannot be converted to SQL, so an entity that is part of the full-text index must use the declarative variant (or have a `scope` property) — otherwise creating the `EntityInfoFullText` view throws.

- 70a77db: Reuse `@RequiredPermission` from entity in resolver permissions

    The `UserPermissionsGuard` now falls back to the entity's `@RequiredPermission` decorator when no permission is explicitly set on the resolver. The entity is resolved from the `@Resolver(() => Entity)` decorator.

    Additionally, the CRUD generator no longer emits `@RequiredPermission` on generated resolvers if the entity already has `@RequiredPermission` set. This avoids redundant permission declarations.

- 8498a7c: Export `EntityInfoObject`, `EntityInfoFullTextObject` and `PaginatedEntityInfo`

    This allows building custom full-text search resolvers (for example a public, permission-independent site search) that reuse the existing full-text search views and re-use the `entityInfo` relation to return name and secondary information.

- 8ad9dd8: Add support for deleting multiple redirects in the grid
- bc57b4a: Add support for child blocks in `createTipTapRichTextBlock`

    Child blocks can now be embedded into the TipTap rich text editor, similar to the existing link feature. Configure the supported blocks via the new `childBlocks` option (both admin and API): a record keyed by a stable key, where each entry is `{ block, display }`. `display` is either `"block"` (a standalone block element on its own line) or `"inline"` (rendered inline within the surrounding text). A "+" button in the toolbar opens a menu listing the configured child blocks. Selecting one opens a dialog with the block's Admin component; on confirmation, the block is inserted into the editor as a non-editable preview that can be edited (by clicking it) or removed.

    **Example**

    ```tsx
    createTipTapRichTextBlock({
        childBlocks: { productPrice: { block: ProductPriceBlock, display: "inline" } },
    });
    ```

- 2fe9d4b: Add support for translating page and document content

    Content translation can now be applied to entire documents at once, in addition to the existing field-level translation.

    **Setup**

    Wrap the application with `AzureAiTranslatorProvider` (supports `batchTranslate` automatically):

    ```tsx
    <AzureAiTranslatorProvider enabled showApplyTranslationDialog>
        {children}
    </AzureAiTranslatorProvider>
    ```

    **Making a document type translatable**

    Add `createDocumentTranslationMethods` and the `TranslatableInterface` type to the document definition:

    ```tsx
    import { createDocumentTranslationMethods, type TranslatableInterface } from "@comet/cms-admin";

    const rootBlocks = {
        content: PageContentBlock,
        seo: SeoBlock,
    };

    export const Page: DocumentInterface & TranslatableInterface & DependencyInterface = {
        // ...existing config
        ...createDocumentRootBlocksMethods(rootBlocks),
        ...createDocumentTranslationMethods(rootBlocks),
    };
    ```

    **Adding translate action to the edit page**

    `createUsePage` now returns a `translateContent` function. Use it with `TranslateContentMenuItem` inside a `CrudMoreActionsMenu`:

    ```tsx
    const { translateContent /* ...other fields */ } = usePage({ pageId: id });

    <CrudMoreActionsMenu overallActions={[<TranslateContentMenuItem translateContent={translateContent} />]} />;
    ```

    **Page tree integration**

    The page tree context menu and bulk action toolbar automatically show a "Translate" action for pages. This translates the page name, slug, and document content.

- dd51208: Update TypeScript compilation target to ES2023 and lib to ES2023 to match the required Node.js v22

### Patch Changes

- fa5c7a4: Fix `FileField` breaking image block selection

    The `DamFileFieldFile` fragment lost the image dimensions (`width`, `height`, `cropArea`) needed by `DamImageBlock`/`PixelImageBlock`. Selecting an image inside an image block crashed because those fields were missing. Restored them on the fragment.

    Composing the fragment into a parent collection (e.g. a many-to-many to `DamFile`) exposed a Mikro-ORM gotcha: `Collection.loadItems()` does not honor `eager: true`, so each loaded `DamFile` had an uninitialized `image` Reference and GraphQL threw `Cannot return null for non-nullable field DamFileImage.width`. Added an `image` `@ResolveField` on `FilesResolver` that initializes the Reference if needed, so consumers don't have to remember to populate it.

- f6a2932: Fix `MODULE_NOT_FOUND` errors caused by extensionless deep imports of `@nestjs/graphql` internals. `@nestjs/graphql` 13.3.0 tightened its `exports` map so that the `"./*": "./*"` pattern no longer maps to `.js` automatically. All deep imports of `@nestjs/graphql` internals now use explicit `.js` extensions.
- 35e9e0d: Fix copying the home page creating a second page with the slug `home`

    Previously, copying the home page produced a second page with the slug `home`, after which none of the home pages could be deleted (deleting a page with the slug `home` is forbidden). The copy now receives a different slug if the target scope already has a home page, and keeps `home` only when there is none yet.

- 91f4a9f: Fix DAM file listing failing for files larger than ~2 GB

    The `size` field of `DamFile` and `FileUpload` was exposed as a GraphQL `Int`, which can only represent 32-bit signed integers (max ~2.1 GB). Files exceeding this size (e.g. large videos) caused the GraphQL response to fail with `Int cannot represent non 32-bit signed integer value`, breaking the DAM file list and the "Select files from DAM" dialog. The field is now exposed as `BigInt`, which represents the full range of file sizes stored in the database (`bigint`).

- 6b7adc7: Fix `damFilesList` returning no files in subfolders when filtering by `ids`

    `damFilesList` implicitly constrains to the scope root when no `folderId` is passed. The constraint already had an escape hatch for `filter.searchText`; the same now applies to `filter.ids`. Resolving a selection via `filter: { ids: ... }` returns all matching files regardless of which folder they live in, which unblocks the admin `FileField` multi-select for files in subfolders.

- 31d9296: Fix duplicate TipTap `'link'` extension warning by explicitly disabling StarterKit's built-in Link extension

    StarterKit (v3+) includes `@tiptap/extension-link` by default. Since we register our own `CmsLink` mark (also named `"link"`), this caused a "Duplicate extension names found: ['link']" warning. Setting `link: false` in `StarterKit.configure()` resolves this.

- 19a0528: Fix `MailerLogStatus` GQL enum name (was incorrectly registered as `WarningStatus`)
- 71dce06: Support sorting folders by size (child count) in `FoldersService`
- f162fa5: Fix `AzureOpenAiContentGenerationService` for newer GPT models

    We still used the deprecated `max_tokens` that isn't supported anymore by newer models.
    Replaced it with the newer `max_completion_tokens`.

- 1ad7de3: Return null in `getNodeByPath` when path is `/home` to prevent the home page from being returned for that path (results in 404)
- affbb11: Load `jsdom` lazily for SVG validation

    `jsdom` (~90 MB resident) was imported and instantiated at module load time, so importing anything from `@comet/cms-api` pulled it into memory even when no SVG was ever validated. It's now loaded on the first SVG validation instead, reducing the package's base memory footprint.

- fad0167: Load `@kubernetes/client-node` lazily in `KubernetesService`

    `@kubernetes/client-node` (~85 MB resident) was statically imported, so importing anything from `@comet/cms-api` pulled it into memory even for projects that don't use the Kubernetes-based builds feature. The runtime parts of the client are now required lazily when `KubernetesService` actually connects to a cluster, reducing the package's base memory footprint.

- 6793853: Load `openai` lazily in `AzureOpenAiContentGenerationService`

    The `openai` client was statically imported, so importing anything from `@comet/cms-api` pulled it into memory even when the content-generation feature was disabled. It's now required lazily when a client is actually created, reducing the package's base memory footprint.

- a2c2eb5: Log the reason when a permission check denies access

    `AbstractAccessControlService.isEqualOrMorePermissions` now emits a NestJS `Logger.debug` line identifying the missing permission or content scope whenever it returns `false`. The `impersonationAllowed` resolver field additionally logs when a user attempts to impersonate themselves.

- 802b0b8: Remove `sharp` dependency by parsing the dominant color directly from the 1x1 PNG produced by imgproxy
- 8bf0e5b: Remove unused `ts-morph` dependency
- ac59b62: Validate uploaded SVGs with `DOMPurify` (backed by `jsdom`) instead of the custom XML-based check

    The previous implementation parsed SVGs with `fast-xml-parser` and applied a hand-written allow/deny list to reject scripts, event handlers and unsafe links.
    SVGs are now sanitized with the vetted `DOMPurify` library and rejected when it has to strip any tags or attributes, providing more robust protection against XSS vectors in uploaded SVGs.

    The `role` attribute and the `<use>` element are allowed, since they're commonly used in valid SVGs. `<use>` is restricted to same-document fragment references (e.g. `href="#id"`); references to external resources are rejected to prevent XSS/SSRF.

- 8722deb: Upgrade `file-type` dependency from v16 to v21

## 9.0.0-beta.6

### Minor Changes

- f1a473a: Allow `AffectedScope` to return multiple scopes

    The `argsToScope` function can now return `ContentScope[]` in addition to a single `ContentScope`. When multiple scopes are returned, the user must have access to all of them (AND relationship).

    ```ts
    @AffectedScope((args: MyArgs) => [{ domain: args.fromDomain }, { domain: args.toDomain }])
    ```

- 8954d64: Add `findUser` / `findUserOrThrow` (and `findUserForLogin` / `findUserForLoginOrThrow`) to `UserPermissionsUserServiceInterface`

    The throwing `getUser` and `getUserForLogin` methods on `UserPermissionsUserServiceInterface` are now deprecated in favor of paired find methods:
    - `findUser(id): Promise<User | null>` / `findUserOrThrow(id): Promise<User>`
    - `findUserForLogin(id): Promise<User | null>` / `findUserForLoginOrThrow(id): Promise<User>`

    This lets consumers opt into a non-throwing path without wrapping lookups in `try`/`catch`. Existing implementations that only define `getUser` / `getUserForLogin` continue to work; the service falls back to them.

    **Example**

    ```ts
    export class UserService implements UserPermissionsUserServiceInterface {
        async findUser(id: string): Promise<User | null> {
            return this.users.find((user) => user.id === id) ?? null;
        }

        async findUserOrThrow(id: string): Promise<User> {
            const user = await this.findUser(id);
            if (!user) {
                throw new Error(`User not found: ${id}`);
            }
            return user;
        }

        // ...
    }
    ```

- 4c1aeb2: Add `noFollow` option to `ExternalLinkBlock`

    Editors can now mark an external link as `nofollow` via a new checkbox in the admin form. When enabled, the rendered `<a>` tag receives `rel="nofollow"`. Existing links are unaffected by an automatic block-data migration that sets `noFollow` to `false`.

- 67938b2: Filter `myFullTextSearch` results by the entity's required permission

    The `requiredPermission` of an entity (declared via the `@RequiredPermission` decorator) is now included in both the `EntityInfo` and `EntityInfoFullText` SQL views.

    The `myFullTextSearch` query (formerly `fullTextSearch`) filters results based on the current user's permissions, only returning entities where the user has the required permission. Entries without a required permission are excluded from results, as the permission cannot be determined. The `my` prefix reflects that the query operates on the current user and only returns entities the user is allowed to see.

    **Example usage:**

    ```ts
    @EntityInfo<Product>({
        name: "title",
        secondaryInformation: "category.name",
        visible: { status: { $eq: ProductStatus.Published } },
        fullText: "fullText",
    })
    @RequiredPermission("products")
    @ObjectType()
    @Entity()
    export class Product {
        // ...
    }
    ```

- 7fbe2a7: Add `allowPageDelete` option to disable deletion of pages in the PageTree. When set to `false`, the delete option is hidden in the Admin UI and the API blocks deletion attempts.
- 1b37655: Add scope support to `myFullTextSearch`

    The `EntityInfoFullText` view now includes a `scopes` column, and the `myFullTextSearch` query accepts an optional `scope` argument to restrict results to a single content scope.

    The scopes are derived from either a `scope` property on the entity (simple case) or the `@ScopedEntity` decorator. To support building the scopes in SQL, `@ScopedEntity` accepts a new declarative, SQL-convertible variant in addition to the existing callback/service:

    ```ts
    // Field path to the scope object (an embeddable)
    @ScopedEntity("company.scope")

    // Object mapping scope properties to field paths
    @ScopedEntity({ companyId: "company.id" })

    // Multiple scopes
    @ScopedEntity(["company.scope", "otherCompany.scope"])
    ```

    The existing callback and service variants keep working everywhere `@ScopedEntity` is used (e.g. the auth guard). They cannot be converted to SQL, so an entity that is part of the full-text index must use the declarative variant (or have a `scope` property) — otherwise creating the `EntityInfoFullText` view throws.

- 70a77db: Reuse `@RequiredPermission` from entity in resolver permissions

    The `UserPermissionsGuard` now falls back to the entity's `@RequiredPermission` decorator when no permission is explicitly set on the resolver. The entity is resolved from the `@Resolver(() => Entity)` decorator.

    Additionally, the CRUD generator no longer emits `@RequiredPermission` on generated resolvers if the entity already has `@RequiredPermission` set. This avoids redundant permission declarations.

- 8498a7c: Export `EntityInfoObject`, `EntityInfoFullTextObject` and `PaginatedEntityInfo`

    This allows building custom full-text search resolvers (for example a public, permission-independent site search) that reuse the existing full-text search views and re-use the `entityInfo` relation to return name and secondary information.

### Patch Changes

- 35e9e0d: Fix copying the home page creating a second page with the slug `home`

    Previously, copying the home page produced a second page with the slug `home`, after which none of the home pages could be deleted (deleting a page with the slug `home` is forbidden). The copy now receives a different slug if the target scope already has a home page, and keeps `home` only when there is none yet.

- 91f4a9f: Fix DAM file listing failing for files larger than ~2 GB

    The `size` field of `DamFile` and `FileUpload` was exposed as a GraphQL `Int`, which can only represent 32-bit signed integers (max ~2.1 GB). Files exceeding this size (e.g. large videos) caused the GraphQL response to fail with `Int cannot represent non 32-bit signed integer value`, breaking the DAM file list and the "Select files from DAM" dialog. The field is now exposed as `BigInt`, which represents the full range of file sizes stored in the database (`bigint`).

- affbb11: Load `jsdom` lazily for SVG validation

    `jsdom` (~90 MB resident) was imported and instantiated at module load time, so importing anything from `@comet/cms-api` pulled it into memory even when no SVG was ever validated. It's now loaded on the first SVG validation instead, reducing the package's base memory footprint.

- fad0167: Load `@kubernetes/client-node` lazily in `KubernetesService`

    `@kubernetes/client-node` (~85 MB resident) was statically imported, so importing anything from `@comet/cms-api` pulled it into memory even for projects that don't use the Kubernetes-based builds feature. The runtime parts of the client are now required lazily when `KubernetesService` actually connects to a cluster, reducing the package's base memory footprint.

- 6793853: Load `openai` lazily in `AzureOpenAiContentGenerationService`

    The `openai` client was statically imported, so importing anything from `@comet/cms-api` pulled it into memory even when the content-generation feature was disabled. It's now required lazily when a client is actually created, reducing the package's base memory footprint.

- ac59b62: Validate uploaded SVGs with `DOMPurify` (backed by `jsdom`) instead of the custom XML-based check

    The previous implementation parsed SVGs with `fast-xml-parser` and applied a hand-written allow/deny list to reject scripts, event handlers and unsafe links.
    SVGs are now sanitized with the vetted `DOMPurify` library and rejected when it has to strip any tags or attributes, providing more robust protection against XSS vectors in uploaded SVGs.

    The `role` attribute and the `<use>` element are allowed, since they're commonly used in valid SVGs. `<use>` is restricted to same-document fragment references (e.g. `href="#id"`); references to external resources are rejected to prevent XSS/SSRF.

## 9.0.0-beta.5

### Minor Changes

- c0cee12: Add `placeholders` option to `createTipTapRichTextBlock` that allows inserting pre-defined placeholder tokens into the rich text editor. Placeholders are rendered as non-editable chips and can only be removed as a whole unit.
- 9d5f045: Add a `urlTemplate` field resolver to `FileImagesResolver`
- b0ceb9c: Export `IsLinkTarget` validator
- 8ad9dd8: Add support for deleting multiple redirects in the grid

### Patch Changes

- 6b7adc7: Fix `damFilesList` returning no files in subfolders when filtering by `ids`

    `damFilesList` implicitly constrains to the scope root when no `folderId` is passed. The constraint already had an escape hatch for `filter.searchText`; the same now applies to `filter.ids`. Resolving a selection via `filter: { ids: ... }` returns all matching files regardless of which folder they live in, which unblocks the admin `FileField` multi-select for files in subfolders.

- a2c2eb5: Log the reason when a permission check denies access

    `AbstractAccessControlService.isEqualOrMorePermissions` now emits a NestJS `Logger.debug` line identifying the missing permission or content scope whenever it returns `false`. The `impersonationAllowed` resolver field additionally logs when a user attempts to impersonate themselves.

## 9.0.0-beta.4

### Minor Changes

- c6703db: Add `ids` filter to `damFilesList`

    `FileFilterInput` now accepts an optional `ids: [ID!]` to restrict the result set to specific files. Useful for batch-loading a known selection (e.g. after a multi-file picker confirms) in a single request.

- 127a492: Add TipTapRichTextBlock as an alternative to RichTextBlock
- 2fe9d4b: Add support for translating page and document content

    Content translation can now be applied to entire documents at once, in addition to the existing field-level translation.

    **Setup**

    Wrap the application with `AzureAiTranslatorProvider` (supports `batchTranslate` automatically):

    ```tsx
    <AzureAiTranslatorProvider enabled showApplyTranslationDialog>
        {children}
    </AzureAiTranslatorProvider>
    ```

    **Making a document type translatable**

    Add `createDocumentTranslationMethods` and the `TranslatableInterface` type to the document definition:

    ```tsx
    import { createDocumentTranslationMethods, type TranslatableInterface } from "@comet/cms-admin";

    const rootBlocks = {
        content: PageContentBlock,
        seo: SeoBlock,
    };

    export const Page: DocumentInterface & TranslatableInterface & DependencyInterface = {
        // ...existing config
        ...createDocumentRootBlocksMethods(rootBlocks),
        ...createDocumentTranslationMethods(rootBlocks),
    };
    ```

    **Adding translate action to the edit page**

    `createUsePage` now returns a `translateContent` function. Use it with `TranslateContentMenuItem` inside a `CrudMoreActionsMenu`:

    ```tsx
    const { translateContent /* ...other fields */ } = usePage({ pageId: id });

    <CrudMoreActionsMenu overallActions={[<TranslateContentMenuItem translateContent={translateContent} />]} />;
    ```

    **Page tree integration**

    The page tree context menu and bulk action toolbar automatically show a "Translate" action for pages. This translates the page name, slug, and document content.

### Patch Changes

- fa5c7a4: Fix `FileField` breaking image block selection

    The `DamFileFieldFile` fragment lost the image dimensions (`width`, `height`, `cropArea`) needed by `DamImageBlock`/`PixelImageBlock`. Selecting an image inside an image block crashed because those fields were missing. Restored them on the fragment.

    Composing the fragment into a parent collection (e.g. a many-to-many to `DamFile`) exposed a Mikro-ORM gotcha: `Collection.loadItems()` does not honor `eager: true`, so each loaded `DamFile` had an uninitialized `image` Reference and GraphQL threw `Cannot return null for non-nullable field DamFileImage.width`. Added an `image` `@ResolveField` on `FilesResolver` that initializes the Reference if needed, so consumers don't have to remember to populate it.

- 31d9296: Fix duplicate TipTap `'link'` extension warning by explicitly disabling StarterKit's built-in Link extension

    StarterKit (v3+) includes `@tiptap/extension-link` by default. Since we register our own `CmsLink` mark (also named `"link"`), this caused a "Duplicate extension names found: ['link']" warning. Setting `link: false` in `StarterKit.configure()` resolves this.

## 9.0.0-beta.3

### Major Changes

- 0e7d7e9: Import blob storage backends dynamically

    `BlobStorageAzureConfig`, `BlobStorageAzureStorage`, `BlobStorageFileConfig`, and `BlobStorageFileStorage` are no longer exported from `@comet/cms-api` as they are now loaded dynamically based on the configured driver. Only the relevant backend class is imported, which avoids loading unused optional dependencies (e.g., `@azure/storage-blob` or `aws-sdk`).

- 962a320: Remove `importDamFileByDownload` mutation
- 2ea835c: Rename `RedirectSourceTypeValues` to `RedirectSourceType`

### Minor Changes

- a50793a: Add `listFiles` method to `BlobStorageBackendService`
- cac2b3b: Add fullText query support for PageTree (pageTreeFullTextSearch query)

    To enable add a fullText column for a PageTree document (Page or others):

    ```ts
    @Index({ type: "fulltext" })
    @Property<Page>({ nullable: true, type: new FullTextType(), onUpdate: (page) => blockToMikroOrmFullText(page.content) })
    searchableContent?: string;
    ```

    and enable fullText option for PageTreeModule

- dd51208: Update TypeScript compilation target to ES2023 and lib to ES2023 to match the required Node.js v22

### Patch Changes

- f6a2932: Fix `MODULE_NOT_FOUND` errors caused by extensionless deep imports of `@nestjs/graphql` internals. `@nestjs/graphql` 13.3.0 tightened its `exports` map so that the `"./*": "./*"` pattern no longer maps to `.js` automatically. All deep imports of `@nestjs/graphql` internals now use explicit `.js` extensions.
- 71dce06: Support sorting folders by size (child count) in `FoldersService`
- 802b0b8: Remove `sharp` dependency by parsing the dominant color directly from the 1x1 PNG produced by imgproxy
- 8bf0e5b: Remove unused `ts-morph` dependency
- 8722deb: Upgrade `file-type` dependency from v16 to v21

## 9.0.0-beta.2

### Patch Changes

- 1ad7de3: Return null in `getNodeByPath` when path is `/home` to prevent the home page from being returned for that path (results in 404)

## 9.0.0-beta.1

### Major Changes

- 8c2fdde: Add filtering and sorting to `DependenciesList` and `DependentsList`

    Users can now filter dependencies/dependents by name, type, secondary information, and visibility, and sort by all columns. A default filter shows only visible items. The `GqlFilter` type is now exported from `@comet/admin`.

    **Breaking changes:**

    **`@comet/cms-api`:** `DependencyFilter.targetGraphqlObjectType` and `DependentFilter.rootGraphqlObjectType` changed from `string` to `StringFilter`. Update any code passing a plain string to use `{ equal: "..." }` instead.

    **`@comet/cms-api`:** `DependenciesService.getDependents()` and `getDependencies()` consolidated the `filter`, `paginationArgs`, and `options` parameters into a single `options` object. If you call these methods directly, merge the arguments:

    ```ts
    // Before
    service.getDependents(target, filter, { offset, limit }, { forceRefresh, sort });

    // After
    service.getDependents(target, { filter, offset, limit, forceRefresh, sort });
    ```

    **`@comet/cms-admin`:** The GQL queries passed to `DependenciesList` and `DependentsList` must now accept `$filter` and `$sort` variables and forward them to the `dependencies`/`dependents` field. Update your queries as follows:

    ```graphql
    # DependentsList
    query MyDependents($id: ID!, $offset: Int!, $limit: Int!, $forceRefresh: Boolean = false, $filter: DependentFilter, $sort: [DependencySort!]) {
        item: myEntity(id: $id) {
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

    # DependenciesList
    query MyDependencies($id: ID!, $offset: Int!, $limit: Int!, $forceRefresh: Boolean = false, $filter: DependencyFilter, $sort: [DependencySort!]) {
        item: myEntity(id: $id) {
            id
            dependencies(offset: $offset, limit: $limit, forceRefresh: $forceRefresh, filter: $filter, sort: $sort) {
                nodes {
                    targetGraphqlObjectType
                    targetId
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
    ```

- 3f3da52: Switch to SQL-based entity info system

    The `@EntityInfo` decorator now accepts a field-path-based object or a raw SQL string instead of a TypeScript function or service class.
    This enables efficient SQL-level filtering and sorting of dependencies and warnings based on entity info.

    **Breaking changes:**
    - `@EntityInfo` decorator API changed: now accepts `{ name, secondaryInformation?, visible? }` with dot-notation field paths, or a raw SQL string
    - `EntityInfoServiceInterface` has been removed from exports
    - `PageTreeNodeDocumentEntityInfoService` has been removed; `@EntityInfo` on `Page`, `Link`, and similar document entities is no longer needed
    - `block_index_dependencies` view exposes two new columns `blockVisible` and `entityVisible`; `visible` is now their logical AND (previously only reflected block-level visibility)
    - `block_index_dependencies` view now includes `rootName`, `rootSecondaryInformation`, `targetName`, and `targetSecondaryInformation` columns from `EntityInfo`, removing the need for a runtime JOIN when querying dependencies/dependents

- 171c335: Redirects: add `domain` source type

    To fully support domain redirects, additional handling is required in the site middleware.

### Patch Changes

- 19a0528: Fix `MailerLogStatus` GQL enum name (was incorrectly registered as `WarningStatus`)
- f162fa5: Fix `AzureOpenAiContentGenerationService` for newer GPT models

    We still used the deprecated `max_tokens` that isn't supported anymore by newer models.
    Replaced it with the newer `max_completion_tokens`.

## 9.0.0-beta.0

## 8.20.0

### Minor Changes

- ed00704: Add `TableBlock` using the `createTableBlock()` factory

    The passed in `richText` block is used to edit the cell content.

    **Admin:**

    ```ts
    import { createTableBlock } from "@comet/cms-admin";
    import { RichTextBlock } from "./RichTextBlock";

    export const TableBlock = createTableBlock({ richText: RichTextBlock });
    ```

    **API:**

    ```ts
    import { createTableBlock } from "@comet/cms-api";
    import { RichTextBlock } from "./rich-text.block";

    export const TableBlock = createTableBlock({ richText: RichTextBlock });
    ```

## 8.19.0

### Patch Changes

- 0eb28a7: Skip block index view creation when no root block entities are found instead of failing with a SQL syntax error

## 8.18.0

### Minor Changes

- 64b70bc: Deduplicate block index refreshes using PostgreSQL advisory locks

    Replace the race-condition-prone `pg_stat_activity` check in `DependenciesService.refreshViews()` with `pg_try_advisory_xact_lock`, ensuring only one refresh runs at a time. This fixes the issue where many parallel requests (e.g., from the DAM Usages column) could trigger multiple concurrent `REFRESH MATERIALIZED VIEW` operations, overloading the database.

- ef98821: Add option `shouldInvokeUserService` to `createJwtAuthService`

    Sometimes it is preferred to load the user from the `UserService` instead of using the data from the ID-Token (e.g. because the `UserService` provides additional data). This options allows to force this behavior.

### Patch Changes

- e9c54bc: Fix `DamFolder.mpath` column type

    Change the column type from `"uuid array"` to `"uuid[]"` to match PostgreSQL's canonical array type notation, preventing a redundant `alter column ... type uuid array` statement from being generated for every new migration.

- b3bfe86: Update `@aws-sdk/` dependencies to fix CVE-2026-25896

## 8.17.1

### Patch Changes

- 91e9a8f: Update fast-xml-parser to 5.3.6 to fix CVE-2026-26278 (entity expansion DoS)

## 8.17.0

## 8.16.0

## 8.15.0

## 8.14.0

### Minor Changes

- 736e4ae: Add `@AffectedScope` decorator

    See https://docs.comet-dxp.com/docs/core-concepts/content-scope/evaluate-content-scopes#operations-that-require-a-content-scope-independently-of-a-specific-entity

## 8.13.0

### Minor Changes

- 6b0b088: Allow UserService to implement getAccountUrl() which provides a "My Account" link in the UserHeaderItem
- 05638ed: `MailerService.sendMail()` now automatically creates a plaintext version from the HTML content

    When the params passed to `sendMail()` do not include a `text` property but do include a `html` property, a plaintext version will be automatically generated based on the HTML content.

## 8.12.0

### Minor Changes

- 488da0b: Add `registerAdditionalPermissions` helper

    The helper can be used register additional permissions into the permission enum used for the GraphQL schema.
    Only use this if you're building a library that requires additional permissions.
    For application-level permissions, use the `AppPermission` option in the module registration methods.

- 2930556: Send 401 instead 403 when CometAuthGuard cannot authenticate user

    Restores the behavior of Comet v7.

    Before (shortened):

    ```
    {
      "errors": [
        {
          "message": "Forbidden resource",
          "extensions": {
            "code": "FORBIDDEN",
            "originalError": {
              "message": "Forbidden resource",
              "error": "Forbidden",
              "statusCode": 403
            }
          }
        }
      ],
      "data": null
    }
    ```

    After (shortened):

    ```
    {
      "errors": [
        {
          "message": "No AuthService could authenticate the user",
          "extensions": {
            "code": "UNAUTHENTICATED",
            "originalError": {
              "message": "No AuthService could authenticate the user",
              "error": "Unauthorized",
              "statusCode": 401
            }
          }
        }
      ],
      "data": null
    }
    ```

## 8.11.1

## 8.11.0

### Minor Changes

- f34b750: Add Status to CronJob

## 8.10.0

### Minor Changes

- 5f025a9: Add Importer Module

    The module can be used to import data (e.g., from a CSV file) into applications.
    Review the [docs](https://docs.comet-dxp.com/docs/features-modules/importer/) for more information on how to use it.

## 8.9.0

### Minor Changes

- 5cf497f: Allow Easier Local Usage of the Kubernetes Module

    As projects increasingly use the Kubernetes API, local testing and debugging have become necessary.
    Previously, if you wanted to use the Kubernetes service locally (outside of a cluster), you had to overwrite the Kubernetes service inside the node_modules folder.
    Now, you can instantiate the Kubernetes module with a fixed namespace and Helm release, and the module will attempt to authenticate you using local credentials.
    The change in the configuration was made with backwards compatibility in mind.
    This update also renames the guard to be more descriptive.
    This update also adds the Kubernetes service to the public API.

    Example:

    ```app.module.ts
    KubernetesModule.register({
        helmRelease: "comet-test",
        namespace: "comet-test",
    }),
    ```

### Patch Changes

- ef30d93: Fix FileUploadModule: The `setInterval` for cleaning expired files was blocking application bootstrap. Moved interval initialization to the NestJS lifecycle hook `onApplicationBootstrap` and added cleanup in `beforeApplicationShutdown` to properly clear the interval.

## 8.8.0

### Minor Changes

- d328dac: Log guard rejections

    The following error now lead to a log output:
    - CometAuthGuard can't authenticate the user
    - CdnGuard does not receive correct header
    - UserPermissionsGuard does not receive an authenticated user
    - UserPermissionsGuard denies access due to insufficient permissions

- e62d6bd: Add support for temporary file uploads with configurable expiration times. The `expiresIn` duration can be set as a default value in the module configuration, and can be overridden by setting the value when using the `FileUploadsService` or sending the request to the upload endpoint.

    Files are automatically validated for expiration when accessed, and expired files are cleared every minute in the background.

    The `FileUploadField` also supports overriding the `expiresIn` property.

### Patch Changes

- b79687c: Fix a Bug where some warnings where not correctly detected

## 8.7.1

### Patch Changes

- 9ed0711: Improve Warnings SQL-Performance by setting appropriate indexes
- 182c930: Optimize `WarningEventSubscriber`. This improves performance for create and update requests where blocks occur.
- 07c9b17: Fix in-memory filtering in `paginatedRedirects` query
    - Fix `isEmpty` and `isNotEmpty` filters for string filters
    - Fix boolean filter handling: properly handle the "any" case (when no specific value is set)
    - Add support for `activatedAt` field in redirect filters

## 8.7.0

### Minor Changes

- 13babd1: Use `sharp` to calculate the dominant image color

    `sharp` replaces the previous implementation based on `get-image-colors`, which was removed because it's unmaintained and causes some security warnings.

### Patch Changes

- b2da6c9: Add `calculateInheritAspectRatio` to public API (for real)
- b305d5b: Add EntityInfo to RedirectEntity to provide additional entity information, particularly useful when displaying warnings.

## 8.6.0

### Minor Changes

- 206b352: Add `calculateInheritAspectRatio` to the public API
- fda9262: Add support for scope-specific site preview secrets

    The `sitePreviewSecret` in `PageTreeModule` now accepts a function `(scope: ContentScope) => string` to use different secrets based on the current content scope.

- 30b671e: File Uploads: add preview endpoint for files
- fbae3ae: Add new permissions `sitePreview` and `blockPreview` to `SitePreviewResolver`

    These permissions can be assigned to users who can't access the page tree, but some other parts of the CMS where site or block previews are needed.

    Users with the `pageTree` permission can still automatically access both previews.

### Patch Changes

- 6326641: Add validation of parentId to PageTreeNode to avoid setting a page as its own parent

## 8.5.2

## 8.5.1

## 8.5.0

### Patch Changes

- 942200f: Improve check-warnings job by adding a missing await which led to bad performance
- b7156bb: Fix crash in WarningModule with nullable blocks

## 8.4.2

## 8.4.1

## 8.4.0

### Minor Changes

- c8f5d89: Add support for literal arrays to block meta

### Patch Changes

- bdfb64f: Fix file replacement by id
- 8a6244e: Prevent a refresh of `block_index_dependencies` within 5 minutes of the last refresh

    This was already the desired behavior, but the previous implementation was not working correctly.

## 8.3.0

### Minor Changes

- 78b7703: Export additional types for UserPermissions
    - `ContentScopeWithLabel`
    - `PermissionForUser` (`PermissionsForUser` is already exported)

- 99950fa: Add new GraphQL to MikroORM helper: `gqlSortToMikroOrmOrderBy`, used by API Generator

### Patch Changes

- 613bc13: Warnings Module: fix `@ScopedEntity()` checks
- 4a9938a: Warnings Module: make warnings feature truly optional

## 8.2.0

### Minor Changes

- 5456186: Add `delete` method to `FileUploadsService`

### Patch Changes

- 049d5cd: Fix recipient option for mailer:send-test-mail command

## 8.1.1

### Patch Changes

- ef0f848: Export `SeoBlockInputInterface` type
- 5b61069: Export `ChildBlockInfo`

## 8.1.0

## 8.0.0

### Major Changes

- 04b8692: Add `class-transformer`, `reflect-metadata`, and `rxjs` as peer dependencies

    To upgrade, install the latest versions of the packages in your project.

- ef1c645: Add warnings feature

    The warnings module can be used to display application-wide warnings in the admin. See the [docs](https://docs.comet-dxp.com/docs/features-modules/warning-module) for more information.

- 3562a94: Bump MikroORM peer dependency to v6

    Follow the official [migration guide](https://mikro-orm.io/docs/upgrading-v5-to-v6) to upgrade.

- b039dcb: Separate `FileUploadsModule` completely from `DamModule`

    Multiple changes were necessary to achieve this:
    - `ScaledImagesCacheService` was moved to `BlobStorageModule`
    - You must now pass the `cacheDirectory` config option to `BlobStorageModule` (instead of `DamModule`)
    - `ImgproxyService` was moved to its own `ImgproxyModule`
    - You must add the `ImgproxyModule` to your `AppModule`
    - In the `DamModule` config, the `maxSrcResolution` option was moved from the `imgproxyConfig` to the `damConfig`

- abbe4af: Bump NestJS peer dependency to v11

    Follow the official [migration guide](https://docs.nestjs.com/migration-guide) to upgrade.

- b3e73a5: Remove `ImagesController` export from `@comet/cms-api`
- bc5f831: Merge `@comet/blocks-api` into `@comet/cms-api`

    The dedicated `@comet/blocks-api` package was originally introduced to support projects without CMS parts.
    It turned out that this is never the case, so the separation doesn't make sense anymore.
    Therefore, the `@comet/blocks-api` is merged into this package.

    **Breaking changes**
    - The `@comet/blocks-api` package doesn't exist anymore
    - The `getFieldKeys` function has been removed from the public API
    - Multiple exports that were too generic have been renamed
        - `getMostSignificantPreviewImageUrlTemplate` -> `getMostSignificantPreviewImageUrlTemplateFromBlock`
        - `getPreviewImageUrlTemplates` -> `getPreviewImageUrlTemplatesFromBlock`
        - `getSearchText` -> `getSearchTextFromBlock`
        - `inputToData` -> `blockInputToData`
        - `TransformResponse` -> `TransformBlockResponse`
        - `TransformResponseArray` -> `TransformBlockResponseArray`
        - `transformToSave` -> `transformToBlockSave`
        - `transformToSaveIndex` -> `transformToBlockSaveIndex`
        - `TraversableTransformResponse` -> `TraversableTransformBlockResponse`
        - `TraversableTransformResponseArray` -> `TraversableTransformBlockResponseArray`
        - `typesafeMigrationPipe` -> `typeSafeBlockMigrationPipe`

    **How to upgrade**

    To upgrade, perform the following changes:
    1. Uninstall the `@comet/blocks-api` package
    2. Update all your imports from `@comet/blocks-api` to `@comet/cms-api`
    3. Remove usages of `getFieldKeys` (probably none)
    4. Update imports that have been renamed

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

- 56064fc: Remove `node-fetch` in favor of Node's native Fetch API

    Note: **You need a Node version that supports the Fetch API, preferably Node v22.**

- e8f4b07: Bump class-validator peer dependency to v0.14.0

    To upgrade, install class-validator v0.14.10 or later.

- 412bbf2: Bump `@kubernetes/client-node` peer dependency to v1

    To upgrade, install `@kubernetes/client-node` v1.0.0 or later.

- 8e193a3: Introduce a strongly-typed permission system using the new `Permission` GraphQL enum and `Permission` type, replacing previous string-based permissions.

    **Breaking changes**
    1. **Mandatory `requiredPermission`**: The `@CrudGenerator` decorator now requires the `requiredPermission` parameter to be explicitly specified
    2. **Permission Type Changes**: All permission-related APIs now expect typed permissions instead of plain strings

- 0fa9b84: Remove absolute DAM URLs

    Until now, the API returned absolute URLs for DAM assets by default.
    You could optionally get relative URLs by setting the `x-relative-dam-urls` header.
    This regularly caused confusion regarding the handling of DAM URLs in the site and admin.

    Now, the API will always return relative URLs for DAM assets.
    The `x-relative-dam-urls` header is not supported anymore.

    A proxy should be set up in site and admin to proxy the relative /dam URLs to the API.

- 9cb98ee: PageTreeModule: sitePreviewSecret now is mandatory
- 44915b9: Changed format for `useCurrentUser().allowedContentScopes`
    - Old: `{ [key]: string }[]`
    - New: `{ scope: ContentScope; label: { [key in keyof ContentScope]: string }; }[]`

    To support a smooth transition the `defaultValue` prop of the `ContentScopeProvider` now must also have the same format.

- 8ef9a56: Use `GraphQLLocalDate` instead of `GraphQLDate` for date-only columns

    The `GraphQLDate` scalar coerces strings (e.g., `2025-06-30`) to `Date` objects when used as an input type.
    This causes problems when used in combination with MikroORM v6, which treats date-only columns as strings.
    Since using strings is preferred, the `GraphQLLocalDate` scalar is used instead, which performs no type coercion.

    **How to upgrade**
    1. Use `string` instead of `Date` for date-only columns:

    ```diff
    class Product {
        @Property({ type: types.date, nullable: true })
        @Field(() => GraphQLDate, { nullable: true })
    -   availableSince?: Date = undefined;
    +   availableSince?: string = undefined;
    }
    ```

    2. Use `GraphQLLocalDate` instead of `GraphQLDate`:

    ```diff
    - import { GraphQLDate } from "graphql-scalars";
    + import { GraphQLLocalDate } from "graphql-scalars";

    class Product {
        @Property({ type: types.date, nullable: true })
    -   @Field(() => GraphQLDate, { nullable: true })
    +   @Field(() => GraphQLLocalDate, { nullable: true })
        availableSince?: string = undefined;
    }
    ```

    3. Add the `LocalDate` scalar to `codegen.ts`:

    ```diff
    scalars: rootBlocks.reduce(
        (scalars, rootBlock) => ({ ...scalars, [rootBlock]: rootBlock }),
    +   { LocalDate: "string" }
    )
    ```

- 23f393b: Protect images in the site preview

    The image URLs in the site preview are now generated as preview URLs.
    Authorization is handled via the new `createSitePreviewAuthService`, which validates the site preview cookie.

- a567f60: `createAuthResolver` does not support the `currentUser` config option anymore
- 9c3f72e: Make impersonation usable for non root users.

    If activated, impersonation is only available if the impersonating user
    has as many or fewer permissions and content scopes as the user to impersonate.
    Since this is an expensive calculation the button to impersonate is only
    available in the detail view of the user and has been removed from the list
    view.

    When enabling the `impersonation` permission for non root users the
    permission should also be added to `requiredPermission` for
    `UserPermissionsPage`. This enables the user to select the user to impersonate.
    Nevertheless, without the `userPermissions` permission it's not possible to
    change permission of users.

- 0d210fe: Replace passport with auth services

    See the migration guide to upgrade.

- e478c6b: Directly pass the entity metadata instead of the repository in `gqlArgsToMikroOrmQuery`
- 4c48918: Bump `@sentry/node` peer dependency to v8
- 678bb0b: Move API Generator into separate `@comet/api-generator` package

    It can be run with the same `comet-api-generator` command as before.

- 8552e1b: Remove `createUserFromIdToken` from `UserPermissionsUserServiceInterface`

    `createUserFromRequest` (available since Comet v7.6.0) should be used instead.

- 52b0410: Replace nestjs-console with nest-commander

    The [nestjs-console](https://github.com/Pop-Code/nestjs-console) package isn't actively maintained anymore.
    We therefore replace it with [nest-command](https://nest-commander.jaymcdoniel.dev/).

    To upgrade, perform the following steps:
    1. Uninstall `nestjs-console`
    2. Install `nest-commander` and `@types/inquirer`
    3. Update `api/src/console.ts` to use `nest-commander`
    4. Update your commands to the new `nest-commander` syntax

    See the migration guide for more information.

- c5de11c: Change S3 config for BlobStorage

    Now the config has all fields from `S3ClientConfig` provided by `@aws-sdk/client-s3`, so you override all options in the project.

### Minor Changes

- 9cf2160: API Generator: Add new option `single` to `@CrudGenerator` which allows to enable/disable the single query
- b3e73a5: Add configuration option `basePath` to the DAM settings in `comet-config.json`.

    ```diff
    {
        "dam": {
            ...
    +        "basePath": "foo"
        },
        ...
    }
    ```

- 26dd92a: Add possibility to use service for `convertJwtToUser`
- cbfa595: Add support for searching UUIDs to `searchToMikroOrmQuery`
- 7e97e18: Create a block_index view that contains a flat list of all blocks existing in the project
- 1e39c70: Add `MailerModule` to send mails from API

    See https://docs.comet-dxp.com/docs/features-modules/mailer-module for more information

- c63817a: Add `getUserForLogin` function in `UserService`.

    This allows implementing a different code path for getting the user to login
    and the user shown in the administration panel. Examples are caching the currently logged
    in user or throwing `UnauthorizedException` when not allowed to login.

- 0328fa3: API Generator: Add support for filtering `ID` fields
- 2a9f23d: Support block preview scope for BFF requests

    The current scope will be sent via a monkey patched fetch and interpreted in `previewParams()`.

- 1450882: Add support for `notContains` to `StringFilter`
- 864e6de: Add the possibility to filter users by permission

### Patch Changes

- 5cca3e1: Fix `createFile` in `BlobStorageS3Storage`

    Previously, uploading files to an S3 bucket caused this error:

    > Are you using a Stream of unknown length as the Body of a PutObject request? Consider using Upload instead from @aws-sd k/lib-storage.
    > An error was encountered in a non-retryable streaming request.

- b8817b8: Add `BlocksBlockInputInterface` to the public API
- ebf05cf: Only regenerate warnings for the row that changed in the `WarningEventSubscriber`

    Previously, the warnings were regenerated for all rows of the entity using a lot of memory.

- cf1a829: Remove `video/avi`, `image/psd` and `video/x-m4v` from default accepted mimetypes

    None of this mimetypes had an actual impact:
    - `video/avi` doesn't actually exist
    - `image/psd` doesn't exist / is non-standard
    - `video/x-m4v` is a niche format and the mimetype is not widely used (e.g., Google Chrome and MacOS use `video/mp4`
      instead)

    So removing them shouldn't have any noticeable effects.

- 092e96e: Fix validation error caused by `EmptyDamScope` when uploading a file
- 58a99bb: Fix input validation for missing child blocks
- 7e7a4aa: Fix `title` field not added to types in `createLinkBlock`
- f20ec6c: Make class-validator a peer dependency
- b4d1677: Fix copying a file from one scope to another

    Previously, the media alternatives weren't handled when copying a file (which happens automatically when copying a page from one scope to another). This caused this error:

    > ERROR [ExceptionFilter] DriverException: update "DamMediaAlternative" set "for" = 'eb2a6906-eef9-425c-9d46-1f76275f4ca5', "alternative" = 'eb2a6906-eef9-425c-9d46-1f76275f4ca5' where "id" = '[object Object]' - invalid input syntax for type uuid: "[object Object]"

- b63ecc8: RichTextBlock: add childBlocksInfo for embedded links in order to have them in block index

    This fixes missing dependencies for internal links

## 8.0.0-beta.6

### Major Changes

- ef1c645: Add warnings feature

    The warnings module can be used to display application-wide warnings in the admin. See the [docs](https://docs.comet-dxp.com/docs/features-modules/warning-module) for more information.

- 44915b9: Changed format for `useCurrentUser().allowedContentScopes`
    - Old: `{ [key]: string }[]`
    - New: `{ scope: ContentScope; label: { [key in keyof ContentScope]: string }; }[]`

    To support a smooth transition the `defaultValue` prop of the `ContentScopeProvider` now must also have the same format.

- c5de11c: Change S3 config for BlobStorage

    Now the config has all fields from `S3ClientConfig` provided by `@aws-sdk/client-s3`, so you override all options in the project.

## 8.0.0-beta.5

### Major Changes

- 9c3f72e: Make impersonation usable for non root users.

    If activated, impersonation is only available if the impersonating user
    has as many or fewer permissions and content scopes as the user to impersonate.
    Since this is an expensive calculation the button to impersonate is only
    available in the detail view of the user and has been removed from the list
    view.

    When enabling the `impersonation` permission for non root users the
    permission should also be added to `requiredPermission` for
    `UserPermissionsPage`. This enables the user to select the user to impersonate.
    Nevertheless, without the `userPermissions` permission it's not possible to
    change permission of users.

- e478c6b: Directly pass the entity metadata instead of the repository in `gqlArgsToMikroOrmQuery`

### Minor Changes

- 9cf2160: API Generator: Add new option `single` to `@CrudGenerator` which allows to enable/disable the single query
- 26dd92a: Add possibility to use service for `convertJwtToUser`
- 7e97e18: Create a block_index view that contains a flat list of all blocks existing in the project
- c63817a: Add `getUserForLogin` function in `UserService`.

    This allows implementing a different code path for getting the user to login
    and the user shown in the administration panel. Examples are caching the currently logged
    in user or throwing `UnauthorizedException` when not allowed to login.

### Patch Changes

- b63ecc8: RichTextBlock: add childBlocksInfo for embedded links in order to have them in block index

    This fixes missing dependencies for internal links

## 8.0.0-beta.4

### Major Changes

- b039dcb: Separate `FileUploadsModule` completely from `DamModule`

    Multiple changes were necessary to achieve this:
    - `ScaledImagesCacheService` was moved to `BlobStorageModule`
    - You must now pass the `cacheDirectory` config option to `BlobStorageModule` (instead of `DamModule`)
    - `ImgproxyService` was moved to its own `ImgproxyModule`
    - You must add the `ImgproxyModule` to your `AppModule`
    - In the `DamModule` config, the `maxSrcResolution` option was moved from the `imgproxyConfig` to the `damConfig`

- 412bbf2: Bump `@kubernetes/client-node` peer dependency to v1

    To upgrade, install `@kubernetes/client-node` v1.0.0 or later.

- 0fa9b84: Remove absolute DAM URLs

    Until now, the API returned absolute URLs for DAM assets by default.
    You could optionally get relative URLs by setting the `x-relative-dam-urls` header.
    This regularly caused confusion regarding the handling of DAM URLs in the site and admin.

    Now, the API will always return relative URLs for DAM assets.
    The `x-relative-dam-urls` header is not supported anymore.

    A proxy should be set up in site and admin to proxy the relative /dam URLs to the API.

### Minor Changes

- 0328fa3: API Generator: Add support for filtering `ID` fields

## 8.0.0-beta.3

## 8.0.0-beta.2

### Major Changes

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

- 56064fc: Remove `node-fetch` in favor of Node's native Fetch API

    Note: **You need a Node version that supports the Fetch API, preferably Node v22.**

- 23f393b: Protect images in the site preview

    The image URLs in the site preview are now generated as preview URLs.
    Authorization is handled via the new `createSitePreviewAuthService`, which validates the site preview cookie.

### Patch Changes

- 092e96e: Fix validation error caused by `EmptyDamScope` when uploading a file

## 8.0.0-beta.1

## 8.0.0-beta.0

### Major Changes

- 04b8692: Add `class-transformer`, `reflect-metadata`, and `rxjs` as peer dependencies

    To upgrade, install the latest versions of the packages in your project.

- 3562a94: Bump MikroORM peer dependency to v6

    Follow the official [migration guide](https://mikro-orm.io/docs/upgrading-v5-to-v6) to upgrade.

- abbe4af: Bump NestJS peer dependency to v11

    Follow the official [migration guide](https://docs.nestjs.com/migration-guide) to upgrade.

- bc5f831: Merge `@comet/blocks-api` into `@comet/cms-api`

    The dedicated `@comet/blocks-api` package was originally introduced to support projects without CMS parts.
    It turned out that this is never the case, so the separation doesn't make sense anymore.
    Therefore, the `@comet/blocks-api` is merged into this package.

    **Breaking changes**
    - The `@comet/blocks-api` package doesn't exist anymore
    - The `getFieldKeys` function has been removed from the public API
    - Multiple exports that were too generic have been renamed
        - `getMostSignificantPreviewImageUrlTemplate` -> `getMostSignificantPreviewImageUrlTemplateFromBlock`
        - `getPreviewImageUrlTemplates` -> `getPreviewImageUrlTemplatesFromBlock`
        - `getSearchText` -> `getSearchTextFromBlock`
        - `inputToData` -> `blockInputToData`
        - `TransformResponse` -> `TransformBlockResponse`
        - `TransformResponseArray` -> `TransformBlockResponseArray`
        - `transformToSave` -> `transformToBlockSave`
        - `transformToSaveIndex` -> `transformToBlockSaveIndex`
        - `TraversableTransformResponse` -> `TraversableTransformBlockResponse`
        - `TraversableTransformResponseArray` -> `TraversableTransformBlockResponseArray`
        - `typesafeMigrationPipe` -> `typeSafeBlockMigrationPipe`

    **How to upgrade**

    To upgrade, perform the following changes:
    1. Uninstall the `@comet/blocks-api` package
    2. Update all your imports from `@comet/blocks-api` to `@comet/cms-api`
    3. Remove usages of `getFieldKeys` (probably none)
    4. Update imports that have been renamed

- e8f4b07: Bump class-validator peer dependency to v0.14.0

    To upgrade, install class-validator v0.14.10 or later.

- 9cb98ee: PageTreeModule: sitePreviewSecret now is mandatory
- a567f60: `createAuthResolver` does not support the `currentUser` config option anymore
- 0d210fe: Replace passport with auth services

    See the migration guide to upgrade.

- 4c48918: Bump `@sentry/node` peer dependency to v8
- 678bb0b: Move API Generator into separate `@comet/api-generator` package

    It can be run with the same `comet-api-generator` command as before.

- 8552e1b: Remove `createUserFromIdToken` from `UserPermissionsUserServiceInterface`

    `createUserFromRequest` (available since Comet v7.6.0) should be used instead.

- 52b0410: Replace nestjs-console with nest-commander

    The [nestjs-console](https://github.com/Pop-Code/nestjs-console) package isn't actively maintained anymore.
    We therefore replace it with [nest-command](https://nest-commander.jaymcdoniel.dev/).

    To upgrade, perform the following steps:
    1. Uninstall `nestjs-console`
    2. Install `nest-commander` and `@types/inquirer`
    3. Update `api/src/console.ts` to use `nest-commander`
    4. Update your commands to the new `nest-commander` syntax

    See the migration guide for more information.

### Patch Changes

- b8817b8: Add `BlocksBlockInputInterface` to the public API
- cf1a829: Remove `video/avi`, `image/psd` and `video/x-m4v` from default accepted mimetypes

    None of this mimetypes had an actual impact:
    - `video/avi` doesn't actually exist
    - `image/psd` doesn't exist / is non-standard
    - `video/x-m4v` is a niche format and the mimetype is not widely used (e.g., Google Chrome and MacOS use `video/mp4`
      instead)

    So removing them shouldn't have any noticeable effects.

- 58a99bb: Fix input validation for missing child blocks
- 7e7a4aa: Fix `title` field not added to types in `createLinkBlock`
- f20ec6c: Make class-validator a peer dependency

## 7.25.3

### Patch Changes

- @comet/blocks-api@7.25.3

## 7.25.2

### Patch Changes

- 98104babc: API Generator: fix nullable input for many-to-many relations
    - @comet/blocks-api@7.25.2

## 7.25.1

### Patch Changes

- @comet/blocks-api@7.25.1

## 7.25.0

### Minor Changes

- b421ed273: Support captions in the `DamVideoBlock`

    The captions can be set uploaded as .vtt files and linked to videos in the DAM.

- c95365d03: Add the possibility to attach captions (.vtt files) to videos in the DAM
- a1a129e00: Allow uploading .vtt files to the DAM

### Patch Changes

- @comet/blocks-api@7.25.0

## 7.24.0

### Minor Changes

- efeff64ab: API Generator: Allow easier extension of generated resolvers and services

    Even though we don't encourage to extend generated resolvers and services, it should still be possible. Our recommendation is to generate a new resolver but there are cases where it makes sense to extend the existing one (e.g. modifying certain functions or reusing existing code).

    Until now, this was hard to do, because every resolver and service declared it's services as private. If you need to use a service from the base resolver, you had to redeclare all services with a different name.

    ```ts
        constructor(
            entityManager: EntityManager,
            @InjectRepository(Product) private readonly repository2: EntityRepository<Product>,
            @InjectRepository(ProductCategory) private readonly productCategoryRepository2: EntityRepository<ProductCategory>,
            @InjectRepository(Manufacturer) private readonly manufacturerRepository2: EntityRepository<Manufacturer>,
            @InjectRepository(FileUpload) private readonly fileUploadRepository2: EntityRepository<FileUpload>,
            @InjectRepository(ProductStatistics) private readonly productStatisticsRepository2: EntityRepository<ProductStatistics>,
            @InjectRepository(ProductColor) private readonly productColorRepository2: EntityRepository<ProductColor>,
            @InjectRepository(ProductToTag) private readonly productToTagRepository2: EntityRepository<ProductToTag>,
            @InjectRepository(ProductTag) private readonly productTagRepository2: EntityRepository<ProductTag>,
            private readonly blocksTransformer2: BlocksTransformerService,
        ) {
            super(
                entityManager,
                repository2,
                productCategoryRepository2,
                manufacturerRepository2,
                fileUploadRepository2,
                productStatisticsRepository2,
                productColorRepository2,
                productToTagRepository2,
                productTagRepository2,
                blocksTransformer2,
            );
        }

    ```

    If you tried to use the same name you got the following error:

    ```
    Class 'CustomProductResolver' incorrectly extends base class 'ProductResolver'.
      Types have separate declarations of a private property 'repository'.ts(2415)
    ```

    Now, the constructor can be omitted and the custom resolver can be simplified to:

    ```ts
    @Resolver(() => Product)
    @RequiredPermission(["products"], { skipScopeCheck: true })
    export class CustomProductResolver extends ProductResolver {
        @Mutation(() => Boolean)
        async publishAllProducts(): Promise<boolean> {
            await this.repository.nativeUpdate({ status: { $ne: ProductStatus.Published } }, { status: ProductStatus.Published });
            return true;
        }
    }
    ```

### Patch Changes

- b6e3f7e3c: Don't replace a file if the new file is identical to the existing one in the DAM

    This previously led to a bug where a file was deleted if it was replaced with the same file.

- 3607c7c22: Extend the browser cache duration for public DAM assets from 1 day to 1 year to reduce the data load for returning users.
- 2310f8553: Prevent socket exhaustion when streaming files and prevent the API from crashing due to stream errors in the `FileUploadsDownloadController`

    We already added this fix to the DAM in the past.

- 2af3d8187: Ignore UUID columns in `searchToMikroOrmQuery` when inferring fields from entity metadata
- 34df51db0: Set cache-control headers for file uploads
    - @comet/blocks-api@7.24.0

## 7.23.0

### Minor Changes

- 80d0c6293: Add new `getFileContent` method to the `FileUploadsService`

    This method allows you to retrieve a file's content as a Buffer.
    This is needed for cases like embedding images in a PDF or attaching files to emails.

### Patch Changes

- 2cdb87ad5: Add error and close handling for partial ranges in file stream
- aac00efa8: Limit image title to 150 characters in `AzureOpenAiContentGenerationService`
- Updated dependencies [201198da3]
    - @comet/blocks-api@7.23.0

## 7.22.0

### Patch Changes

- @comet/blocks-api@7.22.0

## 7.21.1

### Patch Changes

- @comet/blocks-api@7.21.1

## 7.21.0

### Patch Changes

- 06920eb59: Fix: Change GraphQL Type of numberOfDescendants from Float to Int
    - @comet/blocks-api@7.21.0

## 7.20.0

### Minor Changes

- ea26f5d89: Add a nullable column `activatedAt` to `Redirects` table to display the latest activation date of a redirect

### Patch Changes

- 557e311ea: AccessLog: Remove some DAM URLs from log

    Hashed URLs and preview URLs are not useful in the logs, so we remove them.

- 21f95adfe: DAM: Fix headers

    While we fixed a few issues with cache control headers in https://github.com/vivid-planet/comet/pull/2653, there are still a few issues which need to be addressed. The following changes are part of a series of changes which will address the issues:
    - Only store the `content-type` header
    - Prevent imgproxy headers from being passed through to the client
    - Remove redundantly stored `content-type` for Azure storage accounts and S3 buckets

- f3b5b57b7: DAM: Set `cache-control: no-store` for folder download

    Explicitly set `cache-control: no-store` for folder download to prevent caching of the response. Normally this should not be cached by any CDN, because the Request contains a cookie, but it is better to be explicit about it.
    - @comet/blocks-api@7.20.0

## 7.19.0

### Minor Changes

- 91cb37bb9: Add `mimetype` to `DamFileDownloadLinkBlock`

### Patch Changes

- eceaab1a0: Make `import-redirects` console script consider scope when loading the target `PageTreeNode` for a redirect

    Previously, the scope wasn't considered when loading the node.
    This resulted in redirects that targeted a node in a different scope -> these redirects didn't work.
    - @comet/blocks-api@7.19.0

## 7.18.0

### Patch Changes

- @comet/blocks-api@7.18.0

## 7.17.0

### Minor Changes

- a1bf43670: Add support for searching/filtering redirects by target

    Add a custom target URL service to resolve the URLs of custom redirect targets:

    ```ts
    @Injectable({ scope: Scope.REQUEST })
    export class MyRedirectTargetUrlService implements RedirectTargetUrlServiceInterface {
        constructor() {}

        async resolveTargetUrl(target: ExtractBlockData<RedirectsLinkBlock>["attachedBlocks"][number]): Promise<string | undefined> {
            // Your custom logic here
        }
    }
    ```

    ```diff
    RedirectsModule.register({
        imports: [MikroOrmModule.forFeature([News]), PredefinedPagesModule],
        customTargets: { news: NewsLinkBlock },
        Scope: RedirectScope,
    +   TargetUrlService: MyRedirectTargetUrlService,
    }),
    ```

- e1392ae6a: Add `isAnyOf` filter to `StringFilter`, `NumberFilter`, `OneToManyFilter`, and `ManyToManyFilter`

### Patch Changes

- @comet/blocks-api@7.17.0

## 7.16.0

### Minor Changes

- 4137cdb03: File Uploads: Add option to disable the GraphQL field resolvers

    Use this when using file uploads without GraphQL.

    ```ts
    FileUploadsModule.register({
        /* ... */
        download: {
            /* ... */
            createFieldResolvers: false,
        },
    });
    ```

- a2dfcc1ad: Export `UserPermissionsService` and `CurrentUserPermission`

    This allows the usage of `getPermissionsAndContentScopes` if projects want to get all rule-based and admin-based permissions for specific users.

### Patch Changes

- @comet/blocks-api@7.16.0

## 7.15.0

### Patch Changes

- 83b8111d6: Allow `use` tag in SVG again

    `use` can be used to define paths once in a SVG and then integrating them multiple times via anchor links: `<use xlink:href="#path-id" />`. This should not be prohibited.

    It's still not possible to use `use` to reference external files, since we still prohibit `href` and `xlink:href` attributes starting with `http://`, `https://` and `javascript:`.

- e6f9641db: Add fallback values for users created via ID token
    - @comet/blocks-api@7.15.0

## 7.14.0

### Minor Changes

- 99ff0357b: Pass available permissions to `AccessControlService.getPermissionsForUser`
- a84d88cf9: Ignore filters in `@AffectedEntity` check

    When using the `@AffectedEntity` decorator we possibly also want to check entities which are filtered by default. Since we don't know how the entity is handled in the resolver we ignore the filters completely.

- 3c47c089e: Allow passing a language to `generateAltText` and `generateImageTitle`
- bb041f7a7: Add content generation capabilities to `createSeoBlock`

    The SEO block (when created using the `createSeoBlock` factory) now supports automatic generation of:
    - HTML title
    - Meta description
    - Open Graph title
    - Open Graph description

    See the [docs](https://docs.comet-dxp.com/docs/features-modules/content-generation/) for instructions on enabling this feature.

- 7f72e82fc: Add `extractTextContents` method to blocks

    `extractTextContents` can be used to extract plain text from blocks. This functionality is particularly useful for operations such as search indexing or using the content for LLM-based tasks. The option `includeInvisibleContent` can be set to include the content of invisible blocks in the extracted text.

    The method is optional for now, but it is recommended to implement it for all blocks and documents. The default behavior is to return
    - if the state is a string: the string itself
    - otherwise: an empty array

### Patch Changes

- 0233d486b: Export `FileUploadInput`
- 7e7a4aae1: Fix `title` field not added to types in `createLinkBlock`
- Updated dependencies [7e7a4aae1]
    - @comet/blocks-api@7.14.0

## 7.13.0

### Patch Changes

- f49370a9e: Improve SVG validation

    Following tags are banned in SVGs:
    - script
    - \[new\] foreignObject
    - \[new\] use
    - \[new\] image
    - \[new\] animate
    - \[new\] animateMotion
    - \[new\] animateTransform
    - \[new\] set

    Following attributes are banned:
    - Event handlers (`onload`, `onclick`, ...)
    - \[new\] `href` and `xlink:href` (if the value starts with `http://`, `https://` or `javascript:`)
    - @comet/blocks-api@7.13.0

## 7.12.0

### Minor Changes

- 604491df5: Validate filename length for uploads to DAM or FileUploads

    The filename can't exceed 255 characters.

- 575f1a77f: Add `ExceptionFilter` to replace `ExceptionInterceptor`

    The main motivation for this change was that the `ExceptionInterceptor` didn't capture exceptions thrown in guards. This could lead to information leaks, e.g., details about the database schema or the underlying code. This is considered a security risk.

    The `ExceptionFilter` also catches error within guards. The error format remains unchanged.

    Switching from the `ExceptionInterceptor` to the `ExceptionFilter` must be done in the project:

    ```diff
    // main.ts

    - app.useGlobalInterceptors(new ExceptionInterceptor(config.debug));
    + app.useGlobalFilters(new ExceptionFilter(config.debug));
    ```

### Patch Changes

- 64173b513: Fix page tree node slug validation to prevent URL encoded characters
- c66a403d2: Migrate from deprecated `@azure/openai` package to `openai`

    See https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/migration-javascript for more information.

- 6b4866a12: Pass `x-preview-dam-urls` and `x-relative-dam-urls` headers to `url` field resolver in `FileImagesResolver`
- cf1a829c5: Remove `video/avi`, `image/psd` and `video/x-m4v` from default accepted mimetypes

    None of this mimetypes had an actual impact:
    - `video/avi` doesn't actually exist
    - `image/psd` doesn't exist / is non-standard
    - `video/x-m4v` is a niche format and the mimetype is not widely used (e.g., Google Chrome and MacOS use `video/mp4`
      instead)

    So removing them shouldn't have any noticeable effects.

- cf1a829c5: Add `image/x-icon` to default accepted mimetypes

    Previously, only `image/vnd.microsoft.icon` was supported. That could lead to problems uploading .ico files, since
    `image/vnd.microsoft.icon` and `image/x-icon` are valid mimetypes for this format.

- ff0a037a4: Prevent image uploads from failing if exif data cannot be parsed
    - @comet/blocks-api@7.12.0

## 7.11.0

### Patch Changes

- fb2297b2d: Fix `notEqual` operation for enum filter
- 6778c4e97: Prevent the creation of a second home page
- Updated dependencies [58a99bbdd]
    - @comet/blocks-api@7.11.0

## 7.10.0

### Patch Changes

- 7b2adae8b: API Generator: Don't generate an update input for the single generator
    - @comet/blocks-api@7.10.0

## 7.9.0

### Patch Changes

- @comet/blocks-api@7.9.0

## 7.8.0

### Minor Changes

- 44a54554c: Allow replacing a file with a new one on the file detail page in the DAM
- 45fbc54c1: Rename `User` to `UserPermissionsUser` in GraphQL schema

    This prevents naming collisions if a web wants to use a `User` type.

    Additionally prefix remaining user permissions-specific actions with `UserPermissions`.

- c6d3ac36b: Add support for file replacement on upload in the DAM

    When uploading a file to the DAM with the same filename as an existing file, it's now possible to replace the existing file.
    This is useful when you want to update a file without changing its URL.

### Patch Changes

- bfa5dbac8: Fix schema generation if `FileUpload` object type isn't used

    Previously, the file uploads module always added the `downloadUrl` and `imageUrl` fields to the `FileUpload` object type, even if the type wasn't used in the application.
    This lead to errors when generating the GraphQL schema.

    Now, the fields are only added if the `download` option of the module is used.

    Note: As a consequence, the `finalFormFileUploadFragment` doesn't include the fields anymore.
    To enable downloading file uploads in forms, use the newly added `finalFormFileUploadDownloadableFragment`:

    ```diff
    export const productFormFragment = gql`
        fragment ProductFormFragment on Product {
            priceList {
    -           ...FinalFormFileUpload
    +           ...FinalFormFileUploadDownloadable
            }
        }

    -   ${finalFormFileUploadFragment}
    +   ${finalFormFileUploadDownloadableFragment}
    `;
    ```

- 02a5bdc68: API Generator: Fix generated types for position code
- f20ec6ce5: Make class-validator a peer dependency
- Updated dependencies [f20ec6ce5]
    - @comet/blocks-api@7.8.0

## 7.7.0

### Patch Changes

- af892c106: Prevent the API from crashing because of stream errors when delivering a file
- 253aebbc1: Allow overriding `requestHandler` in `BlobStorageS3Storage`
- af892c106: Prevent socket exhaustion in `BlobStorageS3Storage`

    By default, the S3 client allows a maximum of 50 open sockets.
    A socket is only released once a file is streamed completely.
    Meaning, it can remain open forever if a file stream is interrupted (e.g., when the user leaves the site).
    This could lead to socket exhaustion, preventing further file delivery.

    To resolve this, the following changes were made:
    1. Add a close handler to destroy the stream when the client disconnects
    2. Set a 60-second `requestTimeout` to close unused connections
    - @comet/blocks-api@7.7.0

## 7.6.0

### Minor Changes

- 73c07ea6e: Set content scopes in request object

    This allows accessing the affected content scopes inside a block's transformer service.

    **Example**

    ```ts
    import { Inject, Injectable } from "@nestjs/common";
    import { CONTEXT } from "@nestjs/graphql";

    /* ... */

    @Injectable()
    export class PixelImageBlockTransformerService implements BlockTransformerServiceInterface<PixelImageBlockData, TransformResponse> {
        constructor(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            @Inject(CONTEXT) private readonly context: any,
        ) {}

        async transformToPlain(block: PixelImageBlockData) {
            // Get the affected content scopes
            const contentScopes = this.context.req.contentScopes;

            // Do something with the content scopes

            /* ... */
        }
    }
    ```

- 671e2b234: Create site preview JWT in the API

    With this change the site preview can be deployed unprotected. Authentication is made via a JWT created in the API and validated in the site. A separate domain for the site preview is still necessary.

    **Note:** This requires the `sitePreviewSecret` option to be configured in the `PageTreeModule`.
    Run `npx @comet/upgrade@latest v7/add-site-preview-secret.ts` in the root of your project to perform the necessary code changes.
    Changes to the deployment setup might still be necessary.

- f8ae0843c: API Generator: Add support for disabling sort/filter using the `@CrudField()` decorator for embeddables
- d535e3207: Improve error message for empty IDs arrays in `@AffectedEntity`
- 44ec9eb3f: Redirects: Add `redirectBySource` query that can be used to query for a single redirect by source
- 3ea66fb38: Add support for user impersonation

    Prerequisites for setups with separate domains for admin and api: `credentials: "include"` must be set in the `createApolloClient` function in the admin.

    Adds an "Impersonation" button to the detail view of a user in the User Permissions admin panel. The impersonation can be exited by clicking the button in the user's info on the top right.

### Patch Changes

- 700ddc340: Fix copy/paste for documents containing a `DamFileDownloadLinkBlock`
- 979d5f455: Improve error message in `Migration20240702123233`

    `Migration20240702123233` adds a valid file extension to every DamFile#name that doesn't have an extension yet.
    Previously, the migration crashed without a helpful error message if the mimetype of a file wasn't in [mime-db](https://www.npmjs.com/package/mime-db).
    Now, the migration throws an error including the problematic mimetype.

- b03f3dfc1: Call `createUserFromRequest` before `createUserFromIdToken`

    The latter is marked as deprecated and should only be used if the
    first one is not defined.

- cc2a11781: Redirects: Improve GraphQL API performance by preloading the page tree to speed up target page lookup

    Also, increase the maximum limit from 100 to 1000.

- 72cf8fd12: Treat `null` and `undefined` scope dimensions the same in `AccessControlService#isAllowed`

    Optional scope dimensions may sometimes be `null` or `undefined` depending on how the scope object is created.
    For instance, when the scope is loaded from the database, the optional dimension will be `null`, but when the scope is coming from GraphQL, the dimension can be `undefined`.
    Due to strict equality comparison, this led to incorrect access control checks in `AccessControlService#isAllowed`.
    This is now prevented by treating `null` and `undefined` dimensions as the same when checking the scope.

- 6b0ecebed: DAM: Fix/set cache-control headers
    - Public endpoints should cache files for 1 day
    - Private endpoints should cache files for 1 year - but only in local caches (not CDN)

- 6f931911c: Avoid duplicate file extension in `createFileUploadInputFromUrl`
- Updated dependencies [9e2b0fac8]
    - @comet/blocks-api@7.6.0

## 7.5.0

### Minor Changes

- f2da11db1: API Generator: Add support for position field

    Add a field named `position` to enable this feature. This field will hold and update the position. This should be an integer number field >= 1. It's also possible to define fields (in CrudGenerator-Decorator) to group position by.

- 5a48ae482: Add file size to `DamFileDownloadLinkBlock`
- 216d93a10: File Uploads: Add image endpoint

    Add support for viewing images in the browser.
    This can be useful for file upload previews, profile pictures etc.
    The image URL can be obtained by querying the `imageUrl` field of the `FileUpload` type.
    A `resizeWidth` argument needs to be provided.

    **Example**

    ```graphql
    query Product($id: ID!) {
        product(id: $id) {
            id
            updatedAt
            priceList {
                id
                imageUrl(resizeWidth: 640)
            }
        }
    }
    ```

### Patch Changes

- @comet/blocks-api@7.5.0

## 7.4.2

### Patch Changes

- @comet/blocks-api@7.4.2

## 7.4.1

### Patch Changes

- @comet/blocks-api@7.4.1

## 7.4.0

### Minor Changes

- f1d9e449b: Support filtering for document types in the `paginatedPageTreeNodes` query

    **Example**

    ```graphql
    query PredefinedPages($scope: PageTreeNodeScopeInput!) {
        paginatedPageTreeNodes(scope: $scope, documentType: "PredefinedPage") {
            nodes {
                id
            }
        }
    }
    ```

- cab7c427a: Add support for downloading previously uploaded files to `FileUploadField`
- bfb8f04e6: Add `VimeoVideoBlock` to support Vimeo videos
- a97019016: File Uploads: Add download endpoint

    The endpoint can be enabled by providing the `download` option in the module config:

    ```ts
    FileUploadsModule.register({
      /* ... */,
      download: {
        secret: "your secret",
      },
    })
    ```

### Patch Changes

- @comet/blocks-api@7.4.0

## 7.3.2

### Patch Changes

- @comet/blocks-api@7.3.2

## 7.3.1

### Patch Changes

- @comet/blocks-api@7.3.1

## 7.3.0

### Patch Changes

- c130adc38: `BuildsService`: Start all jobs that match the scope exactly

    Previously, the first job that matched the scope exactly would be started, and the rest would be ignored. This has been fixed so that all jobs that match the scope exactly are started.
    - @comet/blocks-api@7.3.0

## 7.2.1

### Patch Changes

- c66336963: Fix bug in `DamVideoBlock` that caused the block to crash if no video file was selected

    The block used to crash if no video was selected because the `DamVideoBlockTransformerService` returned an empty object.
    This left the `previewImage` state in the admin `undefined` causing `state2Output` to fail.
    - @comet/blocks-api@7.2.1

## 7.2.0

### Patch Changes

- @comet/blocks-api@7.2.0

## 7.1.0

### Minor Changes

- 19d53c407: Add Sentry module to simplify integration with Sentry.

    ### Usage:

    ```ts
    // main.ts

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    app.use(Sentry.Handlers.errorHandler());
    ```

    ```ts
    // app.module.ts

    SentryModule.forRootAsync({
        dsn: "sentry_dsn_url",
        environment: "dev",
        shouldReportException: (exception) => {
            // Custom logic to determine if the exception should be reported
            return true;
        },
    }),
    ```

### Patch Changes

- 87f74d307: Sort the keys in content scopes returned by `UserPermissionsService` alphabetically

    This fixes issues when comparing content scopes after converting them to strings via `JSON.stringify()`.

    This specifically fixes a bug on the UserPermissionsPage:
    When the `availableContentScopes` passed to the `UserPermissionsModule` weren't sorted alphabetically, the allowed scopes wouldn't be displayed correctly in the UI.
    - @comet/blocks-api@7.1.0

## 7.0.0

### Major Changes

- 6ac10edf1: Remove `download` helper

    Use `createFileUploadInputFromUrl` instead.

- 9a1b01669: Remove CDN config from DAM

    It was a bad idea to introduce this in the first place, because `@comet/cms-api` should not be opinionated about how the CDN works.

    Modern applications require all traffic to be routed through a CDN. Cloudflare offers a tunnel, which made the origin-check obsolete, so we introduced a flag to disable the origin check.

    Also changes the behavior of the `FilesService::createFileUrl()`-method which now expects an options-object as second argument.

    ## How to migrate (only required if CDN is used):

    Remove the following env vars from the API

    ```
    DAM_CDN_ENABLED=
    DAM_CDN_DOMAIN=
    DAM_CDN_ORIGIN_HEADER=
    DAM_DISABLE_CDN_ORIGIN_HEADER_CHECK=false
    ```

    If you want to enable the origin check:
    1. Set the following env vars for the API

    ```
    CDN_ORIGIN_CHECK_SECRET="Use value from DAM_CDN_ORIGIN_HEADER to avoid downtime"
    ```

    _environment-variables.ts_

    ```
    @IsOptional()
    @IsString()
    CDN_ORIGIN_CHECK_SECRET: string;
    ```

    _config.ts_

    ```
    cdn: {
        originCheckSecret: envVars.CDN_ORIGIN_CHECK_SECRET,
    },
    ```

    2. Add CdnGuard

    ```
    // if CDN is enabled, make sure all traffic is either coming from the CDN or internal sources
    if (config.cdn.originCheckSecret) {
        app.useGlobalGuards(new CdnGuard({ headerName: "x-cdn-origin-check", headerValue: config.cdn.originCheckSecret }));
    }
    ```

    3. DNS changes might be required. `api.example.com` should point to CDN, CDN should point to internal API domain

- 6ac10edf1: Remove `FileUploadService`

    Use `createFileUploadInputFromUrl` instead of `FileUploadService#createFileUploadInputFromUrl`.

- 0588e212c: Remove `language` field from `User` object
    - Providing the locale is not mandatory for ID-Tokens
    - Does not have a real use case (better rely on the Accept-Language header of the browser to determine the language of the current user)

- 46b86ba5f: `FilesService#createFileDownloadUrl` now expects an options object as second parameter

    ```diff
    - this.filesService.createFileDownloadUrl(file, previewDamUrls)
    + this.filesService.createFileDownloadUrl(file, { previewDamUrls, relativeDamUrls })
    ```

- 0e6debb06: CRUD Generator: Remove `lastUpdatedAt` argument from update mutations
- ebf597120: Make `@nestjs/platform-express` a peer dependency

    Make sure that `@nestjs/platform-express` is installed in the application.

- e15927594: Support "real" dependency injection in `BlockData#transformToPlain`

    Previously we supported poor man's dependency injection using the `TransformDependencies` object in `transformToPlain`.
    This is now replaced by a technique that allows actual dependency injection.

    **Example**

    ```ts
    class NewsLinkBlockData extends BlockData {
        @BlockField({ nullable: true })
        id?: string;

        transformToPlain() {
            // Return service that does the transformation
            return NewsLinkBlockTransformerService;
        }
    }

    type TransformResponse = {
        news?: {
            id: string;
            slug: string;
        };
    };

    @Injectable()
    class NewsLinkBlockTransformerService implements BlockTransformerServiceInterface<NewsLinkBlockData, TransformResponse> {
        // Use dependency injection here
        constructor(@InjectRepository(News) private readonly repository: EntityRepository<News>) {}

        async transformToPlain(block: NewsLinkBlockData, context: BlockContext) {
            if (!block.id) {
                return {};
            }

            const news = await this.repository.findOneOrFail(block.id);

            return {
                news: {
                    id: news.id,
                    slug: news.slug,
                },
            };
        }
    }
    ```

    Adding this new technique results in a few breaking changes:
    - Remove dynamic registration of `BlocksModule`
    - Pass `moduleRef` to `BlocksTransformerMiddlewareFactory` instead of `dependencies`
    - Remove `dependencies` from `BlockData#transformToPlain`

    See the [migration guide](https://docs.comet-dxp.com/docs/migration-guide/migration-from-v6-to-v7) on how to migrate.

- 9bed75638: API Generator: Add new `dedicatedResolverArg` option to `@CrudField` to generate better API for Many-to-one-relations
    - Add foreign id as argument to create mutation
    - Add foreign id as argument to list query

- c3940df58: Replace `additionalMimeTypes` and `overrideAcceptedMimeTypes` in `DamModule#damConfig` with `acceptedMimeTypes`

    You can now add mime types like this:

    ```ts
    DamModule.register({
        damConfig: {
            acceptedMimeTypes: [...damDefaultAcceptedMimetypes, "something-else"],
        },
    });
    ```

    And remove them like this:

    ```ts
    DamModule.register({
        damConfig: {
            acceptedMimeTypes: damDefaultAcceptedMimetypes.filter((mimeType) => mimeType !== "application/zip"),
        },
    });
    ```

    Don't forget to also remove/add the mime types in the admin's `DamConfigProvider`

- 4485d1540: filtersToMikroOrmQuery: Move second argument (`applyFilter` callback) into an options object
- 28322b422: Refactor auth-decorators
    - Remove `@PublicApi()`-decorator
    - Rename `@DisableGlobalGuard()`-decorator to `@DisableCometGuards()`

    The `@DisableCometGuards()`-decorator will only disable the AuthGuard when no `x-include-invisible-content`-header is set.

- c3940df58: Rename `defaultDamAcceptedMimetypes` to `damDefaultAcceptedMimetypes`
- caefa1c5d: Rename `DateFilter` to `DateTimeFilter`

    This leaves room for a future DateFilter that only filters by date, not time.

    **Upgrading**
    1. Change import

    ```diff
    - import { DateFilter } from "@comet/cms-api";
    + import { DateTimeFilter } from "@comet/cms-api";
    ```

    2. Re-run API Generator.

- ebf597120: Remove unused/unnecessary peer dependencies

    Some dependencies were incorrectly marked as peer dependencies.
    If you don't use them in your application, you may remove the following dependencies:
    - Admin: `axios`
    - API: `@aws-sdk/client-s3`, `@azure/storage-blob` and `pg-error-constants`

- 6ac10edf1: Rename "public uploads" to "file uploads"

    The name "public uploads" was not fitting since the uploads can also be used for "private" uploads in the Admin.
    The feature was therefore renamed to "file uploads".

    This requires the following changes:
    - Use `FileUploadsModule` instead of `PublicUploadModule`
    - Use `FileUpload` instead of `PublicUpload`
    - Use `FileUploadsService` instead of `PublicUploadsService`
    - Change the upload URL from `/public-upload/files/upload` to `/file-uploads/upload`

- 17c7f79a2: Secure file uploads upload endpoint by default

    The `/file-uploads/upload` endpoint now requires the `fileUploads` permission by default.

    Use the `upload.public` option to make the endpoint public:

    ```diff
    FileUploadsModule.register({
        /* ... */,
    +   upload: {
    +       public: true,
    +   },
    }),
    ```

- b7560e3a7: Move `YouTubeVideoBlock` to `@cms` packages

    **Migrate**

    ```diff
    - import { YouTubeVideoBlock } from "@comet/blocks-admin";
    + import { YouTubeVideoBlock } from "@comet/cms-admin";
    ```

    ```diff
    - import { YouTubeVideoBlock } from "@comet/blocks-api";
    + import { YouTubeVideoBlock } from "@comet/cms-api";
    ```

- 1d2f54bee: Require `strategyName` in `createStaticCredentialsBasicStrategy`

    The `strategyName` is then used as SystemUser which allows to distinguish between different system users (e.g. activate logging)

- 2497a062f: API Generator: Remove support for `visible` boolean, use `status` enum instead.

    Recommended enum values: Published/Unpublished or Visible/Invisible or Active/Deleted or Active/Archived

    Remove support for update visibility mutation, use existing generic update instead

- fe22985d6: API Generator: Replace graphql-type-json with graphql-scalars for JSON columns

    **Upgrading**
    1. Install graphql-scalars: `npm install graphql-scalars`
    2. Uninstall graphql-type-json: `npm install graphql-type-json`
    3. Update imports:

        ```diff
        - import { GraphQLJSONObject } from "graphql-type-json";
        + import { GraphQLJSONObject } from "graphql-scalars";
        ```

- a58918893: Remove `aspectRatio` from `YouTubeBlock`

    The block's aspect ratio options (4x3, 16x9) proved too inflexible to be of actual use in an application. Therefore, the aspect ratio field was removed. It should be defined in the application instead.

    **Migrate**

    The block requires an aspect ratio in the site. It should be set using the `aspectRatio` prop (default: `16x9`):

    ```diff
     <YouTubeVideoBlock
       data={video}
    +  aspectRatio="9x16"
     />
    ```

- 4485d1540: API Generator: Remove generated service

    The `Service#getFindCondition` method is replaced with the new `gqlArgsToMikroOrmQuery` function, which detects an entity's searchable fields from its metadata.
    Consequently, the generated service isn't needed anymore and will therefore no longer be generated.
    Remove the service from the module after re-running the API Generator.

- 3ea123f68: Increase minimum supported version of `@mikro-orm/core`, `@mikro-orm/migrations`, and `@mikro-orm/postgresql` to v5.8.4
- 769bd72f0: Use the Next.js Preview Mode for the site preview

    The preview is entered by navigating to an API Route in the site, which has to be executed in a secured environment.
    In the API Route the current scope is checked (and possibly stored), then the client is redirected to the preview.

### Minor Changes

- 5e8713488: API Generator: Add support for filtering one-to-many relations by id
- f1d0f023d: API Generator: Add `list` option to `@CrudGenerator()` to allow disabling the list query

    Related DTO classes will still be generated as they might be useful for application code.

- bb04fb863: API Generator: Change default value for input field if property has no initializer

    Previously, the following property of an entity

    ```ts
    @Property({ type: types.date, nullable: true })
    @Field({ nullable: true })
    availableSince?: Date;
    ```

    resulted in the following input being generated:

    ```ts
    @IsNullable()
    @IsDate()
    @Field({ nullable: true })
    availableSince?: Date;
    ```

    This was problematic for two reasons:
    1.  The error message would be misleading when trying to create an entity without providing a value for the property. For example, a valid GraphQL mutation

        ```graphql
        mutation CreateProduct {
            createProduct(input: { title: "A", slug: "A", description: "FOO" }) {
                id
                availableSince
            }
        }
        ```

        would result in the following error:

        ```
        "isDate": "availableSince must be a Date instance"
        ```

    2.  Relying on the initializer as the default value is not obvious and appears somewhat magical.

    To address this, we now use `null` as the default value for nullable properties if no initializer is provided. If an initializer is provided, it is used as the default value.

- 8d920da56: CRUD Generator: Add support for date-only fields
- 36cdd70f1: InternalLinkBlock: add scope to targetPage in output

    This allows for example using the language from scope as url prefix in a multi-language site

- bfa94b74b: API Generator: Generate field resolver for root blocks

    This allows skipping the `@Field` annotation for root blocks in the entity and it doesn't need the field middleware anymore.

- f38ecc186: API Generator: Add support for enum array filter and sort
- 4485d1540: API Generator: Add `search` argument to `OneToManyFilter` and `ManyToManyFilter`

    Performs a search like the `search` argument in the list query.

- b7560e3a7: Add preview image to `YouTubeVideoBlock` and `DamVideoBlock`

    The `YouTubeVideoBlock` and the `DamVideoBlock` now support a preview image out of the box. For customisation the default `VideoPreviewImage` component can be overridden with the optional `renderPreviewImage` method.

    It is recommended to replace the custom implemented video blocks in the projects with the updated `YouTubeVideoBlock` and `DamVideoBlock` from the library.

- 2f0675b83: API Generator: Add support for filtering many-to-many relations by id

### Patch Changes

- 9c8a9a190: API Generator: Add missing type for integer fields in input type
- Updated dependencies [e15927594]
- Updated dependencies [ebf597120]
- Updated dependencies [b7560e3a7]
    - @comet/blocks-api@7.0.0

## 7.0.0-beta.6

### Patch Changes

- @comet/blocks-api@7.0.0-beta.6

## 7.0.0-beta.5

### Patch Changes

- @comet/blocks-api@7.0.0-beta.5

## 7.0.0-beta.4

### Major Changes

- b7560e3a7: Move `YouTubeVideoBlock` to `@cms` packages

    **Migrate**

    ```diff
    - import { YouTubeVideoBlock } from "@comet/blocks-admin";
    + import { YouTubeVideoBlock } from "@comet/cms-admin";
    ```

    ```diff
    - import { YouTubeVideoBlock } from "@comet/blocks-api";
    + import { YouTubeVideoBlock } from "@comet/cms-api";
    ```

- a58918893: Remove `aspectRatio` from `YouTubeBlock`

    The block's aspect ratio options (4x3, 16x9) proved too inflexible to be of actual use in an application. Therefore, the aspect ratio field was removed. It should be defined in the application instead.

    **Migrate**

    The block requires an aspect ratio in the site. It should be set using the `aspectRatio` prop (default: `16x9`):

    ```diff
     <YouTubeVideoBlock
       data={video}
    +  aspectRatio="9x16"
     />
    ```

- 3ea123f68: Increase minimum supported version of `@mikro-orm/core`, `@mikro-orm/migrations`, and `@mikro-orm/postgresql` to v5.8.4

### Minor Changes

- bfa94b74b: API Generator: Generate field resolver for root blocks

    This allows skipping the `@Field` annotation for root blocks in the entity and it doesn't need the field middleware anymore.

- b7560e3a7: Add preview image to `YouTubeVideoBlock` and `DamVideoBlock`

    The `YouTubeVideoBlock` and the `DamVideoBlock` now support a preview image out of the box. For customisation the default `VideoPreviewImage` component can be overridden with the optional `renderPreviewImage` method.

    It is recommended to replace the custom implemented video blocks in the projects with the updated `YouTubeVideoBlock` and `DamVideoBlock` from the library.

### Patch Changes

- Updated dependencies [b7560e3a7]
    - @comet/blocks-api@7.0.0-beta.4

## 7.0.0-beta.3

### Major Changes

- caefa1c5d: Rename `DateFilter` to `DateTimeFilter`

    This leaves room for a future DateFilter that only filters by date, not time.

    **Upgrading**
    1. Change import

    ```diff
    - import { DateFilter } from "@comet/cms-api";
    + import { DateTimeFilter } from "@comet/cms-api";
    ```

    2. Re-run API Generator.

- fe22985d6: API Generator: Replace graphql-type-json with graphql-scalars for JSON columns

    **Upgrading**
    1. Install graphql-scalars: `npm install graphql-scalars`
    2. Uninstall graphql-type-json: `npm install graphql-type-json`
    3. Update imports:

        ```diff
        - import { GraphQLJSONObject } from "graphql-type-json";
        + import { GraphQLJSONObject } from "graphql-scalars";
        ```

### Minor Changes

- 5e8713488: API Generator: Add support for filtering one-to-many relations by id

### Patch Changes

- 9c8a9a190: API Generator: Add missing type for integer fields in input type
    - @comet/blocks-api@7.0.0-beta.3

## 7.0.0-beta.2

### Minor Changes

- 2f0675b83: API Generator: Add support for filtering many-to-many-relations by id

### Patch Changes

- Updated dependencies [87ef5fa36]
    - @comet/blocks-api@7.0.0-beta.2

## 7.0.0-beta.1

### Major Changes

- c3940df58: Replace `additionalMimeTypes` and `overrideAcceptedMimeTypes` in `DamModule#damConfig` with `acceptedMimeTypes`

    You can now add mime types like this:

    ```ts
    DamModule.register({
        damConfig: {
            acceptedMimeTypes: [...damDefaultAcceptedMimetypes, "something-else"],
        },
    });
    ```

    And remove them like this:

    ```ts
    DamModule.register({
        damConfig: {
            acceptedMimeTypes: damDefaultAcceptedMimetypes.filter((mimeType) => mimeType !== "application/zip"),
        },
    });
    ```

    Don't forget to also remove/add the mime types in the admin's `DamConfigProvider`

- c3940df58: Rename `defaultDamAcceptedMimetypes` to `damDefaultAcceptedMimetypes`

### Minor Changes

- f38ecc186: API Generator: Add support for enum array filter and sort

### Patch Changes

- 10424c744: Fix `SvgImageBlock` in site by always loading `fileUrl`

## 7.0.0-beta.0

### Major Changes

- 9a1b01669: Remove CDN config from DAM

    It was a bad idea to introduce this in the first place, because `@comet/cms-api` should not be opinionated about how the CDN works.

    Modern applications require all traffic to be routed through a CDN. Cloudflare offers a tunnel, which made the origin-check obsolete, so we introduced a flag to disable the origin check.

    Also changes the behavior of the `FilesService::createFileUrl()`-method which now expects an options-object as second argument.

    ## How to migrate (only required if CDN is used):

    Remove the following env vars from the API

    ```
    DAM_CDN_ENABLED=
    DAM_CDN_DOMAIN=
    DAM_CDN_ORIGIN_HEADER=
    DAM_DISABLE_CDN_ORIGIN_HEADER_CHECK=false
    ```

    If you want to enable the origin check:
    1. Set the following env vars for the API

    ```
    CDN_ORIGIN_CHECK_SECRET="Use value from DAM_CDN_ORIGIN_HEADER to avoid downtime"
    ```

    _environment-variables.ts_

    ```
    @IsOptional()
    @IsString()
    CDN_ORIGIN_CHECK_SECRET: string;
    ```

    _config.ts_

    ```
    cdn: {
        originCheckSecret: envVars.CDN_ORIGIN_CHECK_SECRET,
    },
    ```

    2. Add CdnGuard

    ```
    // if CDN is enabled, make sure all traffic is either coming from the CDN or internal sources
    if (config.cdn.originCheckSecret) {
        app.useGlobalGuards(new CdnGuard({ headerName: "x-cdn-origin-check", headerValue: config.cdn.originCheckSecret }));
    }
    ```

    3. DNS changes might be required. `api.example.com` should point to CDN, CDN should point to internal API domain

- f74544524: Change language field in User and CurrentUser to locale
- 0588e212c: Remove `locale`-field from `User`-object
    - Providing the locale is not mandatory for ID-Tokens
    - Does not have a real use case (better rely on the Accept-Language header of the browser to determine the language of the current user)

- 46b86ba5f: `FilesService#createFileDownloadUrl` now expects an options object as second parameter

    ```diff
    - this.filesService.createFileDownloadUrl(file, previewDamUrls)
    + this.filesService.createFileDownloadUrl(file, { previewDamUrls, relativeDamUrls })
    ```

- 0e6debb06: CRUD Generator: Remove `lastUpdatedAt` argument from update mutations
- ebf597120: Make `@nestjs/platform-express` a peer dependency

    Make sure that `@nestjs/platform-express` is installed in the application.

- e15927594: Support "real" dependency injection in `BlockData#transformToPlain`

    Previously we supported poor man's dependency injection using the `TransformDependencies` object in `transformToPlain`.
    This is now replaced by a technique that allows actual dependency injection.

    **Example**

    ```ts
    class NewsLinkBlockData extends BlockData {
        @BlockField({ nullable: true })
        id?: string;

        transformToPlain() {
            // Return service that does the transformation
            return NewsLinkBlockTransformerService;
        }
    }

    type TransformResponse = {
        news?: {
            id: string;
            slug: string;
        };
    };

    @Injectable()
    class NewsLinkBlockTransformerService implements BlockTransformerServiceInterface<NewsLinkBlockData, TransformResponse> {
        // Use dependency injection here
        constructor(@InjectRepository(News) private readonly repository: EntityRepository<News>) {}

        async transformToPlain(block: NewsLinkBlockData, context: BlockContext) {
            if (!block.id) {
                return {};
            }

            const news = await this.repository.findOneOrFail(block.id);

            return {
                news: {
                    id: news.id,
                    slug: news.slug,
                },
            };
        }
    }
    ```

    Adding this new technique results in a few breaking changes:
    - Remove dynamic registration of `BlocksModule`
    - Pass `moduleRef` to `BlocksTransformerMiddlewareFactory` instead of `dependencies`
    - Remove `dependencies` from `BlockData#transformToPlain`

    See the [migration guide](https://docs.comet-dxp.com/docs/migration-guide/migration-from-v6-to-v7) on how to migrate.

- 9bed75638: API Generator: Add new `dedicatedResolverArg` option to `@CrudField` to generate better API for Many-to-one-relations
    - Add foreign id as argument to create mutation
    - Add foreign id as argument to list query

- 28322b422: Refactor auth-decorators
    - Remove `@PublicApi()`-decorator
    - Rename `@DisableGlobalGuard()`-decorator to `@DisableCometGuards()`

    The `@DisableCometGuards()`-decorator will only disable the AuthGuard when no `x-include-invisible-content`-header is set.

- ebf597120: Remove unused/unnecessary peer dependencies

    Some dependencies were incorrectly marked as peer dependencies.
    If you don't use them in your application, you may remove the following dependencies:
    - Admin: `axios`
    - API: `@aws-sdk/client-s3`, `@azure/storage-blob` and `pg-error-constants`

- 2497a062f: API Generator: Remove support for `visible` boolean, use `status` enum instead.

    Recommended enum values: Published/Unpublished or Visible/Invisible or Active/Deleted or Active/Archived

    Remove support for update visibility mutation, use existing generic update instead

- 769bd72f0: Uses the Next.JS Preview mode for the site preview

    The preview is entered by navigating to an API-Route in the site, which has to be executed in a secured environment.
    In the API-Routes the current scope is checked (and possibly stored), then the client is redirected to the Preview.

    // TODO Move the following introduction to the migration guide before releasing

    Requires following changes to site:
    - Import `useRouter` from `next/router` (not exported from `@comet/cms-site` anymore)
    - Import `Link` from `next/link` (not exported from `@comet/cms-site` anymore)
    - Remove preview pages (pages in `src/pages/preview/` directory which call `createGetUniversalProps` with preview parameters)
    - Remove `createGetUniversalProps`
        - Just implement `getStaticProps`/`getServerSideProps` (Preview Mode will SSR automatically)
        - Get `previewData` from `context` and use it to configure the GraphQL Client
    - Add `SitePreviewProvider` to `App` (typically in `src/pages/_app.tsx`)
    - Provide a protected environment for the site
        - Make sure that a Authorization-Header is present in this environment
        - Add a Next.JS API-Route for the site preview (eg. `/api/site-preview`)
        - Call `getValidatedSitePreviewParams()` in the API-Route (calls the API which checks the Authorization-Header with the submitted scope)
        - Use the `path`-part of the return value to redirect to the preview

    Requires following changes to admin
    - The `SitesConfig` must provide a `sitePreviewApiUrl`

### Minor Changes

- f1d0f023d: API Generator: Add `list` option to `@CrudGenerator()` to allow disabling the list query

    Related DTO classes will still be generated as they might be useful for application code.

- 36cdd70f1: InternalLinkBlock: add scope to targetPage in output

    This allows for example using the language from scope as url prefix in a multi-language site

- 1d2f54bee: Require `strategyName` in `createStaticCredentialsBasicStrategy`

    The `strategyName` is then used as SystemUser which allows to distinguish between different system users (e.g. activate logging)

### Patch Changes

- Updated dependencies [e15927594]
- Updated dependencies [ebf597120]
    - @comet/blocks-api@7.0.0-beta.0

## 6.17.1

### Patch Changes

- 76ca3bf98: Remove index signature from `ContentScope` interface

    This allows using scope DTOs without index signature in `@ScopedEntity()`.
    - @comet/blocks-api@6.17.1

## 6.17.0

### Minor Changes

- 9ddf65554: Require a file extension when changing the filename in the DAM

    Previously, files in the DAM could be renamed without restrictions.
    Files could have invalid extensions (for their mimetype) or no extension at all.
    This theoretically made the following attack possible:
    1. Creating a dangerous .exe file locally
    2. Renaming it to .jpg locally
    3. Uploading the file as a .jpg
    4. Renaming it to .exe in the DAM
    5. The file is now downloaded as .exe

    Now, filenames must always have an extension that matches their mimetype.
    This is enforced in the admin and API.
    Existing files without an extension are automatically assigned an extension via a DB migration.

- 9ddf65554: Loosen the filename slugification rules

    When uploading a file to the DAM, the filename is automatically slugified.
    Previously, the slugification used pretty strict rules without a good reason.

    Now, the rules were loosened allowing uppercase characters and most special characters.
    Also, slugify now uses the locale `en` instead of `de` for special character replacements.

### Patch Changes

- 5a9c49ab5: CronJobModule: Fix job creation if resulting name exceeds 63 characters
    - @comet/blocks-api@6.17.0

## 6.16.0

### Minor Changes

- 5e830f8d9: Add an [Azure AI Translator](https://azure.microsoft.com/en-us/products/ai-services/ai-translator) implementation of the content translation feature

    To use it, do the following:

    **API:**

    ```diff
    // app.module.ts
    export class AppModule {
        static forRoot(config: Config): DynamicModule {
            return {
                imports: [
                    // ...
    +               AzureAiTranslatorModule.register({
    +                   endpoint: envVars.AZURE_AI_TRANSLATOR_ENDPOINT,
    +                   key: envVars.AZURE_AI_TRANSLATOR_KEY,
    +                   region: envVars.AZURE_AI_TRANSLATOR_REGION,
    +               }),
                ],
    ```

    Users need the `translation` permission to use the translation feature.

    **Admin:**

    Wrap the section where you want to use the content translation with the `AzureAiTranslatorProvider` provider:

    ```tsx
    <AzureAiTranslatorProvider enabled={true}>{/*  ...  */}</AzureAiTranslatorProvider>
    ```

    Note: `AzureAiTranslatorProvider` automatically checks for the `translation` permission. The translation button is only shown for users with this permission.

### Patch Changes

- f7d405dfa: Fix the duplicate filename check in `FilesService#updateByEntity`

    Previously, we checked the existing file name (`entity.name`) for the check instead of the new name (`input.name`). This never resulted in an error.
    - @comet/blocks-api@6.16.0

## 6.15.1

### Patch Changes

- @comet/blocks-api@6.15.1

## 6.15.0

### Patch Changes

- 9b29afd87: Add missing `@RequiredPermission` to `createZip` route
- 0654f7bce: Handle unauthorized and unauthenticated correctly in error dialog

    The error dialog now presents screens according to the current state. Required to work in all conditions:
    - `CurrentUserProvider` must be beneath `MuiThemeProvider` and `IntlProvider` and above `RouterBrowserRouter`
    - `ErrorDialogHandler` must be parallel to `CurrentUserProvider`

- Updated dependencies [c7f5637bd]
    - @comet/blocks-api@6.15.0

## 6.14.1

### Patch Changes

- @comet/blocks-api@6.14.1

## 6.14.0

### Minor Changes

- 73dfb61c9: Add `PhoneLinkBlock` and `EmailLinkBlock`
- dddb03d1b: Add capability to generate alt texts and titles for images in DAM

    You can find instructions for adding this feature to your project [in the docs](https://docs.comet-dxp.com/docs/content-generation/).

- 73dfb61c9: Add `IsPhoneNumber` and `isPhoneNumber` validators to validate phone numbers

### Patch Changes

- b7dbd7a18: Export `DisablePermissionCheck` constant to enable usage in application code
- Updated dependencies [73dfb61c9]
- Updated dependencies [87ef5fa36]
    - @comet/blocks-api@6.14.0

## 6.13.0

### Minor Changes

- 2a5e00bfb: API Generator: Add `list` option to `@CrudGenerator()` to allow disabling the list query

    Related DTO classes will still be generated as they might be useful for application code.

- dcf3f70f4: Add `overrideAcceptedMimeTypes` configuration to DAM

    If set, only the mimetypes specified in `overrideAcceptedMimeTypes` will be accepted.

    You must configure `overrideAcceptedMimeTypes` in the API and the admin interface:

    API:

    ```diff
    // app.module.ts

    DamModule.register({
        damConfig: {
            // ...
    +       overrideAcceptedMimeTypes: ["image/png"],
            // ...
        },
        // ...
    }),
    ```

    Admin:

    ```diff
    // App.tsx

    <DamConfigProvider
        value={{
            // ...
    +       overrideAcceptedMimeTypes: ["image/png"],
        }}
    >
    ```

- 07a7291fe: Adjust `searchToMikroOrmQuery` function to reduce the amount of irrelevant results

    This is done by using a combination of AND- and OR-queries. For example, a search of `red shirt` won't give all products containing `red` OR `shirt` but rather returns all products that have the words `red` AND `shirt` in some column. The words don't have to be in the same column.

### Patch Changes

- 5bbb2ee76: API Generator: Don't add `skipScopeCheck` when the entity has a `@ScopedEntity()` decorator
- ebdd108f0: API Generator: Fix imports in generated code for more than one level deep relations
- b925f940f: API Generator: Support relation with primary key type `int` (in addition to `integer`)
    - @comet/blocks-api@6.13.0

## 6.12.0

### Minor Changes

- 3ee8c7a33: Add a `DamFileDownloadLinkBlock` that can be used to download a file or open it in a new tab

    Also, add new `/dam/files/download/:hash/:fileId/:filename` endpoint for downloading assets.

- 0597b1e0a: Add `DisablePermissionCheck` constant for use in `@RequiredPermission` decorator

    You can disable authorization for a resolver or operation by adding the decorator `@RequiredPermission(DisablePermissionCheck)`

### Patch Changes

- 67176820c: API CrudSingleGenerator: Run `transformToBlockData()` for block fields on create
- b158e6a2c: ChangesCheckerConsole: Start exactly matching job or all partially matching jobs

    Previously, the first job with a partially matching content scope was started.
    Doing so could lead to problems when multiple jobs with overlapping content scopes exist.
    For instance, jobs with the scopes `{ domain: "main", language: "de" }` and `{ domain: "main", language: "en" }` both partially match a change in `{ domain: "main", language: "de" }`.
    To fix this, we either start a single job if the content scope matches exactly or start all jobs with partially matching content scopes.
    - @comet/blocks-api@6.12.0

## 6.11.0

### Minor Changes

- 0db10a5f8: Add a console script to import redirects from a csv file

    You can use the script like this: `npm run console import-redirects file-to-import.csv`

    The CSV file must look like this:

    ```csv
    source;target;target_type;comment;scope_domain
    /test-source;/test-target;internal;Internal Example;main
    /test-source-external;https://www.comet-dxp.com/;external;External Example;secondary
    ```

### Patch Changes

- Updated dependencies [93a84b651]
    - @comet/blocks-api@6.11.0

## 6.10.0

### Minor Changes

- 536fdb85a: Add `createUserFromIdToken` to `UserService`-interface

    This allows to override the default implementation of creating the User-Object from the JWT when logging in via `createAuthProxyJwtStrategy`

- f528bc340: CronJobModule: Show logs for job run

### Patch Changes

- d340cabc2: DAM: Fix the duplicate name check when updating a file

    Previously, there were two bugs:
    1. In the `EditFile` form, the `folderId` wasn't passed to the mutation
    2. In `FilesService#updateByEntity`, the duplicate check was always done against the root folder if no `folderId` was passed

    This caused an error when saving a file in any folder if there was another file with the same name in the root folder.
    And it was theoretically possible to create two files with the same name in one folder (though this was still prevented by admin-side validation).

- 584d14d86: Only return duplicates within the same scope in the `FilesResolver#duplicates` field resolver

    As a side effect `FilesService#findAllByHash` now accepts an optional scope parameter.
    - @comet/blocks-api@6.10.0

## 6.9.0

### Minor Changes

- 94ac6b729: API Generator: Fix generated API for many-to-many-relations with custom relation entity

### Patch Changes

- Updated dependencies [8be9565d1]
    - @comet/blocks-api@6.9.0

## 6.8.0

### Minor Changes

- d6ca50a52: Enhanced the access log functionality to now skip logging for field resolvers in GraphQL context. This change improves the readability and relevance of our logs by reducing unnecessary entries.
- ebdbabc21: Extend `searchToMikroOrmQuery` function to support quoted search strings.

    Quotes searches can be done with single (`'...'`) or double quotation marks (`"..."`).

### Patch Changes

- 35efa037b: API-Generator: Remove unnecessary await for delete mutation
- d3a06fcaf: Prevent block-meta.json write in read-only file systems
- a696ec7b9: Handle DAM scope correctly in the `findCopiesOfFileInScope` query and the `importDamFileByDownload` mutation

    Previously, these endpoints would cause errors if no DAM scoping was used.

- Updated dependencies [be8664c75]
- Updated dependencies [90c6f192e]
- Updated dependencies [90c6f192e]
    - @comet/blocks-api@6.8.0

## 6.7.0

### Minor Changes

- 645f19df9: Add `nullable` param to `@AffectedEntity` to support id args that can be `null` or `undefined`
- a0506e103: API Generator: Support validator decorators for input generation

### Patch Changes

- 645f19df9: Fix mutations `moveDamFiles`, `copyFilesToScope`, `archiveDamFiles` and `restoreDamFiles` by adding `@AffectedEntity` to enable scope checks
- 8315f10cb: Fix order of `@RequiredPermission()` decorators

    Decorators defined on handlers should be considered before decorators defined on classes.

- 6eeaaa223: The CometAuthGuards now only creates the `CurrentUser` just on a request-basis and skips when called in a fieldResolver (e.g. when `fieldResolverEnhancers` contains `guards`).
    - @comet/blocks-api@6.7.0

## 6.6.2

### Patch Changes

- @comet/blocks-api@6.6.2

## 6.6.1

### Patch Changes

- 890795fda: Fix calculation of `totalCount` in `DependenciesService#getDependents`
    - @comet/blocks-api@6.6.1

## 6.6.0

### Minor Changes

- 6160119fe: Provide a `User`-interface that allows module augmentation and hence storing additional data.
- 38df2b4de: Add `userToLog`-option to AccessLogModule

### Patch Changes

- Updated dependencies [e880929d8]
    - @comet/blocks-api@6.6.0

## 6.5.0

### Minor Changes

- 2f64daa9b: Add `title` field to link block

    Perform the following steps to use it in an application:
    1. API: Use the new `createLinkBlock` factory to create the LinkBlock:

        ```ts
        import { createLinkBlock } from "@comet/cms-api";

        // ...

        const LinkBlock = createLinkBlock({
            supportedBlocks: { internal: InternalLinkBlock, external: ExternalLinkBlock, news: NewsLinkBlock },
        });
        ```

    2. Site: Pass the `title` prop to LinkBlock's child blocks:

    ```diff
    const supportedBlocks: SupportedBlocks = {
    -   internal: ({ children, ...props }) => <InternalLinkBlock data={props}>{children}</InternalLinkBlock>,
    +   internal: ({ children, title, ...props }) => <InternalLinkBlock data={props} title={title}>{children}</InternalLinkBlock>,
        // ...
    };
    ```

### Patch Changes

- Updated dependencies [2f64daa9b]
    - @comet/blocks-api@6.5.0

## 6.4.0

### Minor Changes

- 9ff9d9840: Support using a service in `@ScopedEntity()` decorator

    This can be useful when an entity's scope cannot be derived directly from the passed entity.
    For example, a `Page` document's scope is derived by the `PageTreeNode` the document is attached to, but there is no database relation between the two entities.

    For page tree document types you can use the provided `PageTreeNodeDocumentEntityScopeService`.

- 955182b09: Make permission-check for field-resolvers optional
- 322da3831: Add `@EntityInfo()` decorator

    Adding `@EntityInfo()` to an entity is necessary to correctly display dependencies in the admin application.
    You can find more information in [the docs](https://docs.comet-dxp.com/docs/dependencies/).

- 1910551c7: Log the correct user IP even if the app is behind a proxy

    The package [request-ip](https://www.npmjs.com/package/request-ip) is now used to get the actual user IP even if the app runs behind a proxy. Previously, the proxy's IP was logged.

- 2d1b9467a: createImageLinkBlock: Allow overriding name

    This allows using two different `ImageLink` blocks in one application.

    Perform the following steps to override the name:
    1. API: Add the name as second argument in the `createImageLinkBlock` factory:

        ```diff
        const MyCustomImageLinkBlock = createImageLinkBlock(
            { link: InternalLinkBlock },
        +   "MyCustomImageLink"
        );
        ```

    2. Admin: Set the `name` option in the `createImageLinkBlock` factory:

        ```diff
        const MyCustomImageLinkBlock = createImageLinkBlock({
            link: InternalLinkBlock,
        +   name: "MyCustomImageLink"
        });
        ```

### Patch Changes

- 8568153d8: API Generator: Add missing `ObjectQuery` import
- 1910551c7: Remove user name from access log

    We decided to remove the user name because of privacy concerns.

- bfc1a4614: API Generator: Correctly support default value for date fields
- b478a8b71: Don't fail in ChangesCheckerInterceptor because of stricter content scope check
- Updated dependencies [0efae68ff]
    - @comet/blocks-api@6.4.0

## 6.3.0

### Minor Changes

- fc1b16fe: Allow overriding the block context in `BlocksTransformerService#transformToPlain`

### Patch Changes

- e2e2114b: Fix parsing of `contentScopeAnnotation` in `KubernetesService#getContentScope`
    - @comet/blocks-api@6.3.0

## 6.2.1

### Patch Changes

- f1457306: Ignore user permissions when using system user

    The `UserPermissionsGuard` didn't allow requests when using a system user (e.g., basic authorization during site build).
    - @comet/blocks-api@6.2.1

## 6.2.0

### Minor Changes

- beeea1dd: Remove `availablePermissions`-option in `UserPermissionsModule`

    Simply remove the `Permission` interface module augmentation and the `availablePermissions`-option from the application.

- 151e1218: Support multiple `@AffectedEntity()`-decorators for a single function

### Patch Changes

- 04afb3ee: Fix attached document deletion when deleting a page tree node
- ad153c99: Always use preview DAM URLs in the admin application

    This fixes a bug where the PDF preview in the DAM wouldn't work because the file couldn't be included in an iFrame on the admin domain.

    We already intended to use preview URLs everywhere in [v5.3.0](https://github.com/vivid-planet/comet/releases/tag/v5.3.0#:~:text=Always%20use%20the%20/preview%20file%20URLs%20in%20the%20admin%20application). However, the `x-preview-dam-urls` header wasn't passed correctly to the `createFileUrl()` method everywhere. As a result, preview URLs were only used in blocks but not in the DAM. Now, the DAM uses preview URLs as well.

- Updated dependencies [75865caa]
    - @comet/blocks-api@6.2.0

## 6.1.0

### Minor Changes

- 7ea43eb3: Make the `UserService`-option of the `UserPermissionsModule` optional.

    The service is still necessary though for the Administration-Panel.

- 86cd5c63: Allow a callback for the `availableContentScopes`-option of the `UserPermissionsModule`

    Please be aware that when using this possibility to make sure to cache the
    response properly as this is called for every request to the API.

- 737ab3b9: Allow returning multiple content scopes in `ScopedEntity`-decorator
- f416510b: Remove `CurrentUserLoader` and `CurrentUserInterface`

    Overriding the the current user in the application isn't supported anymore when using the new `UserPermissionsModule`, which provides the current user DTO itself.

### Patch Changes

- ef84331f: Fix type of @RequiredPermission to accept a non-array string for a single permission
- 8e158f8d: Add missing `@RequiredPermission()` decorator to `FileLicensesResolver`
- 50184410: API Generator: Add missing `scope` argument and filter to `<entity>BySlug` query
- 1f6c58e8: API Generator: support GraphQLJSONObject input for fields that are not a InputType class
    - @comet/blocks-api@6.1.0

## 6.0.0

### Major Changes

- d20f59c0: Enhance CronJob module
    - Show latest job run on `CronJobsPage`
    - Add option to manually trigger cron jobs to `CronJobsPage`
    - Add subpage to `CronJobsPage` that shows all job runs

    Warning: Only include this module if all your users should be able to trigger cron jobs manually or you have sufficient access control in place.

    Includes the following breaking changes:
    - Rename `JobStatus` to `KubernetesJobStatus` to avoid naming conflicts
    - Rename `BuildRuntime` to `JobRuntime`

- b3ceaef1: Replace ContentScopeModule with UserPermissionsModule

    Breaking changes:
    - ContentScope-Module has been removed
    - canAccessScope has been moved to AccessControlService and refactored into isAllowed
    - contentScopes- and permissions-fields have been added to CurrentUser-Object
    - role- and rights-fields has been removed from CurrentUser-Object
    - AllowForRole-decorator has been removed
    - Rename decorator SubjectEntity to AffectedEntity
    - Add RequiredPermission-decorator and make it mandatory when using UserPermissionsModule

    Upgrade-Guide: tbd

### Patch Changes

- @comet/blocks-api@6.0.0

## 5.6.0

### Patch Changes

- Updated dependencies [fd10b801]
    - @comet/blocks-api@5.6.0

## 5.5.0

### Minor Changes

- bb2c76d8: Deprecate `FileUploadInterface` interface

    Use `FileUploadInput` instead.

- bb2c76d8: Deprecate `download` helper

    The helper is primarily used to create a `FileUploadInput` (previously `FileUploadInterface`) input for `FilesService#upload` while creating fixtures.
    However, the name of the helper is too generic to be part of the package's public API.
    Instead, use the newly added `FileUploadService#createFileUploadInputFromUrl`.

    **Example:**

    ```ts
    @Injectable()
    class ImageFixtureService {
        constructor(
            private readonly filesService: FilesService,
            private readonly fileUploadService: FileUploadService,
        ) {}

        async generateImage(url: string): Promise<FileInterface> {
            const upload = await this.fileUploadService.createFileUploadInputFromUrl(url);
            return this.filesService.upload(upload, {});
        }
    }
    ```

### Patch Changes

- @comet/blocks-api@5.5.0

## 5.4.0

### Minor Changes

- e146d8bb: Support the import of files from external DAMs

    To connect an external DAM, implement a component with the necessary logic (asset picker, upload functionality, ...). Pass this component to the `DamPage` via the `additionalToolbarItems` prop.

    ```tsx
    <DamPage
        // ...
        additionalToolbarItems={<ImportFromExternalDam />}
    />
    ```

    You can find an [example](demo/admin/src/dam/ImportFromUnsplash.tsx) in the demo project.

- 27bf643b: Add `PublicUploadsService` to public API

    The service can be used to programmatically create public uploads, such as when creating fixtures.

- df5c959c: Remove license types `MICRO` and `SUBSCRIPTION`

    The `LicenseType` enum no longer contains the values `MICRO` and `SUBSCRIPTION`. The database migration will automatically update all licenses of type `MICRO` or `SUBSCRIPTION` to `RIGHTS_MANAGED`.

### Patch Changes

- 60f5208e: Fix encoding of special characters in names of uploaded files

    For example:

    Previously:
    - `€.jpg` -> `a.jpg`
    - `ä.jpg` -> `ai.jpg`

    Now:
    - `€.jpg` -> `euro.jpg`
    - `ä.jpg` -> `ae.jpg`
    - @comet/blocks-api@5.4.0

## 5.3.0

### Minor Changes

- 570fdbc8: CRUD Generator: Add support for `ArrayType` fields in generated input
- 8d0e3ee1: CRUD Generator: Add support for enum arrays in input

### Patch Changes

- dfb3c840: CRUD Generator: Correctly support `type: "text"` fields in filter and sort
- c883d351: Consider filtered mimetypes when calculating the position of a DAM item in `DamItemsService`'s `getDamItemPosition()`

    Previously, the mimetypes were ignored, sometimes resulting in an incorrect position.

- Updated dependencies [920f2b85]
    - @comet/blocks-api@5.3.0

## 5.2.0

### Minor Changes

- bbc0a0a5: Add access logging to log information about the request to standard output. The log contains information about the requester and the request itself. This can be useful for fulfilling legal requirements regarding data integrity or for forensics.

    There are two ways to integrate logging into an application:

    **First option: Use the default implementation**

    ```ts
    imports: [
        ...
        AccessLogModule,
        ...
    ]
    ```

    **Second option: Configure logging**

    Use the `shouldLogRequest` to prevent logging for specific requests. For instance, one may filter requests for system users.

    ```ts
    imports: [
        ...
        AccessLogModule.forRoot({
            shouldLogRequest: ({user, req}) => {
                // do something
                return true; //or false
            },
        }),
        ...
    ]
    ```

    More information can be found in the documentation under 'Authentication > Access Logging'.

### Patch Changes

- 1a170b9b: API Generator: Use correct type for `where` when `getFindCondition` service method is not used
- 6b240a01: CRUD Generator: Correctly support `type: "text"` fields in input
    - @comet/blocks-api@5.2.0

## 5.1.0

### Patch Changes

- @comet/blocks-api@5.1.0

## 5.0.0

### Major Changes

- 9d3e8555: Add scoping to the DAM

    The DAM scoping can be enabled optionally. You can still use the DAM without scoping.

    To enable DAM scoping, you must

    In the API:
    - Create a DAM folder entity using `createFolderEntity({ Scope: DamScope });`
    - Create a DAM file entity using `createFileEntity({ Scope: DamScope, Folder: DamFolder });`
    - Pass the `Scope` DTO and the `File` and `Folder` entities when intializing the `DamModule`

    In the Admin:
    - Set `scopeParts` in the `DamConfigProvider` (e.g. `<DamConfigProvider value={{ scopeParts: ["domain"] }}>`)
    - Render the content scope indicator in the `DamPage`
        ```tsx
        <DamPage renderContentScopeIndicator={(scope) => <ContentScopeIndicator scope={scope} />} />
        ```

    You can access the current DAM scope in the Admin using the `useDamScope()` hook.

    See the [Demo project](https://github.com/vivid-planet/comet/pull/976) for an example on how to enable DAM scoping.

- 9d3e8555: Remove `File` entity export

    Depending on your use case, you may either use the file entity created by `createFileEntity()` in the application code, or the `FileInterface` export instead.

- 9d3e8555: Remove `Folder` entity export

    Depending on your use case, you may either use the folder entity created by `createFolderEntity()` in the application code, or the `FolderInterface` export instead.

- c19c9271: Rename the DAM entity classes to match their commonly used aliases (`File` -> `DamFile`, `Folder` -> `DamFolder`)

- 9d3e8555: Change `FilesService.upload()` method signature

    The method now accepts an options object with a `scope` field as second argument.

    **Before**

    ```ts
    await filesService.upload(file, folderId);
    ```

    **After**

    ```ts
    await filesService.upload(file, { folderId, scope });
    ```

- c91906d2: Move the `DiscoverService` from the `BlocksModule` to the new `DependenciesModule`

    The `discoverRootBlocks()` method now also returns the `graphqlObjectType` of an entity. Furthermore, a `discoverTargetEntities()` method was added that returns information about all potential dependency targets.

- c91906d2: Rename `BlockIndexService` to `DependenciesService` and move it from the `BlocksModule` to the new `DependenciesModule`.

    Following changes were made to the `DependenciesService`:
    - A stale-while-revalidate approach for refreshing the view was added to `refreshViews()`. If you need the view to be updated unconditionally, you must call the method with the new `force: true` option.
    - `getDependents()` and `getDependencies()` were added to fetch the dependents or dependencies of an entity instance from the view.

- dc130d16: Remove deprecated `SkipBuildInterceptor`

    The `SkipBuildInterceptor` was never intended to be part of the public API. If you want to skip a build for an operation, use the `@SkipBuild()` decorator instead.

- c91906d2: The `PageTreeModule` now requires the passed `PageTreeNode` entity to be named "PageTreeNode"
- API CRUD Generator:
    - a987e17c: Support relations in entities

### Minor Changes

- f2aa78c8: Improve undefined/null handling for update mutations
    - Add `@IsUndefinable()` and `@IsNull()` validators intended to be used in input types (similar, but more specific than `@IsOptional()` from `class-validator`)
    - Add custom `PartialType` intended to be used for update input types (similar to `@nestjs/mapped-types` but uses `@IsUndefinable()` instead of `@IsOptional()`)

- 9875e7d4: Support automatically importing DAM files into another scope when copying documents from one scope to another
- 8ed96981: Support copy/pasting DAM files across server instances by downloading the copied file
- 6b9787e6: Offer possibility to opt-out of creating a redirect when changing the slug of a page (previously, a redirect was always created)
- c49472c3: Add `calculateHashForFile()` method to `FilesService`
- 3a6dab1c: `searchToMikroOrmQuery()` now splits search string by spaces for a better search experience
- 621c9bd2: Extend configuration options for `createAuthProxyJwtStrategy()`. It's now possible to override the strategy and strategy options.
- c91906d2: Add `DependenciesResolverFactory` and `DependentsResolverFactory` to easily add field resolvers for the `dependencies` or `dependents` of an entity

    You can use the factories as follows:

    ```ts
    @Module({
        // ...
        providers: [ExampleResolver, DependenciesResolverFactory.create(Example), DependentsResolverFactory.create(Example)],
        // ...
    })
    export class ExampleModule {}
    ```

- c6e47a3f: Add `updatedAt` timestamp to `PageTreeNode`

    Adds an `updatedAt` timestamp to the`PageTreeNode` that is inferred from the attached documents. This timestamp can be used to sort the PageTree. One common use case is the `LatestContentUpdatesDashboardWidget`, which can now be limited to the current content scope.

    Note: The `updatedAt` timestamp is set to the current time when the migration is executed. You will need to write an additional migration if you want the timestamp to reflect the `updatedAt` timestamp of the active attached document.

- API CRUD Generator:
    - f2aa78c8: Update API CRUD Generator to allow partial update in update mutations:
        - passing `null` for a field means: set this field to null (e.g. a relation or a Date)
        - passing `undefined` for a field means: do not change this field (keep the previous value)

    - 6acd2d0a: Support default values

        Usage: Set a default value in the entity and it will be used as default in the generated input type. `null` for relations is also supported by setting the default value in the entity to `undefined`.

    - 1278e6d9: Generation of create/update/delete mutations is now optional

        Setting create/update/delete boolean of `@CrudGenerator()` decorator to false will skip the generation of these mutations

    - 17165e96: Support IDs of type string and integer (previously only UUID was supported)
    - 31c4779e: Add support for nested json and embedded properties

### Patch Changes

- 564f66d3: Allow `:`, `?`, `=` and `&` in redirect source paths
- b8e040ca: API Generator: Add support for TypeScript paths (e.g., `@src/`) by using the project's TSConfig
- 1a95f4cc: Add `@SkipBuild()` decorator to mutations without content changes
- c1502d14: Ignore field resolvers in `ChangesCheckerInterceptor`
- 11ec1bbf: Fix GQL Type for `damItemListPosition` query (before Float, now Int)
- 49e85432: Expiration of JWT will be checked now. If you use this strategy, please make sure that the JWT will be refreshed (e.g. set refresh in Auth-Proxy or use updated charts).
- 1cae2388: The `updatePageTreeNode` query no longer requires an `attachedDocument` argument
- cf49f3b9: `searchToMikroOrmQuery()` now ignores leading and trailing spaces. This fixes a bug where all rows were matched if there was a space before or after the search string.
- API CRUD Generator:
- 9f11ac1d: Support number fields (additional to DecimalType) in filter and sort generation
- da73c0c3: Prevent duplicate imports in generated files
- ed13b68d: Enums don't need to be exported from the entity file anymore
- b8e040ca: Add support for TypeScript paths (e.g., `@src/`) by using the project's TSConfig
- Updated dependencies [c10a86c6]
- Updated dependencies [c91906d2]
    - @comet/blocks-api@5.0.0

## 4.7.0

### Patch Changes

- @comet/blocks-api@4.7.0

## 4.6.0

### Patch Changes

- f6f7d4a4: Prevent slug change of home page in `updateNode()` and `updateNodeSlug()` of `PageTreeService`
    - @comet/blocks-api@4.6.0

## 4.5.0

### Patch Changes

- @comet/blocks-api@4.5.0

## 4.4.3

### Patch Changes

- @comet/blocks-api@4.4.3

## 4.4.2

### Patch Changes

- 896265c1: Fix improper validation of input when creating/updating page tree nodes or redirects
- cd07c107: Prevent the fileUrl from being exposed in the Site via the PixelImageBlock
    - @comet/blocks-api@4.4.2

## 4.4.1

### Patch Changes

- @comet/blocks-api@4.4.1

## 4.4.0

### Minor Changes

- d4960b05: Add loop toggle to YouTubeVideo block

### Patch Changes

- 53ce0682: get file stats from uploaded file in filestorage
- 11583624: Add content validation for SVG files to prevent the upload of SVGs containing JavaScript
- Updated dependencies [d4960b05]
    - @comet/blocks-api@4.4.0

## 4.3.0

### Minor Changes

- afc7a6b6: Add human readable label for publisher (cron jobs and jobs)
- b4264f18: Make changes checker scope-aware

### Patch Changes

- 44fbe3f9: add stream end when create files from buffer in filestorage
- 92f23a46: Change propagationPolicy for deleting jobs from default to Background

    Currently we use the default propagationPolicy for deleting jobs. This results in pods from jobs being deleted in k8s but not on OpenShift. With the value fixed to "Background", the jobs should get deleted on every system.
    Foreground would be blocking, so we use Background to be non blocking.
    - @comet/blocks-api@4.3.0

## 4.2.0

### Minor Changes

- 0fdb1b33: Add new extractGraphqlFields helper function that extracts requested fields from GraphQLResolveInfo

    Usage example:

    ```
    async products(@Info() info: GraphQLResolveInfo): Promise<PaginatedProducts> {
        const fields = extractGraphqlFields(info, { root: "nodes" });
        const options: FindOptions<Product, any> = { };
        if (fields.includes("category")) options.populate = ["category"];
        //alternative if graphql structure completely matches entities: options.populate = fields;
        const [entities, totalCount] = await this.repository.findAndCount({}, options);
    ```

### Patch Changes

- @comet/blocks-api@4.2.0

## 4.1.0

### Minor Changes

- 51466b1a: Add support for enum types to API CRUD Generator

### Patch Changes

- 51466b1a: Fix page tree node visibility update
    - @comet/blocks-api@4.1.0
