# @comet/cms-admin

## 10.1.0

### Patch Changes

- @dextinity/admin@10.1.0
- @dextinity/admin-date-time@10.1.0
- @dextinity/admin-icons@10.1.0
- @dextinity/admin-rte@10.1.0

## 10.0.1

### Patch Changes

- Updated dependencies [48748b0]
    - @dextinity/admin@10.0.1
    - @dextinity/admin-date-time@10.0.1
    - @dextinity/admin-rte@10.0.1
    - @dextinity/admin-icons@10.0.1

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/cms-admin` to `@dextinity/cms-admin`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename `CometConfigProvider` to `DextinityConfigProvider`, `useCometConfig` to `useDextinityConfig` and the `CometConfig` type to `DextinityConfig`. By convention, the project's `comet-config.json` is renamed to `dextinity-config.json`
    - Rename the `cometType` property of iframe messages to `dextinityType`. The site must use a matching `@dextinity/site-react` or `@dextinity/site-nextjs` version
    - Rename the site preview cookie from `__comet_site_preview` to `__dextinity_site_preview` and the impersonation cookie from `comet-impersonate-user-id` to `dextinity-impersonate-user-id`
    - Expect the renamed `DextinityImageResolutionException` and `DextinityValidationException` error codes in DAM file uploads. A matching `@dextinity/cms-api` version is required
    - Rename the theme component prefix from `CometAdmin` to `DextinityAdmin`. This affects `components` overrides passed to `createDextinityTheme` and the generated CSS class names
    - Rename the CSS variables from `--comet-admin-*` to `--dextinity-admin-*`
    - Replace the Comet logo in the header, the about modal and the site preview with the Dextinity logo

### Patch Changes

- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
    - @dextinity/admin-date-time@10.0.0
    - @dextinity/admin-icons@10.0.0
    - @dextinity/admin-rte@10.0.0
    - @dextinity/admin@10.0.0

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/cms-admin` to `@dextinity/cms-admin`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename `CometConfigProvider` to `DextinityConfigProvider`, `useCometConfig` to `useDextinityConfig` and the `CometConfig` type to `DextinityConfig`. By convention, the project's `comet-config.json` is renamed to `dextinity-config.json`
    - Rename the `cometType` property of iframe messages to `dextinityType`. The site must use a matching `@dextinity/site-react` or `@dextinity/site-nextjs` version
    - Rename the site preview cookie from `__comet_site_preview` to `__dextinity_site_preview` and the impersonation cookie from `comet-impersonate-user-id` to `dextinity-impersonate-user-id`
    - Expect the renamed `DextinityImageResolutionException` and `DextinityValidationException` error codes in DAM file uploads. A matching `@dextinity/cms-api` version is required
    - Rename the theme component prefix from `CometAdmin` to `DextinityAdmin`. This affects `components` overrides passed to `createDextinityTheme` and the generated CSS class names
    - Rename the CSS variables from `--comet-admin-*` to `--dextinity-admin-*`
    - Replace the Comet logo in the header, the about modal and the site preview with the Dextinity logo

### Patch Changes

## 9.5.0

### Patch Changes

- @comet/admin@9.5.0
- @comet/admin-date-time@9.5.0
- @comet/admin-icons@9.5.0
- @comet/admin-rte@9.5.0

## 9.4.0

### Minor Changes

- ca88ec6: Add `ReadOnlyBlockRenderInterface`

    A block that implements the interface provides a `ReadOnlyComponent` that renders its state without an editing UI. Rich text blocks implement it:

    ```tsx
    const RichTextBlock = createRichTextBlock({ link: LinkBlock });

    <RichTextBlock.ReadOnlyComponent state={state} />;
    ```

- ca88ec6: Accept any rich text block in `createTableBlock`, such as TipTap

    The `richText` option accepts any block that implements `ReadOnlyBlockRenderInterface`:

    ```ts
    const TipTapRichTextBlock = createTipTapRichTextBlock(...);

    createTableBlock({ richText: TipTapRichTextBlock, name: "TipTapTable" });
    ```

- 71d6a95: Add read-only rendering to the TipTap rich text block

    `createTipTapRichTextBlock` now returns a `ReadOnlyComponent` that renders saved content without an editing UI, for showing the content where it must not be editable.

    ```tsx
    const RichTextBlock = createTipTapRichTextBlock();

    <RichTextBlock.ReadOnlyComponent state={state} />;
    ```

### Patch Changes

- 4e27111: Rename the TipTap block type dropdown's `Default` entry to `Paragraph`, after the HTML tag it produces
- 0f17fbd: Open the `Permissions` tab by default when editing a user in the `UserPermissionsPage`

    Selecting a user now opens the `Permissions` tab instead of `Basic Data`, while the tab order stays unchanged. Users without the `userPermissions` permission (who don't see the `Permissions` tab) continue to open the `Basic Data` tab.

- Updated dependencies [bf1ff64]
- Updated dependencies [085b9ac]
    - @comet/admin@9.4.0
    - @comet/admin-date-time@9.4.0
    - @comet/admin-rte@9.4.0
    - @comet/admin-icons@9.4.0

## 9.3.0

### Minor Changes

- 924b66c: Add `underline` support to `createTipTapRichTextBlock`

    The `underline` inline style is now part of the `supports` list and can be toggled via a new toolbar button. The underline mark is validated by the API, rendered as `<u>` by `renderTipTapRichText`, and the DraftJS migration maps the `UNDERLINE` inline style to it when supported. Per default it is disabled, pass a `supports` list with `underline` to enable it.

### Patch Changes

- Updated dependencies [7b2d8db]
    - @comet/admin@9.3.0
    - @comet/admin-date-time@9.3.0
    - @comet/admin-rte@9.3.0
    - @comet/admin-icons@9.3.0

## 9.2.2

### Patch Changes

- @comet/admin@9.2.2
- @comet/admin-date-time@9.2.2
- @comet/admin-icons@9.2.2
- @comet/admin-rte@9.2.2

## 9.2.1

### Patch Changes

- @comet/admin@9.2.1
- @comet/admin-date-time@9.2.1
- @comet/admin-icons@9.2.1
- @comet/admin-rte@9.2.1

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

- ba56f97: Warn editors when videos that are too large for performant delivery are used

    Videos are delivered without optimization, so large videos can lead to poor loading performance. A warning is now shown when a video exceeds a configurable file size:
    - as a snackbar after uploading it to the DAM
    - as an alert on the DAM asset detail page
    - as an alert in the `DamVideoBlock` when such a video is selected

    The threshold defaults to 10 MB and can be configured (or the warning disabled entirely) via the new `videoPerformanceWarningFileSize` option in the `dam` config:

    ```tsx
    <CometConfigProvider
        dam={{
            // ...
            videoPerformanceWarningFileSize: 25, // warn for videos larger than 25 MB
            // or set to `false` to disable the warning globally
        }}
    >
    ```

### Patch Changes

- 8c866a3: Persist the DAM sorting preference across sessions

    The Digital Asset Management asset list now remembers the selected sorting (column and direction) in `localStorage` instead of resetting to alphabetical (`name` ascending) on every visit.

- 48d06d6: Fix hard-to-read text color in the DAM drag & drop upload overlay

    The upload overlay (shown when dragging files over a DAM folder) used a dark grey text color on its near-black background, making the text hard to read. It now uses white text for proper contrast.

- eb0b156: Fix the warnings page crashing due to an invalid `state` filter

    The `WarningsGrid` initialized its default filter with the field `state` instead of `status`, which doesn't exist on the `WarningFilter` input type. This caused the GraphQL request to fail with a `400 Bad Request`, crashing the warnings page (`/system/warnings`).

- Updated dependencies [5a05d97]
    - @comet/admin@9.2.0
    - @comet/admin-date-time@9.2.0
    - @comet/admin-rte@9.2.0
    - @comet/admin-icons@9.2.0

## 9.1.1

### Patch Changes

- 097f85a: Fix the dependencies list crashing due to an invalid `visible` filter

    The `DependenciesList` initialized the `visible` filter with the string `"true"` instead of the boolean `true`, causing the GraphQL request to fail with a `400 Bad Request` (`Boolean cannot represent a non boolean value`). This made the dependencies/dependents tab (e.g., on global content) crash with a network error. This is the counterpart to the earlier fix for `DependentsList`.
    - @comet/admin@9.1.1
    - @comet/admin-date-time@9.1.1
    - @comet/admin-icons@9.1.1
    - @comet/admin-rte@9.1.1

## 9.1.0

### Minor Changes

- 319f5b8: Allow filtering, searching and sorting warnings by name, info and type

    The warnings data grid now supports filtering and full-text searching by the related entity's name and secondary information, filtering by type, and sorting by name and type.

    On the API, the `WarningFilter` gains `name` and `secondaryInformation` fields and `WarningSortField` gains a `name` value. The related entity's name and secondary information are resolved by joining the `EntityInfo` view, while the type is read from the warning's `sourceInfo`. The view is only joined when a query actually references name or info. A migration adds an index on the `EntityInfo` join keys to keep that join fast.

### Patch Changes

- @comet/admin@9.1.0
- @comet/admin-date-time@9.1.0
- @comet/admin-icons@9.1.0
- @comet/admin-rte@9.1.0

## 9.0.1

### Patch Changes

- 0c8063e: Fix the dependents list crashing due to an invalid `visible` filter

    The `DependentsList` initialized the `visible` filter with the string `"true"` instead of the boolean `true`, causing the GraphQL request to fail with a `400 Bad Request` (`Boolean cannot represent a non boolean value`). This made the dependents tab (e.g., on assets) crash with a network error.
    - @comet/admin@9.0.1
    - @comet/admin-date-time@9.0.1
    - @comet/admin-icons@9.0.1
    - @comet/admin-rte@9.0.1

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

- ee24125: Remove `createHttpClient` function

    Use native fetch instead.

- 5f1566a: Make packages ESM-only
- 99140f8: Bump MUI X Data Grid peer dependency to v8

    See the migration guide for information on how to upgrade.

- 790e8d0: Remove the `filesInfoText` slot from `FileSelect`
- 85b09a2: Replace `DependencyList` with `DependenciesList` and `DependentsList`

    **Breaking change:** `DependencyList` has been removed. Use `DependenciesList` for queries returning `item.dependencies` and `DependentsList` for queries returning `item.dependents`.

- 171c335: Redirects: add `domain` source type

    To fully support domain redirects, additional handling is required in the site middleware.

### Minor Changes

- 4c1aeb2: Add `noFollow` option to `ExternalLinkBlock`

    Editors can now mark an external link as `nofollow` via a new checkbox in the admin form. When enabled, the rendered `<a>` tag receives `rel="nofollow"`. Existing links are unaffected by an automatic block-data migration that sets `noFollow` to `false`.

- dc8f29c: Add `SitePreviewAction` to `DocumentInterface`

    Allows overriding the site preview button in the page tree row actions on a per-document-type basis. When set, the provided component replaces the default preview `RowActionsItem`, enabling custom preview URL construction (e.g., using additional GraphQL queries or scope data).

    **Example**

    ```tsx
    import { RowActionsItem } from "@comet/admin";
    import { Preview } from "@comet/admin-icons";
    import { type DocumentInterface, openSitePreviewWindow, type SitePreviewActionProps } from "@comet/cms-admin";

    function PageSitePreviewAction({ pageTreeNode }: SitePreviewActionProps) {
        // Use hooks to construct a custom preview URL
        const previewPath = useCustomPreviewPath(pageTreeNode);

        return (
            <RowActionsItem
                icon={<Preview />}
                disabled={!previewPath}
                onClick={() => {
                    if (previewPath) {
                        openSitePreviewWindow(previewPath, "/custom-root");
                    }
                }}
            >
                Open preview
            </RowActionsItem>
        );
    }

    export const Page: DocumentInterface = {
        // ...
        SitePreviewAction: PageSitePreviewAction,
    };
    ```

- c0cee12: Add `placeholders` option to `createTipTapRichTextBlock` that allows inserting pre-defined placeholder tokens into the rich text editor. Placeholders are rendered as non-editable chips and can only be removed as a whole unit.
- 7fbe2a7: Add `allowPageDelete` option to disable deletion of pages in the PageTree. When set to `false`, the delete option is hidden in the Admin UI and the API blocks deletion attempts.
- d7b77af: Add `onError` to `CometConfig` for centralized error reporting from all error boundaries

    `CometConfigProvider` now accepts an optional `onError(error, errorInfo)` callback that is invoked whenever any descendant `ErrorBoundary` catches an error. Use this to forward errors to a reporting service such as Sentry.

    **Example**

    ```tsx
    <CometConfigProvider
        {...config}
        onError={(error, errorInfo) => {
            // Report the error to your error tracking service
            console.error(error, errorInfo.componentStack);
        }}
    >
        {children}
    </CometConfigProvider>
    ```

- f066335: Add support for React 19
- c6703db: Export `ChooseDamFilesDialog`

    Allows building custom multi-file picker UIs on top of the DAM file dialog (e.g. bulk-adding files to a list block).

    ```tsx
    import { ChooseDamFilesDialog } from "@comet/cms-admin";

    <ChooseDamFilesDialog open={open} onClose={onClose} onConfirm={(fileIds) => ...} initialFileIds={[]} allowedMimetypes={["image/jpeg"]} />
    ```

- 8cb0844: Export `isLinkTarget` and `validateLinkTarget`
- 127a492: Add TipTapRichTextBlock as an alternative to RichTextBlock
- c6703db: Add `multiple` prop to `FileField` for selecting multiple DAM files

    `FileField` now accepts `multiple={true}` to select a list of DAM files instead of a single file. Multi-file values are typed as `GQLDamFileFieldFileFragment[]` (the same fragment used in single-file mode); the component renders a stacked list of files with per-row menu and remove actions. The picker dialog pre-checks the current selection via `initialFileIds` and returns the picked file ids on confirm. The single-file API is unchanged.

    **Example**

    ```tsx
    <Field name="files" component={FileField} multiple preview={(file) => <Thumbnail fileId={file.id} />} />
    ```

- 25f7342: Export `PageTreeSelect`
- 71dce06: Make DataGrid columns in DAM sortable

    Make Name, Type/Format, Info, Creation, and Latest Change columns in the `FolderDataGrid` sortable via column header clicks, using the standard `muiGridSortToGql` pattern from generated grids. Remove the separate Sort dropdown from the toolbar. Sort state is now stored in URL params instead of localStorage.

- 7ab96c2: Add `SearchHeaderItem` component for full-text search

    The `SearchHeaderItem` component renders a search input (intended for the header) that opens a dropdown with the results of the `myFullTextSearch` query. The search is restricted to the currently selected content scope. Clicking a result opens the corresponding entity using the `entityDependencyMap` from the `DependenciesConfig` (the same mechanism used by warnings and dependencies).

    **Example**

    ```tsx
    import { Header, SearchHeaderItem } from "@comet/cms-admin";

    <Header>
        <SearchHeaderItem />
        <ContentScopeControls />
        <UserHeaderItem />
    </Header>;
    ```

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

### Patch Changes

- 92281f1: Add `"sideEffects"` to package.json for better tree-shakability
- 1475f4a: Hide selective actions of DAM more actions menu in `ChooseDamFileDialog`
- 3cbf0ff: Show `ArchivedTag` next to the title on the DAM file detail page

    Previously the archived state was only visible in the DAM file list, which could be confusing when opening an archived file's detail page via link.

- 8a93124: Fix `hideContextMenu` not hiding the context menu column in the DAM `DataGrid`

    The visibility flag was applied to a no-longer-existing `contextMenu` column id; the column had been renamed to `actions`. The flag now targets the correct column.

- 0e9189b: Export `AnonymousBlockInterface` type
- fa5c7a4: Fix `FileField` breaking image block selection

    The `DamFileFieldFile` fragment lost the image dimensions (`width`, `height`, `cropArea`) needed by `DamImageBlock`/`PixelImageBlock`. Selecting an image inside an image block crashed because those fields were missing. Restored them on the fragment.

    Composing the fragment into a parent collection (e.g. a many-to-many to `DamFile`) exposed a Mikro-ORM gotcha: `Collection.loadItems()` does not honor `eager: true`, so each loaded `DamFile` had an uninitialized `image` Reference and GraphQL threw `Cannot return null for non-nullable field DamFileImage.width`. Added an `image` `@ResolveField` on `FilesResolver` that initializes the Reference if needed, so consumers don't have to remember to populate it.

- 5d006c1: Fix `1-NaN of NaN` pagination footer and `rowCount` warning in DAM `FolderDataGrid`

    The grid now routes `totalCount` through `useBufferedRowCount`, so `rowCount` stays a number across refetches instead of becoming `undefined` while data is loading.

- 31d9296: Fix duplicate TipTap `'link'` extension warning by explicitly disabling StarterKit's built-in Link extension

    StarterKit (v3+) includes `@tiptap/extension-link` by default. Since we register our own `CmsLink` mark (also named `"link"`), this caused a "Duplicate extension names found: ['link']" warning. Setting `link: false` in `StarterKit.configure()` resolves this.

- c7f80e9: Fix page search not expanding the tree when navigating between matches after "Collapse all"

    Previously, jumping to the next or previous search match only scrolled to the match without expanding its collapsed ancestors. After collapsing the tree via "Collapse all" during an active search, continuing the search revealed nothing. Navigating between matches now re-expands the current match's ancestors before scrolling to it.

- ae85ba9: Fix `TipTapRichTextBlock` toolbar colors to match the existing `RichTextBlock` toolbar

    The TipTap toolbar incorrectly used Comet's `greyPalette` (where `greyPalette[100]` is `#D9D9D9`) for the toolbar background, button icon, hover, and disabled states. This made the toolbar look noticeably darker than the existing Draft.js-based `RichTextBlock` toolbar, which uses MUI's lighter `grey` palette (`grey[100]` is `#F5F5F5`). The TipTap toolbar now uses the same MUI grey shades for these states so the two toolbars look consistent.

- b459ec7: Reduce published package size by keeping non-runtime build artifacts out of the bundle
- f29b2d7: Deprecate `ChooseFileDialog` export

    `ChooseFileDialog` was renamed to `ChooseDamFileDialog`

- 5e87236: Remove pagination from `StartBuildsDialog` data grid

    The `buildTemplates` query always returns all templates, so the page-based pagination in the dialog grid was misleading. All templates are now displayed at once.

- 4729b3f: Prevent links in the `TableBlock` RTE cell preview from opening when editing a cell

    Double-clicking a cell to edit it would open any link in the preview.
    Pointer events are now disabled on the preview, while text selection still works.

- ab5e547: Validate the SEO block's structured data field as JSON

    The structured data field in the SEO block now shows a validation error when the entered value is not valid JSON. This matches the existing API-side `@IsJSON()` validation and prevents invalid payloads from being saved.

- Updated dependencies [92281f1]
- Updated dependencies [15e771b]
- Updated dependencies [d7b77af]
- Updated dependencies [3fda20b]
- Updated dependencies [1a83c01]
- Updated dependencies [15e771b]
- Updated dependencies [8c2fdde]
- Updated dependencies [f066335]
- Updated dependencies [b4ba869]
- Updated dependencies [57678d0]
- Updated dependencies [fdabaf1]
- Updated dependencies [8e40458]
- Updated dependencies [5f1566a]
- Updated dependencies [99140f8]
- Updated dependencies [b459ec7]
- Updated dependencies [cabba53]
- Updated dependencies [8e3a074]
- Updated dependencies [3fda20b]
- Updated dependencies [fd5c36f]
- Updated dependencies [3c81ff0]
- Updated dependencies [631540c]
- Updated dependencies [2fe9d4b]
- Updated dependencies [460cbfb]
- Updated dependencies [9cb3f95]
    - @comet/admin@9.0.0
    - @comet/admin-date-time@9.0.0
    - @comet/admin-icons@9.0.0
    - @comet/admin-rte@9.0.0

## 9.0.0-beta.6

### Minor Changes

- 4c1aeb2: Add `noFollow` option to `ExternalLinkBlock`

    Editors can now mark an external link as `nofollow` via a new checkbox in the admin form. When enabled, the rendered `<a>` tag receives `rel="nofollow"`. Existing links are unaffected by an automatic block-data migration that sets `noFollow` to `false`.

- 7fbe2a7: Add `allowPageDelete` option to disable deletion of pages in the PageTree. When set to `false`, the delete option is hidden in the Admin UI and the API blocks deletion attempts.
- 7ab96c2: Add `SearchHeaderItem` component for full-text search

    The `SearchHeaderItem` component renders a search input (intended for the header) that opens a dropdown with the results of the `myFullTextSearch` query. The search is restricted to the currently selected content scope. Clicking a result opens the corresponding entity using the `entityDependencyMap` from the `DependenciesConfig` (the same mechanism used by warnings and dependencies).

    **Example**

    ```tsx
    import { Header, SearchHeaderItem } from "@comet/cms-admin";

    <Header>
        <SearchHeaderItem />
        <ContentScopeControls />
        <UserHeaderItem />
    </Header>;
    ```

### Patch Changes

- 0e9189b: Export `AnonymousBlockInterface` type
- c7f80e9: Fix page search not expanding the tree when navigating between matches after "Collapse all"

    Previously, jumping to the next or previous search match only scrolled to the match without expanding its collapsed ancestors. After collapsing the tree via "Collapse all" during an active search, continuing the search revealed nothing. Navigating between matches now re-expands the current match's ancestors before scrolling to it.

- b459ec7: Reduce published package size by keeping non-runtime build artifacts out of the bundle
- 5e87236: Remove pagination from `StartBuildsDialog` data grid

    The `buildTemplates` query always returns all templates, so the page-based pagination in the dialog grid was misleading. All templates are now displayed at once.

- Updated dependencies [15e771b]
- Updated dependencies [1a83c01]
- Updated dependencies [15e771b]
- Updated dependencies [b4ba869]
- Updated dependencies [57678d0]
- Updated dependencies [b459ec7]
    - @comet/admin@9.0.0-beta.6
    - @comet/admin-date-time@9.0.0-beta.6
    - @comet/admin-rte@9.0.0-beta.6
    - @comet/admin-icons@9.0.0-beta.6

## 9.0.0-beta.5

### Minor Changes

- c0cee12: Add `placeholders` option to `createTipTapRichTextBlock` that allows inserting pre-defined placeholder tokens into the rich text editor. Placeholders are rendered as non-editable chips and can only be removed as a whole unit.
- 8cb0844: Export `isLinkTarget` and `validateLinkTarget`
- 8ad9dd8: Add support for deleting multiple redirects in the grid

### Patch Changes

- 3cbf0ff: Show `ArchivedTag` next to the title on the DAM file detail page

    Previously the archived state was only visible in the DAM file list, which could be confusing when opening an archived file's detail page via link.

- 5d006c1: Fix `1-NaN of NaN` pagination footer and `rowCount` warning in DAM `FolderDataGrid`

    The grid now routes `totalCount` through `useBufferedRowCount`, so `rowCount` stays a number across refetches instead of becoming `undefined` while data is loading.

- Updated dependencies [fdabaf1]
    - @comet/admin@9.0.0-beta.5
    - @comet/admin-date-time@9.0.0-beta.5
    - @comet/admin-rte@9.0.0-beta.5
    - @comet/admin-icons@9.0.0-beta.5

## 9.0.0-beta.4

### Minor Changes

- d7b77af: Add `onError` to `CometConfig` for centralized error reporting from all error boundaries

    `CometConfigProvider` now accepts an optional `onError(error, errorInfo)` callback that is invoked whenever any descendant `ErrorBoundary` catches an error. Use this to forward errors to a reporting service such as Sentry.

    **Example**

    ```tsx
    <CometConfigProvider
        {...config}
        onError={(error, errorInfo) => {
            // Report the error to your error tracking service
            console.error(error, errorInfo.componentStack);
        }}
    >
        {children}
    </CometConfigProvider>
    ```

- c6703db: Export `ChooseDamFilesDialog`

    Allows building custom multi-file picker UIs on top of the DAM file dialog (e.g. bulk-adding files to a list block).

    ```tsx
    import { ChooseDamFilesDialog } from "@comet/cms-admin";

    <ChooseDamFilesDialog open={open} onClose={onClose} onConfirm={(fileIds) => ...} initialFileIds={[]} allowedMimetypes={["image/jpeg"]} />
    ```

- 127a492: Add TipTapRichTextBlock as an alternative to RichTextBlock
- c6703db: Add `multiple` prop to `FileField` for selecting multiple DAM files

    `FileField` now accepts `multiple={true}` to select a list of DAM files instead of a single file. Multi-file values are typed as `GQLDamFileFieldFileFragment[]` (the same fragment used in single-file mode); the component renders a stacked list of files with per-row menu and remove actions. The picker dialog pre-checks the current selection via `initialFileIds` and returns the picked file ids on confirm. The single-file API is unchanged.

    **Example**

    ```tsx
    <Field name="files" component={FileField} multiple preview={(file) => <Thumbnail fileId={file.id} />} />
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

### Patch Changes

- fa5c7a4: Fix `FileField` breaking image block selection

    The `DamFileFieldFile` fragment lost the image dimensions (`width`, `height`, `cropArea`) needed by `DamImageBlock`/`PixelImageBlock`. Selecting an image inside an image block crashed because those fields were missing. Restored them on the fragment.

    Composing the fragment into a parent collection (e.g. a many-to-many to `DamFile`) exposed a Mikro-ORM gotcha: `Collection.loadItems()` does not honor `eager: true`, so each loaded `DamFile` had an uninitialized `image` Reference and GraphQL threw `Cannot return null for non-nullable field DamFileImage.width`. Added an `image` `@ResolveField` on `FilesResolver` that initializes the Reference if needed, so consumers don't have to remember to populate it.

- 31d9296: Fix duplicate TipTap `'link'` extension warning by explicitly disabling StarterKit's built-in Link extension

    StarterKit (v3+) includes `@tiptap/extension-link` by default. Since we register our own `CmsLink` mark (also named `"link"`), this caused a "Duplicate extension names found: ['link']" warning. Setting `link: false` in `StarterKit.configure()` resolves this.

- ae85ba9: Fix `TipTapRichTextBlock` toolbar colors to match the existing `RichTextBlock` toolbar

    The TipTap toolbar incorrectly used Comet's `greyPalette` (where `greyPalette[100]` is `#D9D9D9`) for the toolbar background, button icon, hover, and disabled states. This made the toolbar look noticeably darker than the existing Draft.js-based `RichTextBlock` toolbar, which uses MUI's lighter `grey` palette (`grey[100]` is `#F5F5F5`). The TipTap toolbar now uses the same MUI grey shades for these states so the two toolbars look consistent.

- ab5e547: Validate the SEO block's structured data field as JSON

    The structured data field in the SEO block now shows a validation error when the entered value is not valid JSON. This matches the existing API-side `@IsJSON()` validation and prevents invalid payloads from being saved.

- Updated dependencies [d7b77af]
- Updated dependencies [8e40458]
- Updated dependencies [2fe9d4b]
- Updated dependencies [460cbfb]
    - @comet/admin@9.0.0-beta.4
    - @comet/admin-rte@9.0.0-beta.4
    - @comet/admin-date-time@9.0.0-beta.4
    - @comet/admin-icons@9.0.0-beta.4

## 9.0.0-beta.3

### Minor Changes

- dc8f29c: Add `SitePreviewAction` to `DocumentInterface`

    Allows overriding the site preview button in the page tree row actions on a per-document-type basis. When set, the provided component replaces the default preview `RowActionsItem`, enabling custom preview URL construction (e.g., using additional GraphQL queries or scope data).

    **Example**

    ```tsx
    import { RowActionsItem } from "@comet/admin";
    import { Preview } from "@comet/admin-icons";
    import { type DocumentInterface, openSitePreviewWindow, type SitePreviewActionProps } from "@comet/cms-admin";

    function PageSitePreviewAction({ pageTreeNode }: SitePreviewActionProps) {
        // Use hooks to construct a custom preview URL
        const previewPath = useCustomPreviewPath(pageTreeNode);

        return (
            <RowActionsItem
                icon={<Preview />}
                disabled={!previewPath}
                onClick={() => {
                    if (previewPath) {
                        openSitePreviewWindow(previewPath, "/custom-root");
                    }
                }}
            >
                Open preview
            </RowActionsItem>
        );
    }

    export const Page: DocumentInterface = {
        // ...
        SitePreviewAction: PageSitePreviewAction,
    };
    ```

- 71dce06: Make DataGrid columns in DAM sortable

    Make Name, Type/Format, Info, Creation, and Latest Change columns in the `FolderDataGrid` sortable via column header clicks, using the standard `muiGridSortToGql` pattern from generated grids. Remove the separate Sort dropdown from the toolbar. Sort state is now stored in URL params instead of localStorage.

### Patch Changes

- 1475f4a: Hide selective actions of DAM more actions menu in `ChooseDamFileDialog`
- 8a93124: Fix `hideContextMenu` not hiding the context menu column in the DAM `DataGrid`

    The visibility flag was applied to a no-longer-existing `contextMenu` column id; the column had been renamed to `actions`. The flag now targets the correct column.

- f29b2d7: Deprecate `ChooseFileDialog` export

    `ChooseFileDialog` was renamed to `ChooseDamFileDialog`

- 4729b3f: Prevent links in the `TableBlock` RTE cell preview from opening when editing a cell

    Double-clicking a cell to edit it would open any link in the preview.
    Pointer events are now disabled on the preview, while text selection still works.

- Updated dependencies [cabba53]
- Updated dependencies [3c81ff0]
    - @comet/admin@9.0.0-beta.3
    - @comet/admin-date-time@9.0.0-beta.3
    - @comet/admin-icons@9.0.0-beta.3
    - @comet/admin-rte@9.0.0-beta.3

## 9.0.0-beta.2

### Major Changes

- 99140f8: Bump MUI X Data Grid peer dependency to v8

    See the migration guide for information on how to upgrade.

### Minor Changes

- 25f7342: Export `PageTreeSelect`

### Patch Changes

- 92281f1: Add `"sideEffects"` to package.json for better tree-shakability
- Updated dependencies [92281f1]
- Updated dependencies [99140f8]
- Updated dependencies [9cb3f95]
    - @comet/admin@9.0.0-beta.2
    - @comet/admin-date-time@9.0.0-beta.2
    - @comet/admin-icons@9.0.0-beta.2
    - @comet/admin-rte@9.0.0-beta.2

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

- 85b09a2: Replace `DependencyList` with `DependenciesList` and `DependentsList`

    **Breaking change:** `DependencyList` has been removed. Use `DependenciesList` for queries returning `item.dependencies` and `DependentsList` for queries returning `item.dependents`.

- 171c335: Redirects: add `domain` source type

    To fully support domain redirects, additional handling is required in the site middleware.

### Patch Changes

- Updated dependencies [8c2fdde]
- Updated dependencies [8e3a074]
    - @comet/admin@9.0.0-beta.1
    - @comet/admin-date-time@9.0.0-beta.1
    - @comet/admin-rte@9.0.0-beta.1
    - @comet/admin-icons@9.0.0-beta.1

## 9.0.0-beta.0

### Major Changes

- ee24125: Remove `createHttpClient` function

    Use native fetch instead.

- 5f1566a: Make packages ESM-only
- 790e8d0: Remove the `filesInfoText` slot from `FileSelect`

### Minor Changes

- f066335: Add support for React 19

### Patch Changes

- Updated dependencies [3fda20b]
- Updated dependencies [f066335]
- Updated dependencies [5f1566a]
- Updated dependencies [3fda20b]
- Updated dependencies [fd5c36f]
- Updated dependencies [631540c]
    - @comet/admin-date-time@9.0.0-beta.0
    - @comet/admin-icons@9.0.0-beta.0
    - @comet/admin-rte@9.0.0-beta.0
    - @comet/admin@9.0.0-beta.0

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

### Patch Changes

- Updated dependencies [412ed19]
- Updated dependencies [caceff8]
    - @comet/admin@8.20.0
    - @comet/admin-icons@8.20.0
    - @comet/admin-date-time@8.20.0
    - @comet/admin-rte@8.20.0

## 8.19.0

### Patch Changes

- Updated dependencies [fff2cc2]
- Updated dependencies [fff2cc2]
    - @comet/admin@8.19.0
    - @comet/admin-date-time@8.19.0
    - @comet/admin-rte@8.19.0
    - @comet/admin-icons@8.19.0

## 8.18.0

### Minor Changes

- 64b70bc: Re-add "Usages" column to the DAM `FolderDataGrid`, displaying the number of dependents for each file

### Patch Changes

- ed029fb: Export `CurrentUserContext` from `@comet/cms-admin`

    `CurrentUserContext` is now exported so that consumers can directly access the React context. This is needed for use cases such as providing a custom implementation of the context (e.g. in tests or in applications that manage their own user context) and for components that need to consume the context directly rather than through the `useCurrentUser` hook.

- Updated dependencies [0ce431c]
- Updated dependencies [d344f53]
    - @comet/admin@8.18.0
    - @comet/admin-date-time@8.18.0
    - @comet/admin-rte@8.18.0
    - @comet/admin-icons@8.18.0

## 8.17.1

### Patch Changes

- Updated dependencies [91e9a8f]
    - @comet/admin-icons@8.17.1
    - @comet/admin@8.17.1
    - @comet/admin-date-time@8.17.1
    - @comet/admin-rte@8.17.1

## 8.17.0

### Patch Changes

- Updated dependencies [45163f1]
    - @comet/admin@8.17.0
    - @comet/admin-date-time@8.17.0
    - @comet/admin-rte@8.17.0
    - @comet/admin-icons@8.17.0

## 8.16.0

### Patch Changes

- Updated dependencies [472b496]
    - @comet/admin@8.16.0
    - @comet/admin-date-time@8.16.0
    - @comet/admin-rte@8.16.0
    - @comet/admin-icons@8.16.0

## 8.15.0

### Minor Changes

- 9333e9c: Readd "Start impersonation" button to UserGrid

### Patch Changes

- 2bbb9c1: Fix scope not switching when impersonating a user

    Previously, the `ContentScopeProvider` blindly restored the scope from localStorage, which could redirect impersonated users to scopes they don't have access to.

    Now, the stored scope is validated against the user's allowed scopes before being applied. If the stored scope is not allowed, it is cleared from localStorage and the default scope is used instead.

    Additionally, the `NODE_ENV` guard on persisting the selected scope to localStorage is removed so scope persistence is also done locally again.

- Updated dependencies [cc96333]
- Updated dependencies [180d1e3]
- Updated dependencies [f7b9de9]
- Updated dependencies [39a9bb0]
- Updated dependencies [5b52998]
- Updated dependencies [0c2435a]
    - @comet/admin@8.15.0
    - @comet/admin-date-time@8.15.0
    - @comet/admin-rte@8.15.0
    - @comet/admin-icons@8.15.0

## 8.14.0

### Minor Changes

- d0a7c96: Automatically hide the `MasterMenu` and `AppHeaderMenuButton` if only one menu item is available

### Patch Changes

- Updated dependencies [f31b52e]
- Updated dependencies [5075f7a]
- Updated dependencies [d0a7c96]
    - @comet/admin@8.14.0
    - @comet/admin-date-time@8.14.0
    - @comet/admin-rte@8.14.0
    - @comet/admin-icons@8.14.0

## 8.13.0

### Minor Changes

- 6b0b088: Allow UserService to implement getAccountUrl() which provides a "My Account" link in the UserHeaderItem

### Patch Changes

- 60ecc0a: Store open state of `MainNavigation` in local storage and restore it on page load
- 5cfa88d: Fix renaming of DAM folders
- Updated dependencies [60ecc0a]
- Updated dependencies [dbf8774]
    - @comet/admin@8.13.0
    - @comet/admin-date-time@8.13.0
    - @comet/admin-rte@8.13.0
    - @comet/admin-icons@8.13.0

## 8.12.0

### Patch Changes

- 02c25c1: Fix preview url handling in `SvgImageBlock`
- Updated dependencies [12466e4]
    - @comet/admin@8.12.0
    - @comet/admin-date-time@8.12.0
    - @comet/admin-rte@8.12.0
    - @comet/admin-icons@8.12.0

## 8.11.1

### Patch Changes

- Updated dependencies [a498b80]
    - @comet/admin@8.11.1
    - @comet/admin-date-time@8.11.1
    - @comet/admin-rte@8.11.1
    - @comet/admin-icons@8.11.1

## 8.11.0

### Minor Changes

- 89db54c: Improve `InfoTag` type in `DocumentType`

    Add a new `InfoTagProps` type that can be used to properly type additional page tree node fields:

    ```tsx
    const Page: DocumentInterface = {
        InfoTag: ({ page }: InfoTagProps<{ userGroup: GQLUserGroup }>) => {
            // page now has the userGroup field
            if (page.userGroup !== "all") {
                return <Chip size="small" label={page.userGroup} />;
            }
            return null;
        },
    };
    ```

- 9d5e331: Enable `@typescript-eslint/consistent-type-exports` in `@comet/eslint-config/future/react.js`
- f34b750: Add Status to CronJob

### Patch Changes

- 0482cf9: Fix pagination in `DependencyList`

    Additionally:
    - Add loading state when reloading dependencies
    - Refactor `DependencyList` DataGrid based on Grid generated by the admin generator to be closer to standard

- 0031d19: Fix display of error message for exceeding max file uploads in `FinalFormFileUpload`
- Updated dependencies [8d7a90c]
- Updated dependencies [198da7b]
- Updated dependencies [2580c61]
- Updated dependencies [f0b1eb1]
- Updated dependencies [9c091ec]
- Updated dependencies [cc727d1]
- Updated dependencies [f293762]
- Updated dependencies [9d5e331]
- Updated dependencies [5337c20]
- Updated dependencies [7e34c0b]
- Updated dependencies [ed03e8d]
    - @comet/admin-rte@8.11.0
    - @comet/admin@8.11.0
    - @comet/admin-date-time@8.11.0
    - @comet/admin-icons@8.11.0

## 8.10.0

### Patch Changes

- Updated dependencies [294b35a]
- Updated dependencies [1918d88]
    - @comet/admin-rte@8.10.0
    - @comet/admin@8.10.0
    - @comet/admin-date-time@8.10.0
    - @comet/admin-icons@8.10.0

## 8.9.0

### Patch Changes

- 1af3c93: User permissions form: Fix an issue where clearing input values would not update the value when saving
    - @comet/admin@8.9.0
    - @comet/admin-date-time@8.9.0
    - @comet/admin-icons@8.9.0
    - @comet/admin-rte@8.9.0

## 8.8.0

### Minor Changes

- e62d6bd: Add support for temporary file uploads with configurable expiration times. The `expiresIn` duration can be set as a default value in the module configuration, and can be overridden by setting the value when using the `FileUploadsService` or sending the request to the upload endpoint.

    Files are automatically validated for expiration when accessed, and expired files are cleared every minute in the background.

    The `FileUploadField` also supports overriding the `expiresIn` property.

### Patch Changes

- @comet/admin@8.8.0
- @comet/admin-date-time@8.8.0
- @comet/admin-icons@8.8.0
- @comet/admin-rte@8.8.0

## 8.7.1

### Patch Changes

- @comet/admin@8.7.1
- @comet/admin-date-time@8.7.1
- @comet/admin-icons@8.7.1
- @comet/admin-rte@8.7.1

## 8.7.0

### Patch Changes

- a8e8132: Fix layout of `CronJobsPage`
- Updated dependencies [a8e8132]
    - @comet/admin@8.7.0
    - @comet/admin-date-time@8.7.0
    - @comet/admin-rte@8.7.0
    - @comet/admin-icons@8.7.0

## 8.6.0

### Patch Changes

- 97be4a0: Make all scopes selectable / de-selectable in the "Permission-specific Content-Scopes" dialog

    **Following scenario:**

    A user has the following scopes by rule:

    ```ts
    [
        { domain: "main", language: "en" },
        { domain: "main", language: "de" },
    ];
    ```

    I want to manually assign them the permission `products` but only for the scope `{ domain: "main", language: "de" }`.

    Previously, this wasn't possible because when assigning specific scopes for a permission, the scopes a user already had couldn’t be deselected. (In our scenario, I couldn’t deselect `{ domain: "main", language: "en" }`. So I had no other choice but giving the user the `products` permission for both scopes.)

    Now, all scopes are selectable / de-selectable in the dialog. So in our scenario, I can now assign the `products` permission only for `{ domain: "main", language: "de" }`.

- Updated dependencies [6c5578a]
    - @comet/admin@8.6.0
    - @comet/admin-date-time@8.6.0
    - @comet/admin-rte@8.6.0
    - @comet/admin-icons@8.6.0

## 8.5.2

### Patch Changes

- @comet/admin@8.5.2
- @comet/admin-date-time@8.5.2
- @comet/admin-icons@8.5.2
- @comet/admin-rte@8.5.2

## 8.5.1

### Patch Changes

- 32592f9: Fix a rerendering bug in `BlocksFinalForm` caused by automatic batching in React 18
    - @comet/admin@8.5.1
    - @comet/admin-date-time@8.5.1
    - @comet/admin-icons@8.5.1
    - @comet/admin-rte@8.5.1

## 8.5.0

### Patch Changes

- Updated dependencies [a2af2c6]
- Updated dependencies [c8359f6]
    - @comet/admin@8.5.0
    - @comet/admin-date-time@8.5.0
    - @comet/admin-rte@8.5.0
    - @comet/admin-icons@8.5.0

## 8.4.2

### Patch Changes

- Updated dependencies [a57d092]
    - @comet/admin@8.4.2
    - @comet/admin-date-time@8.4.2
    - @comet/admin-rte@8.4.2
    - @comet/admin-icons@8.4.2

## 8.4.1

### Patch Changes

- da30d46: Remove "Usages" column from DAM

    The `dependents` field resolver triggers multiple refreshes of the `block_index_dependencies` view, which seems to crash the API.

- Updated dependencies [9374018]
    - @comet/admin@8.4.1
    - @comet/admin-date-time@8.4.1
    - @comet/admin-rte@8.4.1
    - @comet/admin-icons@8.4.1

## 8.4.0

### Minor Changes

- f14b962: Add logging to mailer-module, can be disabled
- c8f5d89: Add support for literal arrays to block meta

### Patch Changes

- 93f5d98: Fix DAM not rendering all items and its scrolling behavior when rendered in a Dialog
- Updated dependencies [a85e7cb]
- Updated dependencies [ff6d79a]
- Updated dependencies [ff6d79a]
    - @comet/admin@8.4.0
    - @comet/admin-date-time@8.4.0
    - @comet/admin-icons@8.4.0
    - @comet/admin-rte@8.4.0

## 8.3.0

### Minor Changes

- 270d836: Add support for `string[]` and `number[]` value types in createCompositeBlockSelectField

### Patch Changes

- 678b319: The most recently visited scope is no longer stored in local storage in development mode
- a121bdf: Style `PermissionDialog` to align with Comet DXP design
- 19322b8: Fix icon of "Unpublish" action in `PagesPageActionToolbar`
- 5aa462f: Fix pagination of `UserPermissionsUserGrid`
- Updated dependencies [422328b]
- Updated dependencies [ae1dbab]
- Updated dependencies [becc06c]
- Updated dependencies [12e9230]
- Updated dependencies [6f30126]
- Updated dependencies [1bd73a0]
- Updated dependencies [d682135]
- Updated dependencies [ae1dbab]
- Updated dependencies [becc06c]
    - @comet/admin@8.3.0
    - @comet/admin-date-time@8.3.0
    - @comet/admin-rte@8.3.0
    - @comet/admin-icons@8.3.0

## 8.2.0

### Minor Changes

- 8ba4f62: Prevent phishing in SitePreview

    Affected applications: if the property `resolvePath` of the `SitePreview` component returns the plain path. The default implementation in the starter is not affected.

- 8d3d048: Add `tags` property to block factories to support adding translatable key words and improve searching for blocks in the `AddBlockDrawer`

    Tags of child blocks can be overwritten by passing tags to their parent.

    Example usage:

    ```tsx
    const MediaGalleryBlock = createCompositeBlock({
        name: "MediaGallery",
        displayName: "Media Gallery",
        blocks: {
            /* ... */
        },
        tags: [defineMessage({ id: "mediaGallery.tag.slider", defaultMessage: "Slider" })],
        /* ... */
    });
    ```

- 165e2ac: Add optional `noContentScopeError` prop to `ContentScopeProvider`, to customize error message when user has no content scope

### Patch Changes

- Updated dependencies [ea545c4]
- Updated dependencies [dfafdb3]
- Updated dependencies [d7ab390]
- Updated dependencies [08ad5fe]
- Updated dependencies [01ef80b]
- Updated dependencies [0b08988]
- Updated dependencies [85141bf]
- Updated dependencies [0cfcf90]
    - @comet/admin@8.2.0
    - @comet/admin-date-time@8.2.0
    - @comet/admin-rte@8.2.0
    - @comet/admin-icons@8.2.0

## 8.1.1

### Patch Changes

- @comet/admin@8.1.1
- @comet/admin-date-time@8.1.1
- @comet/admin-icons@8.1.1
- @comet/admin-rte@8.1.1

## 8.1.0

### Minor Changes

- f6f20e1: Add column to `FolderDataGrid` to display number of dependents of files in DAM
- ec0c8bd: Display the DAM file path in `EditImageDialog`
- 0e0eb90: Add toGqlFilter callback to GridColDefExtension

    This allows to map custom filters to more complex gql filter structures, especially if it's required to combine multiple gql-filter objects with `and` or `or`.

### Patch Changes

- cd7b87a: Style `PermissionGrid` in user permissions detail page to match Comet DXP design
- c922a91: Style `ContentScopeGrid` in user permissions to match Comet DXP design
- Updated dependencies [00e6a12]
- Updated dependencies [2f33286]
- Updated dependencies [ec9bce5]
- Updated dependencies [3323fa9]
- Updated dependencies [e70eb31]
- Updated dependencies [911a6da]
    - @comet/admin@8.1.0
    - @comet/admin-date-time@8.1.0
    - @comet/admin-rte@8.1.0
    - @comet/admin-icons@8.1.0

## 8.0.0

### Major Changes

- 67f4a2b: Remove passed `scopeParts` from `createRedirectsPage`

    Add optional `redirectsConfig` to `CometConfigProvider` instead.

    **Example**

    ```diff
    - export const RedirectsPage = createRedirectsPage({ linkBlock: RedirectsLinkBlock, scopeParts: ["domain"]})
    + export const RedirectsPage = createRedirectsPage({ linkBlock: RedirectsLinkBlock });
    ```

    ```tsx
    <CometConfigProvider
        //...
        redirects={{
            scopeParts: ["domain"],
        }}
        //...
    >
        {/* Application */}
    </CometConfigProvider>
    ```

- a9d4b70: Change type of the `values` prop of ContentScopeProvider

    **Before**

    ```ts
    const values: ContentScopeValues = [
        {
            domain: { label: "Main", value: "main" },
            language: { label: "English", value: "en" },
        },
        {
            domain: { label: "Main", value: "main" },
            language: { label: "German", value: "de" },
        },
        {
            domain: { label: "Secondary", value: "secondary" },
            language: { label: "English", value: "en" },
        },
    ];
    ```

    **Now**

    ```ts
    const values: ContentScopeValues = [
        {
            scope: { domain: "main", language: "en" },
            label: { domain: "Main", language: "English" },
        },
        {
            scope: { domain: "main", language: "de" },
            label: { domain: "Main", language: "German" },
        },
        {
            scope: { domain: "secondary", language: "en" },
            label: { domain: "Secondary", language: "English" },
        },
    ];
    ```

- ef1c645: Add warnings feature

    The warnings module can be used to display application-wide warnings in the admin. See the [docs](https://docs.comet-dxp.com/docs/features-modules/warning-module) for more information.

- 9ddb6c4: Remove deprecated `readClipboard` and `writeClipboard` helpers

    Use `readClipboardText` and `writeClipboardText` from `@comet/admin` instead.

- 682a674: Remove `BindBlockAdminComponent` from public API
- b039dcb: Remove `imgproxyConfig` from `CometConfigProvider` and move `maxSrcResolution` to `damConfig`
- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

- 8e193a3: Introduce a strongly-typed permission system using the new `Permission` GraphQL enum and `Permission` type, replacing previous string-based permissions.

    **Breaking changes**
    1. **Mandatory `requiredPermission`**: The `@CrudGenerator` decorator now requires the `requiredPermission` parameter to be explicitly specified
    2. **Permission Type Changes**: All permission-related APIs now expect typed permissions instead of plain strings

- e7ad83b: Remove `Grid` layout responsibility from `DashboardWidgetRoot`.

    The component `DashboardWidgetRoot` no longer wraps its content inside a `<Grid>` component. This change delegates layout responsibility (e.g., grid column sizing) to the parent component.

    **Before:**
    `DashboardWidgetRoot` was always wrapped in `<Grid size={{ xs: 12, lg: 6 }}>`.

    **After:**
    No layout assumptions — parent components must now position the widget explicitly.

    This change may require updates where `DashboardWidgetRoot` is used inside grid layouts.

- 44915b9: Changed format for `useCurrentUser().allowedContentScopes`
    - Old: `{ [key]: string }[]`
    - New: `{ scope: ContentScope; label: { [key in keyof ContentScope]: string }; }[]`

    To support a smooth transition the `defaultValue` prop of the `ContentScopeProvider` now must also have the same format.

- b10c4f9: Merge providers into new `CometConfigProvider`

    Previously, each module (e.g., DAM) had its own provider used for configuration.
    This led to crowding the application since most applications use multiple CMS features.
    A new `CometConfigProvider` provider is introduced to use instead.

    **Example**

    ```tsx
    <CometConfigProvider
        apiUrl={config.apiUrl}
        graphQLApiUrl={`${config.apiUrl}/graphql`}
        adminUrl={config.adminUrl}
        // Config for the page tree module
        pageTree={{
            categories: pageTreeCategories,
            documentTypes: pageTreeDocumentTypes,
        }}
        // Config for the DAM module
        dam={{
            ...config.dam,
            scopeParts: ["domain"],
            contentGeneration: {
                generateAltText: true,
                generateImageTitle: true,
            },
        }}
        // Additional modules...
    >
        {/* Application */}
    </CometConfigProvider>
    ```

    **Breaking changes**
    - Multiple exports have been removed: `CmsBlockContext`, `CmsBlockContextProvider`, `useCmsBlockContext`, `BuildInformationProvider`, `DamConfigProvider`, `useDamConfig`, `DependenciesConfigProvider`, `useDependenciesConfig`, `LocaleProvider`, `SitesConfigProvider`
    - `useLocale` has been renamed to `useContentLanguage`
    - `useSitesConfig` has been renamed to `useSiteConfigs`

    **How to upgrade**
    1. Add the `CometConfigProvider` to `src/App.tsx`
    2. Move configs for used modules to the new provider
    3. Remove the old config providers

- de6d677: Bump @mui/x-data-grid peer dependency to v7

    This has breaking changes in DataGrid.
    Follow the official [migration guide](<(https://mui.com/x/migration/migration-data-grid-v6/)>) to upgrade.

    As well, be aware if you have a date in the data grid, you will need to add a `valueGetter`

    ```diff
        <DataGrid
            //other props
            columns=[
            {
                field: "updatedAt",
                type: "dateTime",
    +            valueGetter: (params, row) => row.updatedAt && new Date(row.updatedAt)
            }]
        />
    ```

    Also, be aware if you have a `valueGetter` or `valueFormatter` in the data grid, you will need to change the arguments passing to the functions. Previously, arguments were passed as an object. Now, they are passed directly as individual parameters

    ```diff
        <DataGrid
            //other props
            columns=[
            {
                field: "updatedAt",
                type: "dateTime",
    -           valueGetter: ({params, row}) => row.updatedAt && new Date(row.updatedAt)
    +           valueGetter: (params, row) => row.updatedAt && new Date(row.updatedAt)
    -           valueFormatter: ({value}) => (value ? intl.formatDate(value, { dateStyle: "medium", timeStyle: "short" }) : ""),
    +           valueFormatter: (value) => (value ? intl.formatDate(value, { dateStyle: "medium", timeStyle: "short" }) : ""),
            }]
        />
    ```

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

- 04e308a: Upgrade from MUI v5 to v7

    This only causes minimal breaking changes, see the official migration guides from MUI for details:
    - [Upgrade to MUI v6](https://mui.com/material-ui/migration/upgrade-to-v6/)
    - [Upgrade to MUI v7](https://mui.com/material-ui/migration/upgrade-to-v7/)

    To update the MUI dependencies, run the following command:

    ```sh
    npx @comet/upgrade v8/update-mui-dependencies.ts
    ```

    To run all of the recommended MUI codemods, run:

    ```sh
    npx @comet/upgrade v8/mui-codemods.ts
    ```

- 487fd69: Use ContentScope interface augmentation in admin

    The export `ContentScopeInterface` has been renamed to `ContentScope`.
    Also, generics have been removed from `ContentScopeSelect`, `ContentScopeControls` and `useContentScope`.
    All these things hardly were used in projects.

- cfa2f85: Bump @mui/x-data-grid peer dependency to v6

    This has breaking changes in DataGrid.
    Follow the official [migration guide](<(https://mui.com/x/migration/migration-data-grid-v5)>) to upgrade.

    The `useDataGridRemote` hook has been changed to match the updated DataGrid props:

    ```diff
    - const { pageSize, page, onPageSizeChange } = useDataGridRemote();
    + const { paginationModel, onPaginationModelChange } = useDataGridRemote();
    ```

    The `muiGridSortToGql` helper now expects the columns instead of the `apiRef`:

    ```diff
    const columns : GridColDef[] = [/* column definitions */];
    const dataGridRemote = useDataGridRemote();
    const persistentColumnState = usePersistentColumnState("persistent_column_state");

    -  muiGridSortToGql(dataGridRemote.sortModel, persistentColumnState.apiRef);
    +  muiGridSortToGql(dataGridRemote.sortModel, columns);
    ```

- 9ddb6c4: Merge `@comet/blocks-admin` into `@comet/cms-admin`

    The dedicated `@comet/blocks-admin` package was originally introduced to support projects without CMS parts.
    It turned out that this is never the case, so the separation doesn't make sense anymore.
    Therefore, the `@comet/blocks-admin` is merged into this package.

    **Breaking changes**
    - The `@comet/blocks-admin` package doesn't exist anymore
    - Multiple exports that shouldn't be used have been removed from the public API
        - `CannotPasteBlockDialog`
        - `ClipboardContent`
        - `useBlockClipboard`
        - `Collapsible`
        - `CollapsibleSwitchButtonHeader`
        - `usePromise`
        - `DispatchSetStateAction` (use `Dispatch<SetStateAction<T>>` from `react` instead)
        - `SetStateAction`
        - `SetStateFn`
    - Multiple exports that were too generic have been renamed
        - `createCompositeSetting` -> `createCompositeBlockField`
        - `createCompositeSettings` -> `createCompositeBlockFields`
        - `IPreviewContext` -> `BlockPreviewContext`
        - `PreviewStateInterface` -> `BlockPreviewStateInterface`
        - `AdminComponentPart` -> `BlockAdminComponentPart`
        - `AdminComponentButton`-> `BlockAdminComponentButton`
        - `AdminComponentNestedButton`-> `BlockAdminComponentNestedButton`
        - `AdminComponentPaper`->`BlockAdminComponentPaper`
        - `useAdminComponentPaper`-> `useBlockAdminComponentPaper`
        - `AdminComponentRoot`-> `BlockAdminComponentRoot`
        - `AdminComponentSection`-> `BlockAdminComponentSection`
        - `AdminComponentSectionGroup`-> `BlockAdminComponentSectionGroup`
        - `AdminTabLabel`-> `BlockAdminTabLabel`
        - `AdminTabsProps`-> `BlockAdminTabsProps`
        - `AdminTabs`-> `BlockAdminTabs`

    **How to upgrade**

    To upgrade, perform the following changes:
    1. Uninstall the `@comet/blocks-admin` package
    2. Update all your imports from `@comet/blocks-admin` to `@comet/cms-admin`
    3. Remove usages of removed exports
    4. Update imports that have been renamed

- 584f785: Move Admin Generator into separate `@comet/admin-generator` package.

    It can be run with the same `comet-admin-generator` command as before.

- 95bea5c: Make fields full-width by default when using `createCompositeBlockTextField` or `createCompositeBlockSelectField`

### Minor Changes

- 56387a5: Add icons for redirect targets in the grid
- 56387a5: Enable displaying icons in `BlockPreviewContent`

    Use the `icon?: (state: State) => ReactNode;` block method to add an icon to your block.

    Add optional prop `showIcon` to `BlockPreviewContent` to control icon visibility.

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

- 77b52a8: Mark `FinalFormToggleButtonGroup` as deprecated. One should prefer using `ToggleButtonGroupField` from `@comet/admin` instead
- 604a363: Rework `createRedirectsPage` usage to accept `linkBlock` instead of `customTargets`.

    Previously, `customTargets` were passed directly:

    ```ts
    const RedirectsPage = createRedirectsPage({ customTargets: { news: NewsLinkBlock }, scopeParts: ["domain"] });
    ```

    Now, you should first create the `RedirectsLinkBlock` and then provide it to `createRedirectsPage`:

    ```ts
    export const RedirectsLinkBlock = createRedirectsLinkBlock({
        news: NewsLinkBlock,
    });

    export const RedirectsPage = createRedirectsPage({ linkBlock: RedirectsLinkBlock, scopeParts: ["domain"] });
    ```

    This change was made because `RedirectsLinkBlock` is also needed by `RedirectDependency`, and can therefore be reused.

- 5b8fe2e: Adapt multiple usages of save buttons to look like the standard `FeedbackButton` and match the Comet DXP design

    This applies to:
    - `FinalFormSaveButton`
    - `FinalFormSaveCancelButtonsLegacy`
    - `FinalFormSaveSplitButton`
    - The save button inside `TableLocalChangesToolbar`
    - The save button inside the `useSaveState` hook
    - The save button inside `MoveDamItemDialog`
    - The save button inside `createUsePage`

- d8ba897: Allow overriding the `uploadEndpoint` of `${apiUrl}/file-uploads/upload` in the `FinalFormFileUpload` component.
- 9c3f72e: Allow array for `requiredPermission` in `MasterMenuData`

    The menu item appears if at least one permission is allowed for the current user.

- c6b5bdc: Add SignOutButton Component
- aacfb36: Redirect to the most recently visited content scope when returning to the application
- 948e07b: Add an `override` argument to all block factories to follow `createCompositeBlock`'s pattern
- b1bb7a7: Add support for scope-specific blocks

    Use the newly added `BlocksConfigProvider` to specify if a block is allowed in the current content scope:

    ```tsx title="App.tsx"
    import { BlocksConfigProvider } from "@comet/cms-admin";

    export function App() {
        return (
            <BlocksConfigProvider
                isBlockSupported={(block, scope) => {
                    if (scope.domain === "specific-customer") {
                        return true;
                    } else {
                        return block.name !== MySpecialTeaserBlock.name;
                    }
                }}
            >
                {/* Other providers... */}
            </BlocksConfigProvider>
        );
    }
    ```

    **Note: This feature is Admin-only, so creating documents with unsupported blocks is still possible in the API.**

- b4d1677: Remove download of files during page copy

    Previously, when copying a page from another instance (e.g., staging to dev), COMET would try to download the files from the other instance.

    Files from another instance were recognized by looking at their file URL.
    If the domain was different from the current domain, COMET would try to download the file.

    This doesn't work anymore because now we only have relative file URLs.
    It also sometimes caused issues with the file download, e.g., when the file was not available anymore.
    Therefore, we removed this feature.

- 2a9f23d: Support block preview scope for BFF requests

    The current scope will be sent via a monkey patched fetch and interpreted in `previewParams()`.

- 682a674: Add support for React 18
- 864e6de: Add the possibility to filter users by permission

### Patch Changes

- 04c9225: Validate path parameter in site preview

    Prevents phishing attacks.

- e983344: Adapt styling of `RedirectActiveness` dropdown to align with Comet DXP design
- 286fbfb: Added missing prop types to `FileUploadFieldProps` that are forwarded to `FinalFormFileUpload`, ensuring consistent typing and easier customization.
- cf1a829: Remove `video/avi`, `image/psd` and `video/x-m4v` from default accepted mimetypes

    None of this mimetypes had an actual impact:
    - `video/avi` doesn't actually exist
    - `image/psd` doesn't exist / is non-standard
    - `video/x-m4v` is a niche format and the mimetype is not widely used (e.g., Google Chrome and MacOS use `video/mp4`
      instead)

    So removing them shouldn't have any noticeable effects.

- 3621949: Fix searching for pages via domain by using the site's URL from the site config
- 204e437: Fix spacing in `ContentScopeSelect` to align with Comet DXP design
- 8f58741: Remove unused field `allowedImageSizes` from DamConfig
- b4d1677: Copying a page between scopes with the same DAM scope now retains DAM file references

    Previously, when copying a page from one scope to another and these scopes shared the same DAM scope, the copied page would lose all references to DAM files.

    Example:
    - You copy a page from scope `{ domain: "main", language: "en" }` to `{ domain: "main", language: "de" }`
    - And the DAM scope is only `{ domain: "main" }`

    → the copied page would lose all references to DAM files

    Now, the copied page retains references to DAM files, if both scopes share the same DAM scope.

- 9546356: Update default icon of `ContentScopeSelect` and fix mobile styling for `AppHeader` components
    - Update the default icon in `ContentScopeSelect` from `<Domain />` to `<Language />`
    - Fix mobile styling of `BuildEntry` and `ContentScopeSelect` and `UserHeaderItem`

- 44915b9: Fix returning duplicated entries in `useCurrentUser().allowedContentScopes`
- adf73a3: Remove the hardcoded default category in the page tree select
- 0f09202: Fix missing "Crop image" button in `PixelImageBlock`
- b8817b8: Add `BlocksBlockOutput`, `ListBlockOutput`, `OneOfBlockOutput`, `OneOfBlockPreviewState`, and `OptionalBlockOutput` to the public API
- Updated dependencies [e74ef46]
- Updated dependencies [9e3e943]
- Updated dependencies [afc306b]
- Updated dependencies [a93455f]
- Updated dependencies [46edfd6]
- Updated dependencies [72d1a5e]
- Updated dependencies [d99602a]
- Updated dependencies [5b8fe2e]
- Updated dependencies [7ce585d]
- Updated dependencies [4182a94]
- Updated dependencies [13d35af]
- Updated dependencies [f7429bd]
- Updated dependencies [b374300]
- Updated dependencies [d148091]
- Updated dependencies [b8817b8]
- Updated dependencies [1d28c90]
- Updated dependencies [5b8fe2e]
- Updated dependencies [bb3e809]
- Updated dependencies [f904b71]
- Updated dependencies [afc306b]
- Updated dependencies [6cfc60d]
- Updated dependencies [e15895a]
- Updated dependencies [717ede6]
- Updated dependencies [ad9b2a3]
- Updated dependencies [c48ca03]
- Updated dependencies [1c62e87]
- Updated dependencies [de6d677]
- Updated dependencies [9e3e943]
- Updated dependencies [06d5600]
- Updated dependencies [15c6fa0]
- Updated dependencies [04e308a]
- Updated dependencies [535476e]
- Updated dependencies [5a6efc1]
- Updated dependencies [34124c7]
- Updated dependencies [400dd1e]
- Updated dependencies [f9c32d2]
- Updated dependencies [a8c737b]
- Updated dependencies [09c4830]
- Updated dependencies [b8817b8]
- Updated dependencies [eeb21ce]
- Updated dependencies [cfa2f85]
- Updated dependencies [15b7dd3]
- Updated dependencies [c5d9a47]
- Updated dependencies [4828880]
- Updated dependencies [5b8fe2e]
- Updated dependencies [66abe0a]
- Updated dependencies [682a674]
- Updated dependencies [bf9b1bb]
- Updated dependencies [12a605e]
- Updated dependencies [d6a004a]
- Updated dependencies [77b52a8]
- Updated dependencies [1450882]
- Updated dependencies [43eb598]
    - @comet/admin@8.0.0
    - @comet/admin-icons@8.0.0
    - @comet/admin-date-time@8.0.0
    - @comet/admin-rte@8.0.0

## 8.0.0-beta.6

### Major Changes

- ef1c645: Add warnings feature

    The warnings module can be used to display application-wide warnings in the admin. See the [docs](https://docs.comet-dxp.com/docs/features-modules/warning-module) for more information.

- 44915b9: Changed format for `useCurrentUser().allowedContentScopes`
    - Old: `{ [key]: string }[]`
    - New: `{ scope: ContentScope; label: { [key in keyof ContentScope]: string }; }[]`

    To support a smooth transition the `defaultValue` prop of the `ContentScopeProvider` now must also have the same format.

### Minor Changes

- 77b52a8: Mark `FinalFormToggleButtonGroup` as deprecated. One should prefer using `ToggleButtonGroupField` from `@comet/admin` instead
- d8ba897: Allow overriding the `uploadEndpoint` of `${apiUrl}/file-uploads/upload` in the `FinalFormFileUpload` component.

### Patch Changes

- e983344: Adapt styling of `RedirectActiveness` dropdown to align with Comet DXP design
- 286fbfb: Added missing prop types to `FileUploadFieldProps` that are forwarded to `FinalFormFileUpload`, ensuring consistent typing and easier customization.
- 44915b9: Fix returning duplicated entries in `useCurrentUser().allowedContentScopes`
- Updated dependencies [9e3e943]
- Updated dependencies [afc306b]
- Updated dependencies [afc306b]
- Updated dependencies [9e3e943]
- Updated dependencies [06d5600]
- Updated dependencies [15b7dd3]
- Updated dependencies [d6a004a]
- Updated dependencies [77b52a8]
    - @comet/admin@8.0.0-beta.6
    - @comet/admin-date-time@8.0.0-beta.6
    - @comet/admin-rte@8.0.0-beta.6
    - @comet/admin-icons@8.0.0-beta.6

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

- 487fd69: Use ContentScope interface augmentation in admin

    The export `ContentScopeInterface` has been renamed to `ContentScope`.
    Also, generics have been removed from `ContentScopeSelect`, `ContentScopeControls` and `useContentScope`.
    All these things hardly were used in projects.

### Minor Changes

- 2cf573b: Adapt styling of `DamTable` to align with Comet DXP design
- 9c3f72e: Allow array for `requiredPermission` in `MasterMenuData`

    The menu item appears if at least one permission is allowed for the current user.

- c6b5bdc: Add SignOutButton Component

### Patch Changes

- 204e437: Fix spacing in `ContentScopeSelect` to align with Comet DXP design
- Updated dependencies [2cf573b]
- Updated dependencies [4182a94]
- Updated dependencies [1d28c90]
- Updated dependencies [6cfc60d]
- Updated dependencies [ad9b2a3]
- Updated dependencies [5a6efc1]
- Updated dependencies [09c4830]
- Updated dependencies [bf9b1bb]
    - @comet/admin@8.0.0-beta.5
    - @comet/admin-icons@8.0.0-beta.5
    - @comet/admin-date-time@8.0.0-beta.5
    - @comet/admin-rte@8.0.0-beta.5

## 8.0.0-beta.4

### Major Changes

- a9d4b70: Change type of the `values` prop of ContentScopeProvider

    **Before**

    ```ts
    const values: ContentScopeValues<ContentScope> = [
        {
            domain: { label: "Main", value: "main" },
            language: { label: "English", value: "en" },
        },
        {
            domain: { label: "Main", value: "main" },
            language: { label: "German", value: "de" },
        },
        {
            domain: { label: "Secondary", value: "secondary" },
            language: { label: "English", value: "en" },
        },
    ];
    ```

    **Now**

    ```ts
    const values: ContentScopeValues<ContentScope> = [
        {
            scope: { domain: "main", language: "en" },
            label: { domain: "Main", language: "English" },
        },
        {
            scope: { domain: "main", language: "de" },
            label: { domain: "Main", language: "German" },
        },
        {
            scope: { domain: "secondary", language: "en" },
            label: { domain: "Secondary", language: "English" },
        },
    ];
    ```

- b039dcb: Remove `imgproxyConfig` from `CometConfigProvider` and move `maxSrcResolution` to `damConfig`

### Patch Changes

- Updated dependencies [a93455f]
- Updated dependencies [72d1a5e]
- Updated dependencies [1c62e87]
    - @comet/admin@8.0.0-beta.4
    - @comet/admin-date-time@8.0.0-beta.4
    - @comet/admin-rte@8.0.0-beta.4
    - @comet/admin-icons@8.0.0-beta.4

## 8.0.0-beta.3

### Patch Changes

- 8f58741: Remove unused field `allowedImageSizes` from DamConfig
    - @comet/admin@8.0.0-beta.3
    - @comet/admin-date-time@8.0.0-beta.3
    - @comet/admin-icons@8.0.0-beta.3
    - @comet/admin-rte@8.0.0-beta.3

## 8.0.0-beta.2

### Major Changes

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

- b10c4f9: Merge providers into new `CometConfigProvider`

    Previously, each module (e.g., DAM) had its own provider used for configuration.
    This led to crowding the application since most applications use multiple CMS features.
    A new `CometConfigProvider` provider is introduced to use instead.

    **Example**

    ```tsx
    <CometConfigProvider
        apiUrl={config.apiUrl}
        graphQLApiUrl={`${config.apiUrl}/graphql`}
        adminUrl={config.adminUrl}
        // Config for the page tree module
        pageTree={{
            categories: pageTreeCategories,
            documentTypes: pageTreeDocumentTypes,
        }}
        // Config for the DAM module
        dam={{
            ...config.dam,
            scopeParts: ["domain"],
            contentGeneration: {
                generateAltText: true,
                generateImageTitle: true,
            },
        }}
        // Additional modules...
    >
        {/* Application */}
    </CometConfigProvider>
    ```

    **Breaking changes**
    - Multiple exports have been removed: `CmsBlockContext`, `CmsBlockContextProvider`, `useCmsBlockContext`, `BuildInformationProvider`, `DamConfigProvider`, `useDamConfig`, `DependenciesConfigProvider`, `useDependenciesConfig`, `LocaleProvider`, `SitesConfigProvider`
    - `useLocale` has been renamed to `useContentLanguage`
    - `useSitesConfig` has been renamed to `useSiteConfigs`

    **How to upgrade**
    1. Add the `CometConfigProvider` to `src/App.tsx`
    2. Move configs for used modules to the new provider
    3. Remove the old config providers

### Minor Changes

- 5b8fe2e: Adapt multiple usages of save buttons to look like the standard `FeedbackButton` and match the Comet DXP design

    This applies to:
    - `FinalFormSaveButton`
    - `FinalFormSaveCancelButtonsLegacy`
    - `FinalFormSaveSplitButton`
    - The save button inside `TableLocalChangesToolbar`
    - The save button inside the `useSaveState` hook
    - The save button inside `MoveDamItemDialog`
    - The save button inside `createUsePage`

### Patch Changes

- Updated dependencies [d99602a]
- Updated dependencies [5b8fe2e]
- Updated dependencies [5b8fe2e]
- Updated dependencies [f904b71]
- Updated dependencies [15c6fa0]
- Updated dependencies [535476e]
- Updated dependencies [5b8fe2e]
- Updated dependencies [43eb598]
    - @comet/admin@8.0.0-beta.2
    - @comet/admin-date-time@8.0.0-beta.2
    - @comet/admin-icons@8.0.0-beta.2
    - @comet/admin-rte@8.0.0-beta.2

## 8.0.0-beta.1

### Patch Changes

- @comet/admin@8.0.0-beta.1
- @comet/admin-date-time@8.0.0-beta.1
- @comet/admin-icons@8.0.0-beta.1
- @comet/admin-rte@8.0.0-beta.1

## 8.0.0-beta.0

### Major Changes

- 9ddb6c4: Remove deprecated `readClipboard` and `writeClipboard` helpers

    Use `readClipboardText` and `writeClipboardText` from `@comet/admin` instead.

- 682a674: Remove `BindBlockAdminComponent` from public API
- 93a9f1d: Stay on same page when changing scopes

    Previously, `redirectPathAfterChange` of `useContentScopeConfig` had to be explicitly set to ensure that the Admin stays on the same page after changing scopes.
    This was often forgotten, resulting in redirects to the default page (usually the dashboard page).
    Now, as it is the preferred behavior, the Admin will stay on the same page per default.

    To upgrade, perform the following changes:
    1. Remove the `path` prop from the `PagesPage` component
    2. Remove the `redirectPathAfterChange` prop from the `RedirectsPage` component
    3. Remove unnecessary usages of the `useContentScopeConfig` hook

    To restore the previous behavior, add the `useContentScopeConfig` hook:

    ```tsx
    import { useContentScopeConfig } from "@comet/cms-admin";

    function MainMenuPage() {
        // We want to redirect to the dashboard page after changing the scope.
        useContentScopeConfig({ redirectPathAfterChange: "/dashboard" });
    }
    ```

- de6d677: Bump @mui/x-data-grid peer dependency to v7

    This has breaking changes in DataGrid.
    Follow the official [migration guide](<(https://mui.com/x/migration/migration-data-grid-v6/)>) to upgrade.

    As well, be aware if you have a date in the data grid, you will need to add a `valueGetter`

    ```diff
        <DataGrid
            //other props
            columns=[
            {
                field: "updatedAt",
                type: "dateTime",
    +            valueGetter: (params, row) => row.updatedAt && new Date(row.updatedAt)
            }]
        />
    ```

    Also, be aware if you have a `valueGetter` or `valueFormatter` in the data grid, you will need to change the arguments passing to the functions. Previously, arguments were passed as an object. Now, they are passed directly as individual parameters

    ```diff
        <DataGrid
            //other props
            columns=[
            {
                field: "updatedAt",
                type: "dateTime",
    -           valueGetter: ({params, row}) => row.updatedAt && new Date(row.updatedAt)
    +           valueGetter: (params, row) => row.updatedAt && new Date(row.updatedAt)
    -           valueFormatter: ({value}) => (value ? intl.formatDate(value, { dateStyle: "medium", timeStyle: "short" }) : ""),
    +           valueFormatter: (value) => (value ? intl.formatDate(value, { dateStyle: "medium", timeStyle: "short" }) : ""),
            }]
        />
    ```

- 04e308a: Upgrade to MUI v6

    This only causes minimal breaking changes, see the official [migration guide](https://mui.com/material-ui/migration/upgrade-to-v6/) for details.

    It is recommended to run the following codemods in your application:

    ```sh
    npx @mui/codemod@latest v6.0.0/list-item-button-prop admin/src
    npx @mui/codemod@latest v6.0.0/styled admin/src
    npx @mui/codemod@latest v6.0.0/sx-prop admin/src
    npx @mui/codemod@latest v6.0.0/theme-v6 admin/src/theme.ts
    ```

- cfa2f85: Bump @mui/x-data-grid peer dependency to v6

    This has breaking changes in DataGrid.
    Follow the official [migration guide](<(https://mui.com/x/migration/migration-data-grid-v5)>) to upgrade.

    The `useDataGridRemote` hook has been changed to match the updated DataGrid props:

    ```diff
    - const { pageSize, page, onPageSizeChange } = useDataGridRemote();
    + const { paginationModel, onPaginationModelChange } = useDataGridRemote();
    ```

    The `muiGridSortToGql` helper now expects the columns instead of the `apiRef`:

    ```diff
    const columns : GridColDef[] = [/* column definitions */];
    const dataGridRemote = useDataGridRemote();
    const persistentColumnState = usePersistentColumnState("persistent_column_state");

    -  muiGridSortToGql(dataGridRemote.sortModel, persistentColumnState.apiRef);
    +  muiGridSortToGql(dataGridRemote.sortModel, columns);
    ```

- 9ddb6c4: Merge `@comet/blocks-admin` into `@comet/cms-admin`

    The dedicated `@comet/blocks-admin` package was originally introduced to support projects without CMS parts.
    It turned out that this is never the case, so the separation doesn't make sense anymore.
    Therefore, the `@comet/blocks-admin` is merged into this package.

    **Breaking changes**
    - The `@comet/blocks-admin` package doesn't exist anymore
    - Multiple exports that shouldn't be used have been removed from the public API
        - `CannotPasteBlockDialog`
        - `ClipboardContent`
        - `useBlockClipboard`
        - `Collapsible`
        - `CollapsibleSwitchButtonHeader`
        - `usePromise`
        - `DispatchSetStateAction` (use `Dispatch<SetStateAction<T>>` from `react` instead)
        - `SetStateAction`
        - `SetStateFn`
    - Multiple exports that were too generic have been renamed
        - `createCompositeSetting` -> `createCompositeBlockField`
        - `createCompositeSettings` -> `createCompositeBlockFields`
        - `IPreviewContext` -> `BlockPreviewContext`
        - `PreviewStateInterface` -> `BlockPreviewStateInterface`
        - `AdminComponentPart` -> `BlockAdminComponentPart`
        - `AdminComponentButton`-> `BlockAdminComponentButton`
        - `AdminComponentNestedButton`-> `BlockAdminComponentNestedButton`
        - `AdminComponentPaper`->`BlockAdminComponentPaper`
        - `useAdminComponentPaper`-> `useBlockAdminComponentPaper`
        - `AdminComponentRoot`-> `BlockAdminComponentRoot`
        - `AdminComponentSection`-> `BlockAdminComponentSection`
        - `AdminComponentSectionGroup`-> `BlockAdminComponentSectionGroup`
        - `AdminTabLabel`-> `BlockAdminTabLabel`
        - `AdminTabsProps`-> `BlockAdminTabsProps`
        - `AdminTabs`-> `BlockAdminTabs`

    **How to upgrade**

    To upgrade, perform the following changes:
    1. Uninstall the `@comet/blocks-admin` package
    2. Update all your imports from `@comet/blocks-admin` to `@comet/cms-admin`
    3. Remove usages of removed exports
    4. Update imports that have been renamed

- 584f785: Move Admin Generator into separate `@comet/admin-generator` package.

    It can be run with the same `comet-admin-generator` command as before.

- 95bea5c: Make fields full-width by default when using `createCompositeBlockTextField` or `createCompositeBlockSelectField`

### Minor Changes

- 948e07b: Add an `override` argument to all block factories to follow `createCompositeBlock`'s pattern
- b1bb7a7: Add support for scope-specific blocks

    Use the newly added `BlocksConfigProvider` to specify if a block is allowed in the current content scope:

    ```tsx title="App.tsx"
    import { BlocksConfigProvider } from "@comet/cms-admin";

    export function App() {
        return (
            <BlocksConfigProvider
                isBlockSupported={(block, scope) => {
                    if (scope.domain === "specific-customer") {
                        return true;
                    } else {
                        return block.name !== MySpecialTeaserBlock.name;
                    }
                }}
            >
                {/* Other providers... */}
            </BlocksConfigProvider>
        );
    }
    ```

    **Note: This feature is Admin-only, so creating documents with unsupported blocks is still possible in the API.**

- 682a674: Add support for React 18

### Patch Changes

- cf1a829: Remove `video/avi`, `image/psd` and `video/x-m4v` from default accepted mimetypes

    None of this mimetypes had an actual impact:
    - `video/avi` doesn't actually exist
    - `image/psd` doesn't exist / is non-standard
    - `video/x-m4v` is a niche format and the mimetype is not widely used (e.g., Google Chrome and MacOS use `video/mp4`
      instead)

    So removing them shouldn't have any noticeable effects.

- 9546356: Update default icon of `ContentScopeSelect` and fix mobile styling for `AppHeader` components
    - Update the default icon in `ContentScopeSelect` from `<Domain />` to `<Language />`
    - Fix mobile styling of `BuildEntry` and `ContentScopeSelect` and `UserHeaderItem`

- b8817b8: Add `BlocksBlockOutput`, `ListBlockOutput`, `OneOfBlockOutput`, `OneOfBlockPreviewState`, and `OptionalBlockOutput` to the public API
- Updated dependencies [7ce585d]
- Updated dependencies [f7429bd]
- Updated dependencies [b374300]
- Updated dependencies [b8817b8]
- Updated dependencies [717ede6]
- Updated dependencies [de6d677]
- Updated dependencies [04e308a]
- Updated dependencies [400dd1e]
- Updated dependencies [a8c737b]
- Updated dependencies [b8817b8]
- Updated dependencies [eeb21ce]
- Updated dependencies [cfa2f85]
- Updated dependencies [c5d9a47]
- Updated dependencies [4828880]
- Updated dependencies [682a674]
    - @comet/admin@8.0.0-beta.0
    - @comet/admin-date-time@8.0.0-beta.0
    - @comet/admin-icons@8.0.0-beta.0
    - @comet/admin-rte@8.0.0-beta.0

## 7.25.3

### Patch Changes

- @comet/admin@7.25.3
- @comet/admin-date-time@7.25.3
- @comet/admin-icons@7.25.3
- @comet/admin-rte@7.25.3
- @comet/admin-theme@7.25.3
- @comet/blocks-admin@7.25.3

## 7.25.2

### Patch Changes

- @comet/admin@7.25.2
- @comet/admin-date-time@7.25.2
- @comet/admin-icons@7.25.2
- @comet/admin-rte@7.25.2
- @comet/admin-theme@7.25.2
- @comet/blocks-admin@7.25.2

## 7.25.1

### Patch Changes

- 02394453f: Consider all scope dimensions when automatically disabling grouping and matching the selected option in `ContentScopeSelect`

    This solves two issues where for scopes with optional parts
    - the `ContentScopeSelect` switched between disabled and enabled grouping depending on the selected scope
    - the wrong selected scope was shown because the matching didn't consider all dimensions
    - @comet/admin@7.25.1
    - @comet/admin-date-time@7.25.1
    - @comet/admin-icons@7.25.1
    - @comet/admin-rte@7.25.1
    - @comet/admin-theme@7.25.1
    - @comet/blocks-admin@7.25.1

## 7.25.0

### Minor Changes

- b421ed273: Support captions in the `DamVideoBlock`

    The captions can be set uploaded as .vtt files and linked to videos in the DAM.

- c95365d03: Add the possibility to attach captions (.vtt files) to videos in the DAM
- a1a129e00: Allow uploading .vtt files to the DAM

### Patch Changes

- @comet/admin@7.25.0
- @comet/admin-date-time@7.25.0
- @comet/admin-icons@7.25.0
- @comet/admin-rte@7.25.0
- @comet/admin-theme@7.25.0
- @comet/blocks-admin@7.25.0

## 7.24.0

### Patch Changes

- 6d293de63: Consider required permission of ancestors in `MasterMenuRoutes`
- Updated dependencies [751616321]
- Updated dependencies [fa611381b]
- Updated dependencies [fa611381b]
- Updated dependencies [fc900f217]
- Updated dependencies [24e046fb3]
    - @comet/blocks-admin@7.24.0
    - @comet/admin-date-time@7.24.0
    - @comet/admin@7.24.0
    - @comet/admin-theme@7.24.0
    - @comet/admin-rte@7.24.0
    - @comet/admin-icons@7.24.0

## 7.23.0

### Minor Changes

- afaa49d6e: Page Tree: Add support for scope parts

    **Example**

    ```tsx
    <CmsBlockContextProvider
        // Dimension "domain" is used for the page tree scope
        pageTreeScopeParts={["domain"]}
    >
        {/* ... */}
    </CmsBlockContextProvider>
    ```

### Patch Changes

- @comet/admin@7.23.0
- @comet/admin-date-time@7.23.0
- @comet/admin-icons@7.23.0
- @comet/admin-rte@7.23.0
- @comet/admin-theme@7.23.0
- @comet/blocks-admin@7.23.0

## 7.22.0

### Minor Changes

- 2cf573b72: Adapt styling of `DamTable` to align with Comet DXP design

### Patch Changes

- 8b80b254e: Set `altText` and `title` fields to null in the DAM when deleting the field value

    Previously, the `altText` and `title` fields value couldn't be completely removed.

- 6d8159d67: Prevent the `UserPermissionsUserGrid` from losing focus while entering text in the search input
- Updated dependencies [2cf573b72]
- Updated dependencies [086774f01]
    - @comet/admin@7.22.0
    - @comet/admin-date-time@7.22.0
    - @comet/admin-icons@7.22.0
    - @comet/admin-rte@7.22.0
    - @comet/admin-theme@7.22.0
    - @comet/blocks-admin@7.22.0

## 7.21.1

### Patch Changes

- Updated dependencies [b771bd6d8]
    - @comet/admin@7.21.1
    - @comet/admin-date-time@7.21.1
    - @comet/admin-icons@7.21.1
    - @comet/admin-rte@7.21.1
    - @comet/admin-theme@7.21.1
    - @comet/blocks-admin@7.21.1

## 7.21.0

### Patch Changes

- Updated dependencies [1a30eb858]
- Updated dependencies [1a30eb858]
- Updated dependencies [3e9ea613e]
    - @comet/admin-date-time@7.21.0
    - @comet/admin@7.21.0
    - @comet/admin-icons@7.21.0
    - @comet/admin-rte@7.21.0
    - @comet/admin-theme@7.21.0
    - @comet/blocks-admin@7.21.0

## 7.20.0

### Minor Changes

- ea26f5d89: Add a nullable column `activatedAt` to `Redirects` table to display the latest activation date of a redirect

### Patch Changes

- Updated dependencies [415a83165]
- Updated dependencies [99f904f81]
- Updated dependencies [2d1726543]
    - @comet/admin@7.20.0
    - @comet/admin-date-time@7.20.0
    - @comet/admin-icons@7.20.0
    - @comet/admin-rte@7.20.0
    - @comet/admin-theme@7.20.0
    - @comet/blocks-admin@7.20.0

## 7.19.0

### Minor Changes

- 91cb37bb9: Add `mimetype` to `DamFileDownloadLinkBlock`

### Patch Changes

- ea932357e: Prevent `ContentScopeSelect` from overlapping the header
- Updated dependencies [3544127ad]
- Updated dependencies [17b79b581]
    - @comet/admin@7.19.0
    - @comet/blocks-admin@7.19.0
    - @comet/admin-date-time@7.19.0
    - @comet/admin-icons@7.19.0
    - @comet/admin-rte@7.19.0
    - @comet/admin-theme@7.19.0

## 7.18.0

### Minor Changes

- 2dc23dd6d: Remove visual device frames (Mobile, Tablet, Desktop) from Admin Preview
- ec9778450: Support multiple paths `ContentScopeProvider` by default

    Change the default implementation of `location.createPath` to create multiple paths based on the content scope shapes.

### Patch Changes

- 0acf80d30: User Permissions: Allow permission-specific content scopes to override by-rule content scopes
- Updated dependencies [e6092df34]
- Updated dependencies [f496734f8]
- Updated dependencies [e6092df34]
    - @comet/admin-date-time@7.18.0
    - @comet/blocks-admin@7.18.0
    - @comet/admin@7.18.0
    - @comet/admin-icons@7.18.0
    - @comet/admin-rte@7.18.0
    - @comet/admin-theme@7.18.0

## 7.17.0

### Minor Changes

- 4c3b64610: Add `video/webm` to allowedMimetypes of `DamVideoBlock`
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

### Patch Changes

- ae56e879e: Prevent the content of `ContentScopeIndicator` from breaking on mobile to align with the Comet DXP design
    - @comet/admin@7.17.0
    - @comet/admin-date-time@7.17.0
    - @comet/admin-icons@7.17.0
    - @comet/admin-rte@7.17.0
    - @comet/admin-theme@7.17.0
    - @comet/blocks-admin@7.17.0

## 7.16.0

### Minor Changes

- 997b220fa: Adapt styling of the link dialog in `createRichTextBlock` to match the Comet DXP design
- ed9282b3b: Improve the block preview of redirect targets

    Display the redirect target in the first line.
    Move additional information (type, path) to the second line.

### Patch Changes

- ea014c5e3: Set the correct icon for the button to confirm page actions
- e59fffbb2: Adapt styling of the page tree search input to match the Comet DXP design
- Updated dependencies [9bd499dcd]
- Updated dependencies [ed9282b3b]
- Updated dependencies [ec1cf3cf8]
- Updated dependencies [bf7b89ffc]
- Updated dependencies [5b7c6b4a7]
    - @comet/blocks-admin@7.16.0
    - @comet/admin-theme@7.16.0
    - @comet/admin@7.16.0
    - @comet/admin-date-time@7.16.0
    - @comet/admin-icons@7.16.0
    - @comet/admin-rte@7.16.0

## 7.15.0

### Patch Changes

- 46ab330da: Adapt styling of the dashboard header to match the Comet DXP design
- Updated dependencies [e056e8f3d]
- Updated dependencies [a189d4ed9]
- Updated dependencies [faa54eb8e]
- Updated dependencies [7d8c36e6c]
- Updated dependencies [a189d4ed9]
- Updated dependencies [6827982fe]
- Updated dependencies [7d8c36e6c]
    - @comet/blocks-admin@7.15.0
    - @comet/admin@7.15.0
    - @comet/admin-theme@7.15.0
    - @comet/admin-date-time@7.15.0
    - @comet/admin-icons@7.15.0
    - @comet/admin-rte@7.15.0

## 7.14.0

### Minor Changes

- 97cd0a3dd: User Permissions: Use Data Grid instead of a checkbox list for displaying and selecting content scopes
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

- c71604e71: Add an `override` argument to all block factories to follow `createCompositeBlock`'s pattern

### Patch Changes

- Updated dependencies [6b75f20e4]
- Updated dependencies [9b190db59]
- Updated dependencies [84e063642]
- Updated dependencies [948e07bba]
- Updated dependencies [bb041f7a7]
- Updated dependencies [7f72e82fc]
    - @comet/admin@7.14.0
    - @comet/admin-theme@7.14.0
    - @comet/blocks-admin@7.14.0
    - @comet/admin-rte@7.14.0
    - @comet/admin-date-time@7.14.0
    - @comet/admin-icons@7.14.0

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

- Updated dependencies [bd562d325]
- Updated dependencies [5c06e4bee]
- Updated dependencies [bd562d325]
- Updated dependencies [b918c810b]
- Updated dependencies [86c1d5996]
    - @comet/admin@7.13.0
    - @comet/blocks-admin@7.13.0
    - @comet/admin-rte@7.13.0
    - @comet/admin-date-time@7.13.0
    - @comet/admin-icons@7.13.0
    - @comet/admin-theme@7.13.0

## 7.12.0

### Minor Changes

- 604491df5: Validate filename length for uploads to DAM or FileUploads

    The filename can't exceed 255 characters.

### Patch Changes

- 64173b513: Fix page tree node slug validation to prevent URL encoded characters
- 0837c4c64: Hide the "Dependents" tab in the DAM for users without the permission `dependencies`
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

- 02dd20ac4: Export `useDamScope` hook

    This allows accessing the DAM scope in the application. This might be necessary when developing integrations with a third-party DAM.

- 954635630: Update default icon of `ContentScopeSelect` and fix mobile styling for `AppHeader` components
    - Update the default icon in `ContentScopeSelect` from `<Domain />` to `<Language />`
    - Fix mobile styling of `BuildEntry` and `ContentScopeSelect` and `UserHeaderItem`

- Updated dependencies [af51bb408]
- Updated dependencies [92b3255d2]
- Updated dependencies [47be4ebd3]
- Updated dependencies [86479e770]
- Updated dependencies [954635630]
- Updated dependencies [e8003f9c7]
- Updated dependencies [4f6e6b011]
- Updated dependencies [5583c9cff]
- Updated dependencies [ee597535a]
- Updated dependencies [5583c9cff]
- Updated dependencies [7da81fa2e]
- Updated dependencies [3ddc2278b]
- Updated dependencies [af350d086]
- Updated dependencies [86479e770]
- Updated dependencies [0bb181a52]
- Updated dependencies [af51bb408]
    - @comet/admin@7.12.0
    - @comet/admin-theme@7.12.0
    - @comet/blocks-admin@7.12.0
    - @comet/admin-date-time@7.12.0
    - @comet/admin-icons@7.12.0
    - @comet/admin-rte@7.12.0

## 7.11.0

### Minor Changes

- 3acbb04d4: Update design of the user menu in the header and add information about the impersonated user

### Patch Changes

- 94cc411a6: Adapt styling of `ContentScopeSelect` to match the Comet design
- 6778c4e97: Prevent the creation of a second home page
- 7992a9a9e: Enable setting `importSourceId` and `importSourceType` for each individual file in the `useDamFileUpload#uploadFiles` function
- Updated dependencies [b8b8e2747]
- Updated dependencies [9f2a1272b]
- Updated dependencies [1e01cca21]
- Updated dependencies [a30f0ee4d]
- Updated dependencies [a4fcdeb51]
- Updated dependencies [5ba64aab6]
- Updated dependencies [20f63417e]
- Updated dependencies [e9f547d95]
- Updated dependencies [8114a6ae7]
    - @comet/admin@7.11.0
    - @comet/admin-theme@7.11.0
    - @comet/admin-date-time@7.11.0
    - @comet/admin-icons@7.11.0
    - @comet/admin-rte@7.11.0
    - @comet/blocks-admin@7.11.0

## 7.10.0

### Minor Changes

- 2b9fac2cf: Add support for passing title and alt text to `useDamFileUpload`

    This can be useful when importing files from an external DAM.

### Patch Changes

- d210ef74a: Remove vertical and horizontal scroll bars from block preview iframe
- Updated dependencies [7e94c55f6]
- Updated dependencies [22f3d402e]
- Updated dependencies [8f924d591]
- Updated dependencies [aa02ca13f]
- Updated dependencies [6eba5abea]
- Updated dependencies [6eba5abea]
- Updated dependencies [bf6b03fe0]
- Updated dependencies [b51bf6d85]
- Updated dependencies [71876ea69]
- Updated dependencies [589b0b9ee]
    - @comet/admin-theme@7.10.0
    - @comet/admin@7.10.0
    - @comet/admin-date-time@7.10.0
    - @comet/admin-icons@7.10.0
    - @comet/admin-rte@7.10.0
    - @comet/blocks-admin@7.10.0

## 7.9.0

### Minor Changes

- 7cea765fe: Add UI for Impersonation Feature
    - Add indicator to display when impersonation mode is active in `UserHeaderItem`
    - Add button to allow users to switch on impersonation in the `UserGrid`
    - Integrate `CrudMoreActionsMenu` in `UserPageToolbar` with an impersonation entry for easy access to this feature.
    - Add `ImpersonateUser` icon

### Patch Changes

- 6d6131b16: Use consistent date and time formatting across the Admin UI
- 27510c22f: Prevent `ContentScopeIndicator` from crashing when a scope part is `undefined`
- 8ed5795a1: Don't add non-existing scope parts to the `DamScope` as `undefined`
- 7ce4b0f0a: Fix DAM license duration input when no values are provided
- Updated dependencies [6d6131b16]
- Updated dependencies [7cea765fe]
- Updated dependencies [92f9d078f]
- Updated dependencies [48cac4dac]
- Updated dependencies [047b9d17b]
- Updated dependencies [0919e3ba6]
- Updated dependencies [55d40ef08]
- Updated dependencies [9aa6947b7]
- Updated dependencies [59b4b6f77]
    - @comet/admin@7.9.0
    - @comet/admin-icons@7.9.0
    - @comet/blocks-admin@7.9.0
    - @comet/admin-theme@7.9.0
    - @comet/admin-date-time@7.9.0
    - @comet/admin-rte@7.9.0

## 7.8.0

### Minor Changes

- 44a54554c: Allow replacing a file with a new one on the file detail page in the DAM
- b721ac044: Harmonize the size and alignment of the DAM filters
- c6d3ac36b: Add support for file replacement on upload in the DAM

    When uploading a file to the DAM with the same filename as an existing file, it's now possible to replace the existing file.
    This is useful when you want to update a file without changing its URL.

- 4037b4d8c: Rework the DAM crop/focus settings UI
- 059636aba: Pass the `graphQLApiUrl` for `useBlockPreviewFetch` through the `IFrameBridge`

    It's not necessary to set it in the site anymore. To migrate, remove the argument from `useBlockPreviewFetch()`:

    ```diff
    const PreviewPage = () => {
        const iFrameBridge = useIFrameBridge();

    -   const { fetch, graphQLFetch } = useBlockPreviewFetch(graphQLApiUrl);
    +   const { fetch, graphQLFetch } = useBlockPreviewFetch();

        const [blockData, setBlockData] = useState<PageContentBlockData>();
        useEffect(() => {
            async function load() {
    +           if (!graphQLFetch) {
    +               return;
    +           }
                if (!iFrameBridge.block) {
                    setBlockData(undefined);
                    return;
                }
                const newData = await recursivelyLoadBlockData({
                    blockType: "PageContent",
                    blockData: iFrameBridge.block,
                    graphQLFetch,
                    fetch,
                    pageTreeNodeId: undefined, //we don't have a pageTreeNodeId in preview
                });
                setBlockData(newData);
            }
            load();
        }, [iFrameBridge.block, fetch, graphQLFetch]);

        return <div>{blockData && <PageContentBlock data={blockData} />}</div>;
    };
    ```

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

- 62ead06fa: Master Menu: render collapsible or grouped menu items only when at least one item of the submenu is allowed.
- Updated dependencies [139616be6]
- Updated dependencies [d8fca0522]
- Updated dependencies [a168e5514]
- Updated dependencies [e16ad1a02]
- Updated dependencies [e78315c9c]
- Updated dependencies [c6d3ac36b]
- Updated dependencies [139616be6]
- Updated dependencies [eefb0546f]
- Updated dependencies [795ec73d9]
- Updated dependencies [8617c3bcd]
- Updated dependencies [d8298d59a]
- Updated dependencies [059636aba]
- Updated dependencies [daacf1ea6]
- Updated dependencies [4338a6c07]
- Updated dependencies [9cc75c141]
    - @comet/admin@7.8.0
    - @comet/admin-icons@7.8.0
    - @comet/blocks-admin@7.8.0
    - @comet/admin-date-time@7.8.0
    - @comet/admin-rte@7.8.0
    - @comet/admin-theme@7.8.0

## 7.7.0

### Minor Changes

- 6cb498f51: Add search results highlighting to `ContentScopeSelect`

    Also, add the helper function `findTextMatches`, which can be used to add search highlighting to a custom `renderOption` implementation:

    ```tsx
    <ContentScopeSelect
        renderOption={(option, query) => {
            const text = `${option.domain.label} – ${option.language.label}`;
            const matches = findTextMatches(text, query);
            return <ListItemText primary={<MarkedMatches text={text} matches={matches} />} />;
        }}
    />
    ```

### Patch Changes

- bb9215f25: Don't move files to a folder called "." when uploading them to the DAM

    This bug only occurred in projects with a `react-dropzone` version >= 14.3.2.

- Updated dependencies [8ffc90eb1]
- Updated dependencies [a9d2e2e25]
    - @comet/blocks-admin@7.7.0
    - @comet/admin@7.7.0
    - @comet/admin-date-time@7.7.0
    - @comet/admin-icons@7.7.0
    - @comet/admin-rte@7.7.0
    - @comet/admin-theme@7.7.0

## 7.6.0

### Minor Changes

- 1f5c29ce8: Show the number of permissions and content scopes in the User Permissions Admin panel
- 671e2b234: Create site preview JWT in the API

    With this change the site preview can be deployed unprotected. Authentication is made via a JWT created in the API and validated in the site. A separate domain for the site preview is still necessary.

    **Note:** This requires the `sitePreviewSecret` option to be configured in the `PageTreeModule`.
    Run `npx @comet/upgrade@latest v7/add-site-preview-secret.ts` in the root of your project to perform the necessary code changes.
    Changes to the deployment setup might still be necessary.

- 3ea66fb38: Add support for user impersonation

    Prerequisites for setups with separate domains for admin and api: `credentials: "include"` must be set in the `createApolloClient` function in the admin.

    Adds an "Impersonation" button to the detail view of a user in the User Permissions admin panel. The impersonation can be exited by clicking the button in the user's info on the top right.

- d54a8c9f8: Add support for multiple paths in `ContentScopeProvider`

    This enables using different paths for scopes with non-overlapping dimensions.
    The `location.createPath` and `location.createUrl` functions can be used to override the default behavior.

    **Example**

    ```tsx
    <ContentScopeProvider
        location={{
            createPath: () => ["/organization/:organizationId", "/channel/:channelId"],
            createUrl: (scope) => {
                if (scope.organizationId) {
                    return `/organization/${scope.organizationId}`;
                } else if (scope.channelId) {
                    return `/channel/${scope.channelId}`;
                } else {
                    throw new Error("Invalid scope");
                }
            },
        }}
    />
    ```

- 05058fc1b: Export components to allow customization of User Permissions Admin panel

    The application can provide a custom UserPermissionsPage based on the [default UserPermissionsPage](https://github.com/vivid-planet/comet/blob/main/packages/admin/cms-admin/src/userPermissions/UserPermissionsPage.tsx).

- 0589ef554: Add `displayName` prop to `createTextLinkBlock` factory to support setting a custom display name

### Patch Changes

- 11ce320e9: Fix validation of empty `PhoneLinkBlock`

    Previously, the default phone value was an empty string, meaning `@IsOptional()` didn't prevent validation.
    Since an empty string is not a valid phone number, the validation failed.

    This change sets the default value to `undefined`.

- 700ddc340: Fix copy/paste for documents containing a `DamFileDownloadLinkBlock`
- 18a9f22a7: Keep current location when changing scope on publisher and user permissions page
- 6a43beebc: Display global `ContentScopeIndicator` if redirects are scoped globally

    Previously, an empty `ContentScopeIndicator` was displayed if no `scopeParts` were passed to `createRedirectsPage`.

- 1cf01f70f: Fix `ContentScopeIndicator` for scope with optional dimensions
- Updated dependencies [bc19fb18c]
- Updated dependencies [37d71a89a]
- Updated dependencies [cf2ee898f]
- Updated dependencies [03afcd073]
- Updated dependencies [00d7ddae1]
- Updated dependencies [fe8909404]
    - @comet/admin@7.6.0
    - @comet/admin-date-time@7.6.0
    - @comet/admin-icons@7.6.0
    - @comet/admin-rte@7.6.0
    - @comet/admin-theme@7.6.0
    - @comet/blocks-admin@7.6.0

## 7.5.0

### Minor Changes

- 5a48ae482: Add file size to `DamFileDownloadLinkBlock`
- 2639fe51a: Add "License" column to DAM Data Grid

    It is only shown if the license feature is enabled by setting `enableLicenseFeature` in `DamConfigProvider` to `true`.

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

- bc124d267: Support numbers as content scope values in User Permissions administration panel
- Updated dependencies [bb7c2de72]
- Updated dependencies [9a6a64ef3]
- Updated dependencies [c59a60023]
- Updated dependencies [b5838209b]
- Updated dependencies [c8f37fbd1]
- Updated dependencies [4cea3e31b]
- Updated dependencies [216d93a10]
    - @comet/admin@7.5.0
    - @comet/admin-date-time@7.5.0
    - @comet/admin-icons@7.5.0
    - @comet/admin-rte@7.5.0
    - @comet/admin-theme@7.5.0
    - @comet/blocks-admin@7.5.0

## 7.4.2

### Patch Changes

- @comet/admin@7.4.2
- @comet/admin-date-time@7.4.2
- @comet/admin-icons@7.4.2
- @comet/admin-rte@7.4.2
- @comet/admin-theme@7.4.2
- @comet/blocks-admin@7.4.2

## 7.4.1

### Patch Changes

- fa31e0856: Display validation errors of file name field in DAM
    - @comet/admin@7.4.1
    - @comet/admin-date-time@7.4.1
    - @comet/admin-icons@7.4.1
    - @comet/admin-rte@7.4.1
    - @comet/admin-theme@7.4.1
    - @comet/blocks-admin@7.4.1

## 7.4.0

### Minor Changes

- aad4eef42: Use a `Chip` in combination with a `Menu` for the page visibility selection

    This replaces a `Button` which was used previously as trigger for the menu.

- 44f1c593e: Add dialog to confirm manually starting a cron job
- cab7c427a: Add support for downloading previously uploaded files to `FileUploadField`
- 1ca46e8da: Add support for `badgeContent` prop in `MenuItemRouterLink`

    **Example usage in `masterMenuData`:**

    ```ts
    const masterMenuData = [
        // ...
        {
            type: "route",
            primary: "Some Route",
            to: "/someRoute",
            badgeContent: 2,
        },
        // ...
    ];
    ```

    **Example usage as element:**

    ```tsx
    <MenuItemRouterLink primary="Some Route" to="/someRoute" badgeContent={2} />
    ```

- bfb8f04e6: Add `VimeoVideoBlock` to support Vimeo videos
- 5fc1fc393: Add info alert for dependents and duplicates in DAM

### Patch Changes

- Updated dependencies [22863c202]
- Updated dependencies [cab7c427a]
- Updated dependencies [48d1403d7]
- Updated dependencies [1ca46e8da]
- Updated dependencies [1ca46e8da]
- Updated dependencies [bef162a60]
- Updated dependencies [bc1ed880a]
- Updated dependencies [46f932299]
- Updated dependencies [3e013b05d]
    - @comet/admin@7.4.0
    - @comet/blocks-admin@7.4.0
    - @comet/admin-date-time@7.4.0
    - @comet/admin-icons@7.4.0
    - @comet/admin-rte@7.4.0
    - @comet/admin-theme@7.4.0

## 7.3.2

### Patch Changes

- Updated dependencies [2286234e5]
    - @comet/admin@7.3.2
    - @comet/admin-date-time@7.3.2
    - @comet/admin-icons@7.3.2
    - @comet/admin-rte@7.3.2
    - @comet/admin-theme@7.3.2
    - @comet/blocks-admin@7.3.2

## 7.3.1

### Patch Changes

- Updated dependencies [91bfda996]
    - @comet/admin@7.3.1
    - @comet/admin-date-time@7.3.1
    - @comet/admin-icons@7.3.1
    - @comet/admin-rte@7.3.1
    - @comet/admin-theme@7.3.1
    - @comet/blocks-admin@7.3.1

## 7.3.0

### Patch Changes

- 3f1b9617d: Allow emptying `targetUrl` in `ExternalLinkBlock`
- Updated dependencies [6a1310cf6]
- Updated dependencies [5364ecb37]
- Updated dependencies [a1f4c0dec]
- Updated dependencies [2ab7b688e]
    - @comet/admin-date-time@7.3.0
    - @comet/admin@7.3.0
    - @comet/admin-icons@7.3.0
    - @comet/admin-rte@7.3.0
    - @comet/admin-theme@7.3.0
    - @comet/blocks-admin@7.3.0

## 7.2.1

### Patch Changes

- @comet/admin@7.2.1
- @comet/admin-date-time@7.2.1
- @comet/admin-icons@7.2.1
- @comet/admin-rte@7.2.1
- @comet/admin-theme@7.2.1
- @comet/blocks-admin@7.2.1

## 7.2.0

### Patch Changes

- 4b267f90d: Fix broken export/import of `commonErrorMessages` from the file form field
- Updated dependencies [9b800c9f6]
- Updated dependencies [0fb8d9a26]
- Updated dependencies [4b267f90d]
    - @comet/admin-theme@7.2.0
    - @comet/admin@7.2.0
    - @comet/admin-date-time@7.2.0
    - @comet/admin-icons@7.2.0
    - @comet/admin-rte@7.2.0
    - @comet/blocks-admin@7.2.0

## 7.1.0

### Minor Changes

- 7410aae83: Add new `FileUploadField` component for uploading files in forms using the `FileUploadsModule`
- 945ba8725: Add `icon` prop to `DashboardWidgetRoot`
- 9a8098488: Rework `EditImageDialog`

    Changes
    - Increase image size
    - Add hover effects for focal points
    - Add "Open in DAM" button

        Note: This feature only works if the `DependenciesConfig` is configured for `DamFile`:

        ```diff
        // App.tsx

        <DependenciesConfigProvider
            entityDependencyMap={{
        +       DamFile: createDamFileDependency(),
                // ...
            }}
        >
        ```

- 91b154b06: Make the details and creator/author fields optional when using the DAM license feature

### Patch Changes

- 7dabe8d11: Fix the content scope indicator on the `EditFile` page if DAM scoping is disabled
- 452a12a3c: Change text color of `FilePreview` action buttons to white

    Previously, the text was invisible because it was black on a black background.

- bbb753600: Fix false positives in `resolveHasSaveConflict` check

    The check occasionally failed due to rounding errors.
    This is fixed by rounding to full seconds before checking.

- Updated dependencies [3adf5fecd]
- Updated dependencies [04844d39e]
- Updated dependencies [2253a1d00]
- Updated dependencies [dfc4a7fff]
- Updated dependencies [1fe10e883]
- Updated dependencies [c90ae39d4]
- Updated dependencies [b1bbd6a0c]
- Updated dependencies [c0488eb84]
- Updated dependencies [e53f4ce06]
- Updated dependencies [39ab15616]
- Updated dependencies [c1ab2b340]
- Updated dependencies [99a1f0ae6]
- Updated dependencies [edf14d066]
- Updated dependencies [2b68513be]
- Updated dependencies [6be41b668]
- Updated dependencies [374f383ba]
- Updated dependencies [c050f2242]
    - @comet/admin-theme@7.1.0
    - @comet/admin@7.1.0
    - @comet/blocks-admin@7.1.0
    - @comet/admin-icons@7.1.0
    - @comet/admin-date-time@7.1.0
    - @comet/admin-rte@7.1.0

## 7.0.0

### Major Changes

- 0588e212c: Remove `language` field from `User` object
    - Providing the locale is not mandatory for ID-Tokens
    - Does not have a real use case (better rely on the Accept-Language header of the browser to determine the language of the current user)

- 3574617ea: Remove `EditPageLayout`

    You can completely remove `EditPageLayout` from your application.
    Instead, use `MainContent` to wrap all your page content except the `Toolbar`.
    If needed, wrap `MainContent` and `Toolbar` in a fragment.

    Example:

    ```diff
    - <EditPageLayout>
    + <>
          <Toolbar>
              // ...
          </Toolbar>
    -     <div>
    +     <MainContent>
              // ...
    -     </div>
    +     </MainContent>
    - </EditPageLayout>
    + </>
    ```

- 0e6debb06: CRUD Generator: Remove `lastUpdatedAt` argument from update mutations
- 2abc096fe: Replace the `ContentScopeIndicator` with a new version intended for use in the new `Toolbar`

    The old `ContentScopeIndicator` was a purely cosmetic component. Hence, the logic for displaying the current scope had to be implemented in the project (usually in a project-internal `ContentScopeIndicator` component).

    The new `ContentScopeIndicator` has the logic for displaying the current scope built-in. Thus, you can remove your project's `ContentScopeIndicator` implementation and directly use the `ContentScopeIndicator` from this library.

    Usage:
    - Per default, the `ContentScopeIndicator` displays the current `ContentScope`
    - Pass a scope object via the `scope` prop if your page has a custom scope
    - Pass the `global` prop if your page has no scope
    - Pass `children` if you want to render completely custom content

- c8e7a0496: Restructure `MasterMenuData`

    Items now need an explicit `type`. There are four types available:
    - `route`

        ```diff
        {
        +   type: "route",
            primary: <FormattedMessage id="menu.dashboard" defaultMessage="Dashboard" />,
            icon: <DashboardIcon />,
            route: {
                path: "/dashboard",
                component: Dashboard,
            },
        },
        ```

    - `externalLink`

        ```diff
        {
        +   type: "externalLink",
            primary: <FormattedMessage id="menu.cometDxp" defaultMessage="COMET DXP" />,
            icon: <Snips />,
            href: "https://comet-dxp.com",
        },
        ```

    - `collapsible`

        ```diff
        {
        +   type: "collapsible",
            primary: <FormattedMessage id="menu.structuredContent" defaultMessage="Structured Content" />,
            icon: <Data />,
        -   submenu: [
        +   items: [
                // ...
            ],
        },
        ```

    - `group` (new)

        ```diff
        {
        +  type: "group",
        +  title: <FormattedMessage id="menu.products" defaultMessage="Products" />,
        +  items: [
        +      // ...
        +  ]
        },
        ```

- 06768a70f: Make icon required for top level menu and group items

    This fixes the problem, that there was no icon or text to display in the collapsed state of the menu if no icon was passed.
    Icons are required for all top level menu items and the items of groups. Groups themselves do not require an icon.

- ebf597120: Remove unused/unnecessary peer dependencies

    Some dependencies were incorrectly marked as peer dependencies.
    If you don't use them in your application, you may remove the following dependencies:
    - Admin: `axios`
    - API: `@aws-sdk/client-s3`, `@azure/storage-blob` and `pg-error-constants`

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

- b777136f8: Rework `ContentScopeProvider` and `ContentScopeControls`

    The content scope controls were changed to display all available combinations in a single select.

    This requires a few breaking changes:
    1. The `values` props of `ContentScopeProvider` has been changed to an array:

        **Before**

        ```ts
        const values: ContentScopeValues<ContentScope> = {
            domain: [
                { label: "Main", value: "main" },
                { label: "Secondary", value: "secondary" },
            ],
            language: [
                { label: "English", value: "en" },
                { label: "German", value: "de" },
            ],
        };
        ```

        **Now**

        ```ts
        const values: ContentScopeValues<ContentScope> = [
            {
                domain: { label: "Main", value: "main" },
                language: { label: "English", value: "en" },
            },
            {
                domain: { label: "Main", value: "main" },
                language: { label: "German", value: "de" },
            },
            {
                domain: { label: "Secondary", value: "secondary" },
                language: { label: "English", value: "en" },
            },
        ];
        ```

    2. The `config` prop of `ContentScopeControls` has been removed.
       You can use the props `searchable`, `groupBy`, and `icon` instead.
       You may also remove the convenience wrapper defined in the application as it doesn't offer a real benefit anymore:

        ```diff
        + import { ContentScopeControls } from "@comet/cms-admin";
        - import { ContentScopeControls as ContentScopeControlsLibrary } from "@comet/cms-admin";

        - export const ContentScopeControls: React.FC = () => {
        -     return <ContentScopeControlsLibrary<ContentScope> config={controlsConfig} />;
        - };
        ```

- ae0142029: Support single host for block preview

    The content scope is passed through the iframe-bridge in the admin and accessible in the site in the IFrameBridgeProvider.
    Breaking: `previewUrl`-property of `SiteConfig` has changed to `blockPreviewBaseUrl`

- c3940df58: Replace `additionalMimeTypes` and `overrideAcceptedMimeTypes` in `DamConfigProvider` with `acceptedMimeTypes`

    You can now add mime types like this:

    ```tsx
    <DamConfigProvider
        value={{
            acceptedMimeTypes: [...damDefaultAcceptedMimetypes, "something-else"],
        }}
    >
        {/* ... */}
    </DamConfigProvider>
    ```

    And remove them like this:

    ```tsx
    <DamConfigProvider
        value={{
            acceptedMimeTypes: damDefaultAcceptedMimetypes.filter((mimeType) => mimeType !== "application/zip"),
        }}
    >
        {/* ... */}
    </DamConfigProvider>
    ```

    Don't forget to also remove/add the mime types in the API's `DamModule`

- 92eae2ba9: Change the method of overriding the styling of Admin components
    - Remove dependency on the legacy `@mui/styles` package in favor of `@mui/material/styles`.
    - Add the ability to style components using [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/).
    - Add the ability to style individual elements (slots) of a component using the `slotProps` and `sx` props.
    - The `# @comet/cms-admin syntax in the theme's `styleOverrides` is no longer supported, see: https://mui.com/material-ui/migration/v5-style-changes/#migrate-theme-styleoverrides-to-emotion

    ```diff
     const theme = createCometTheme({
         components: {
             CometAdminMyComponent: {
                 styleOverrides: {
    -                root: {
    -                    "&$hasShadow": {
    -                        boxShadow: "2px 2px 5px 0 rgba(0, 0, 0, 0.25)",
    -                    },
    -                    "& $header": {
    -                        backgroundColor: "lime",
    -                    },
    -                },
    +                hasShadow: {
    +                    boxShadow: "2px 2px 5px 0 rgba(0, 0, 0, 0.25)",
    +                },
    +                header: {
    +                    backgroundColor: "lime",
    +                },
                 },
             },
         },
     });
    ```

    - Overriding a component's styles using `withStyles` is no longer supported. Use the `sx` and `slotProps` props instead:

    ```diff
    -import { withStyles } from "@mui/styles";
    -
    -const StyledMyComponent = withStyles({
    -    root: {
    -        backgroundColor: "lime",
    -    },
    -    header: {
    -        backgroundColor: "fuchsia",
    -    },
    -})(MyComponent);
    -
    -// ...
    -
    -<StyledMyComponent title="Hello World" />;
    +<MyComponent
    +    title="Hello World"
    +    sx={{
    +        backgroundColor: "lime",
    +    }}
    +    slotProps={{
    +        header: {
    +            sx: {
    +                backgroundColor: "fuchsia",
    +            },
    +        },
    +    }}
    +/>
    ```

    - The module augmentation for the `DefaultTheme` type from `@mui/styles/defaultTheme` is no longer needed and needs to be removed from the admins theme file, usually located in `admin/src/theme.ts`:

    ```diff
    -declare module "@mui/styles/defaultTheme" {
    -    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    -    export interface DefaultTheme extends Theme {}
    -}
    ```

    - Class-keys originating from MUI components have been removed from Comet Admin components, causing certain class-names and `styleOverrides` to no longer be applied.
      The components `root` class-key is not affected. Other class-keys will retain the class-names and `styleOverrides` from the underlying MUI component.
      For example, in `ClearInputAdornment` (when used with `position="end"`) the class-name `CometAdminClearInputAdornment-positionEnd` and the `styleOverrides` for `CometAdminClearInputAdornment.positionEnd` will no longer be applied.
      The component will retain the class-names `MuiInputAdornment-positionEnd`, `MuiInputAdornment-root`, and `CometAdminClearInputAdornment-root`.
      Also, the `styleOverrides` for `MuiInputAdornment.positionEnd`, `MuiInputAdornment.root`, and `CometAdminClearInputAdornment.root` will continue to be applied.

        This affects the following components:
        - `AppHeader`
        - `AppHeaderMenuButton`
        - `ClearInputAdornment`
        - `Tooltip`
        - `CancelButton`
        - `DeleteButton`
        - `OkayButton`
        - `SaveButton`
        - `StackBackButton`
        - `DatePicker`
        - `DateRangePicker`
        - `TimePicker`

    - For more details, see MUI's migration guide: https://mui.com/material-ui/migration/v5-style-changes/#mui-styles

- 769bd72f0: Use the Next.js Preview Mode for the site preview

    The preview is entered by navigating to an API Route in the site, which has to be executed in a secured environment.
    In the API Route the current scope is checked (and possibly stored), then the client is redirected to the preview.

### Minor Changes

- b777136f8: Add `ContentScopeSelect` component

    This can be used as the basis for both content-driven and data-driven applications.

    **Example**

    ```tsx
    function ContentScopeControls() {
        const [value, setValue] = useState({ domain: "main", language: "en" });

        return (
            <ContentScopeSelect
                value={value}
                onChange={(value) => {
                    setValue(value);
                }}
                options={[
                    { domain: { label: "Main", value: "main" }, language: { label: "English", value: "en" } },
                    { domain: { label: "Main", value: "main" }, language: { label: "German", value: "de" } },
                    { domain: { label: "Secondary", value: "secondary" }, language: { label: "English", value: "en" } },
                    { domain: { label: "Secondary", value: "secondary" }, language: { label: "German", value: "de" } },
                ]}
            />
        );
    }
    ```

- 2486e8a91: Add future Admin Generator that works with configuration files
- 5c5500733: Remove "Re-login"-button from `CurrentUserProvider`

    The button is already implemented in `createErrorDialogApolloLink()`. The correct arrangement of
    the components in `App.tsx` (see migration guide) makes the double implementation needless.

- 8d920da56: CRUD Generator: Add support for date-only fields
- 52a925e0f: Admin Generator: Use variant="horizontal" for all generated form fields
- 3b1dc72d3: Adapt `Header` and `UserHeaderItem` used in `AppHeader` for mobile devices (<900px)
- 569ad0463: Deprecate `SplitButton`, `FinalFormSaveSplitButton` and `SplitButtonContext` and remove all uses of these components in our libraries

    The reason is that we decided to retire the SplitButton pattern.

- b7560e3a7: Add preview image to `YouTubeVideoBlock` and `DamVideoBlock`

    The `YouTubeVideoBlock` and the `DamVideoBlock` now support a preview image out of the box. For customisation the default `VideoPreviewImage` component can be overridden with the optional `renderPreviewImage` method.

    It is recommended to replace the custom implemented video blocks in the projects with the updated `YouTubeVideoBlock` and `DamVideoBlock` from the library.

### Patch Changes

- 53fe8d76e: Redirect to edit page after adding a redirect

    Previously, the user wasn't redirected to the edit page after creating a new redirect.
    This caused strange validation errors and made it impossible to edit the redirect after creating it.

- Updated dependencies [05ce68ec0]
- Updated dependencies [949356e84]
- Updated dependencies [51a0861d8]
- Updated dependencies [dc8bb6a99]
- Updated dependencies [803bc607f]
- Updated dependencies [54f775497]
- Updated dependencies [33ba50719]
- Updated dependencies [73140014f]
- Updated dependencies [9a4530b06]
- Updated dependencies [dc8bb6a99]
- Updated dependencies [33ba50719]
- Updated dependencies [e3efdfcc3]
- Updated dependencies [02d33e230]
- Updated dependencies [a0bd09afa]
- Updated dependencies [8cc51b368]
- Updated dependencies [c702cc5b2]
- Updated dependencies [c46146cb3]
- Updated dependencies [ad73068f4]
- Updated dependencies [6054fdcab]
- Updated dependencies [535444623]
- Updated dependencies [d0869ac82]
- Updated dependencies [9a4530b06]
- Updated dependencies [47ec528a4]
- Updated dependencies [33ba50719]
- Updated dependencies [956111ab2]
- Updated dependencies [f9615fbf4]
- Updated dependencies [19eaee4ca]
- Updated dependencies [758c65656]
- Updated dependencies [9a4530b06]
- Updated dependencies [cb544bc3e]
- Updated dependencies [04ed68cc9]
- Updated dependencies [61b2acfb2]
- Updated dependencies [0263a45fa]
- Updated dependencies [4ca4830f3]
- Updated dependencies [3397ec1b6]
- Updated dependencies [20b2bafd8]
- Updated dependencies [33ba50719]
- Updated dependencies [51a0861d8]
- Updated dependencies [b7560e3a7]
- Updated dependencies [9c4b7c974]
- Updated dependencies [b5753e612]
- Updated dependencies [2a7bc765c]
- Updated dependencies [774977311]
- Updated dependencies [27efe7bd8]
- Updated dependencies [f8114cd39]
- Updated dependencies [569ad0463]
- Updated dependencies [b87c3c292]
- Updated dependencies [170720b0c]
- Updated dependencies [f06f4bea6]
- Updated dependencies [cce88d448]
- Updated dependencies [a58918893]
- Updated dependencies [119714999]
- Updated dependencies [2a7bc765c]
- Updated dependencies [b87c3c292]
- Updated dependencies [d2e64d1ec]
- Updated dependencies [865f253d8]
- Updated dependencies [f8114cd39]
- Updated dependencies [241249bd4]
- Updated dependencies [be4e6392d]
- Updated dependencies [a53545438]
- Updated dependencies [1a1d83156]
- Updated dependencies [a2f278bbd]
- Updated dependencies [66330e4e6]
- Updated dependencies [b0249e3bc]
- Updated dependencies [92eae2ba9]
- Updated dependencies [33ba50719]
    - @comet/admin@7.0.0
    - @comet/admin-theme@7.0.0
    - @comet/admin-date-time@7.0.0
    - @comet/blocks-admin@7.0.0
    - @comet/admin-rte@7.0.0
    - @comet/admin-icons@7.0.0

## 7.0.0-beta.6

### Patch Changes

- Updated dependencies [119714999]
    - @comet/admin@7.0.0-beta.6
    - @comet/admin-date-time@7.0.0-beta.6
    - @comet/admin-icons@7.0.0-beta.6
    - @comet/admin-rte@7.0.0-beta.6
    - @comet/admin-theme@7.0.0-beta.6
    - @comet/blocks-admin@7.0.0-beta.6

## 7.0.0-beta.5

### Minor Changes

- 569ad0463: Deprecate `SplitButton`, `FinalFormSaveSplitButton` and `SplitButtonContext` and remove all uses of these components in our libraries

    The reason is that we decided to retire the SplitButton pattern.

### Patch Changes

- Updated dependencies [569ad0463]
    - @comet/admin@7.0.0-beta.5
    - @comet/admin-date-time@7.0.0-beta.5
    - @comet/admin-icons@7.0.0-beta.5
    - @comet/admin-rte@7.0.0-beta.5
    - @comet/admin-theme@7.0.0-beta.5
    - @comet/blocks-admin@7.0.0-beta.5

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

### Minor Changes

- b7560e3a7: Add preview image to `YouTubeVideoBlock` and `DamVideoBlock`

    The `YouTubeVideoBlock` and the `DamVideoBlock` now support a preview image out of the box. For customisation the default `VideoPreviewImage` component can be overridden with the optional `renderPreviewImage` method.

    It is recommended to replace the custom implemented video blocks in the projects with the updated `YouTubeVideoBlock` and `DamVideoBlock` from the library.

### Patch Changes

- Updated dependencies [a0bd09afa]
- Updated dependencies [b7560e3a7]
- Updated dependencies [170720b0c]
- Updated dependencies [a58918893]
    - @comet/admin@7.0.0-beta.4
    - @comet/blocks-admin@7.0.0-beta.4
    - @comet/admin-date-time@7.0.0-beta.4
    - @comet/admin-icons@7.0.0-beta.4
    - @comet/admin-rte@7.0.0-beta.4
    - @comet/admin-theme@7.0.0-beta.4

## 7.0.0-beta.3

### Major Changes

- 06768a70f: Make icon required for top level menu and group items

    This fixes the problem, that there was no icon or text to display in the collapsed state of the menu if no icon was passed.
    Icons are required for all top level menu items and the items of groups. Groups themselves do not require an icon.

### Patch Changes

- Updated dependencies [ce5eaede2]
    - @comet/admin@7.0.0-beta.3
    - @comet/admin-date-time@7.0.0-beta.3
    - @comet/admin-icons@7.0.0-beta.3
    - @comet/admin-rte@7.0.0-beta.3
    - @comet/admin-theme@7.0.0-beta.3
    - @comet/blocks-admin@7.0.0-beta.3

## 7.0.0-beta.2

### Major Changes

- 3574617ea: Remove `EditPageLayout`

    You can completely remove `EditPageLayout` from your application.
    Instead, use `MainContent` to wrap all your page content except the `Toolbar`.
    If needed, wrap `MainContent` and `Toolbar` in a fragment.

    Example:

    ```diff
    - <EditPageLayout>
    + <>
          <Toolbar>
              // ...
          </Toolbar>
    -     <div>
    +     <MainContent>
              // ...
    -     </div>
    +     </MainContent>
    - </EditPageLayout>
    + </>
    ```

### Minor Changes

- acfcef9e4: The `documentTypes` prop of `PagesPage` now also accepts a function mapping categories to document types

    Previously, only the supported documentTypes of the current category could be passed to the `PagesPage`.
    That made it impossible to verify if a document can be moved to another category.
    If a document was moved to a category that didn't support its type, the PageTree crashed.

    If a mapping function is passed to `documentTypes`, documents can only be moved to categories that support their type.

    ```diff
    <PagesPage
    -   documentTypes={pageTreeDocumentTypes}
    +   documentTypes={(category): Record<DocumentType, DocumentInterface> => {
    +       if (category === "TopMenu") {
    +           return {
    +               Page,
    +               PredefinedPage,
    +           };
    +       }
    +
    +       return {
    +           Page,
    +           PredefinedPage,
    +           Link,
    +       };
    +   }}
        // ...
    />
    ```

- 61a43d270: Add a menu item to `PixelImageBlock`, `SvgImageBlock` and `DamVideoBlock` that opens the chosen file in the DAM

    Note: This feature only works if the `DependenciesConfig` is configured for `DamFile`:

    ```diff
    // App.tsx

    <DependenciesConfigProvider
        entityDependencyMap={{
    +       DamFile: createDamFileDependency(),
            // ...
        }}
    >
    ```

### Patch Changes

- e106a02b2: Make the `ContentScopeIndicator` show the scope label instead of the scope value
- Updated dependencies [2fc764e29]
- Updated dependencies [2de81e40b]
    - @comet/admin@7.0.0-beta.2
    - @comet/admin-theme@7.0.0-beta.2
    - @comet/admin-date-time@7.0.0-beta.2
    - @comet/admin-icons@7.0.0-beta.2
    - @comet/admin-rte@7.0.0-beta.2
    - @comet/blocks-admin@7.0.0-beta.2

## 7.0.0-beta.1

### Major Changes

- c3940df58: Replace `additionalMimeTypes` and `overrideAcceptedMimeTypes` in `DamConfigProvider` with `acceptedMimeTypes`

    You can now add mime types like this:

    ```tsx
    <DamConfigProvider
        value={{
            acceptedMimeTypes: [...damDefaultAcceptedMimetypes, "something-else"],
        }}
    >
        {/* ... */}
    </DamConfigProvider>
    ```

    And remove them like this:

    ```tsx
    <DamConfigProvider
        value={{
            acceptedMimeTypes: damDefaultAcceptedMimetypes.filter((mimeType) => mimeType !== "application/zip"),
        }}
    >
        {/* ... */}
    </DamConfigProvider>
    ```

    Don't forget to also remove/add the mime types in the API's `DamModule`

### Minor Changes

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

### Patch Changes

- @comet/admin@7.0.0-beta.1
- @comet/admin-date-time@7.0.0-beta.1
- @comet/admin-icons@7.0.0-beta.1
- @comet/admin-rte@7.0.0-beta.1
- @comet/admin-theme@7.0.0-beta.1
- @comet/blocks-admin@7.0.0-beta.1

## 7.0.0-beta.0

### Major Changes

- f74544524: Change language field in User and CurrentUser to locale
- 0588e212c: Remove `locale`-field from `User`-object
    - Providing the locale is not mandatory for ID-Tokens
    - Does not have a real use case (better rely on the Accept-Language header of the browser to determine the language of the current user)

- 865f253d8: Add `@comet/admin-theme` as a peer dependency

    `@comet/cms-admin` now uses the custom `Typography` variants `list` and `listItem` defined in `@comet/admin-theme`.

- 0e6debb06: CRUD Generator: Remove `lastUpdatedAt` argument from update mutations
- 2abc096fe: Replace the `ContentScopeIndicator` with a new version intended for use in the new `Toolbar`

    The old `ContentScopeIndicator` was a purely cosmetic component. Hence, the logic for displaying the current scope had to be implemented in the project (usually in a project-internal `ContentScopeIndicator` component).

    The new `ContentScopeIndicator` has the logic for displaying the current scope built-in. Thus, you can remove your project's `ContentScopeIndicator` implementation and directly use the `ContentScopeIndicator` from this library.

    Usage:
    - Per default, the `ContentScopeIndicator` displays the current `ContentScope`
    - Pass a scope object via the `scope` prop if your page has a custom scope
    - Pass the `global` prop if your page has no scope
    - Pass `children` if you want to render completely custom content

- c8e7a0496: Restructure `MasterMenuData`

    Items now need an explicit `type`. There are four types available:
    - `route`

        ```diff
        {
        +   type: "route",
            primary: <FormattedMessage id="menu.dashboard" defaultMessage="Dashboard" />,
            icon: <DashboardIcon />,
            route: {
                path: "/dashboard",
                component: Dashboard,
            },
        },
        ```

    - `externalLink`

        ```diff
        {
        +   type: "externalLink",
            primary: <FormattedMessage id="menu.cometDxp" defaultMessage="COMET DXP" />,
            icon: <Snips />,
            href: "https://comet-dxp.com",
        },
        ```

    - `collapsible`

        ```diff
        {
        +   type: "collapsible",
            primary: <FormattedMessage id="menu.structuredContent" defaultMessage="Structured Content" />,
            icon: <Data />,
        -   submenu: [
        +   items: [
                // ...
            ],
        },
        ```

    - `group` (new)

        ```diff
        {
        +  type: "group",
        +  title: <FormattedMessage id="menu.products" defaultMessage="Products" />,
        +  items: [
        +      // ...
        +  ]
        },
        ```

- ebf597120: Remove unused/unnecessary peer dependencies

    Some dependencies were incorrectly marked as peer dependencies.
    If you don't use them in your application, you may remove the following dependencies:
    - Admin: `axios`
    - API: `@aws-sdk/client-s3`, `@azure/storage-blob` and `pg-error-constants`

- b777136f8: Rework `ContentScopeProvider` and `ContentScopeControls`

    The content scope controls were changed to display all available combinations in a single select.

    This requires a few breaking changes:
    1. The `values` props of `ContentScopeProvider` has been changed to an array:

        **Before**

        ```ts
        const values: ContentScopeValues<ContentScope> = {
            domain: [
                { label: "Main", value: "main" },
                { label: "Secondary", value: "secondary" },
            ],
            language: [
                { label: "English", value: "en" },
                { label: "German", value: "de" },
            ],
        };
        ```

        **Now**

        ```ts
        const values: ContentScopeValues<ContentScope> = [
            {
                domain: { label: "Main", value: "main" },
                language: { label: "English", value: "en" },
            },
            {
                domain: { label: "Main", value: "main" },
                language: { label: "German", value: "de" },
            },
            {
                domain: { label: "Secondary", value: "secondary" },
                language: { label: "English", value: "en" },
            },
        ];
        ```

    2. The `config` prop of `ContentScopeControls` has been removed.
       You can use the props `searchable`, `groupBy`, and `icon` instead.
       You may also remove the convenience wrapper defined in the application as it doesn't offer a real benefit anymore:

        ```diff
        + import { ContentScopeControls } from "@comet/cms-admin";
        - import { ContentScopeControls as ContentScopeControlsLibrary } from "@comet/cms-admin";

        - export const ContentScopeControls: React.FC = () => {
        -     return <ContentScopeControlsLibrary<ContentScope> config={controlsConfig} />;
        - };
        ```

- ae0142029: Support single host for block preview

    The content scope is passed through the iframe-bridge in the admin and accessible in the site in the IFrameBridgeProvider.
    Breaking: `previewUrl`-property of `SiteConfig` has changed to `blockPreviewBaseUrl`

- 92eae2ba9: Change the method of overriding the styling of Admin components
    - Remove dependency on the legacy `@mui/styles` package in favor of `@mui/material/styles`.
    - Add the ability to style components using [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/).
    - Add the ability to style individual elements (slots) of a component using the `slotProps` and `sx` props.
    - The `# @comet/cms-admin syntax in the theme's `styleOverrides` is no longer supported, see: https://mui.com/material-ui/migration/v5-style-changes/#migrate-theme-styleoverrides-to-emotion

    ```diff
     const theme = createCometTheme({
         components: {
             CometAdminMyComponent: {
                 styleOverrides: {
    -                root: {
    -                    "&$hasShadow": {
    -                        boxShadow: "2px 2px 5px 0 rgba(0, 0, 0, 0.25)",
    -                    },
    -                    "& $header": {
    -                        backgroundColor: "lime",
    -                    },
    -                },
    +                hasShadow: {
    +                    boxShadow: "2px 2px 5px 0 rgba(0, 0, 0, 0.25)",
    +                },
    +                header: {
    +                    backgroundColor: "lime",
    +                },
                 },
             },
         },
     });
    ```

    - Overriding a component's styles using `withStyles` is no longer supported. Use the `sx` and `slotProps` props instead:

    ```diff
    -import { withStyles } from "@mui/styles";
    -
    -const StyledMyComponent = withStyles({
    -    root: {
    -        backgroundColor: "lime",
    -    },
    -    header: {
    -        backgroundColor: "fuchsia",
    -    },
    -})(MyComponent);
    -
    -// ...
    -
    -<StyledMyComponent title="Hello World" />;
    +<MyComponent
    +    title="Hello World"
    +    sx={{
    +        backgroundColor: "lime",
    +    }}
    +    slotProps={{
    +        header: {
    +            sx: {
    +                backgroundColor: "fuchsia",
    +            },
    +        },
    +    }}
    +/>
    ```

    - The module augmentation for the `DefaultTheme` type from `@mui/styles/defaultTheme` is no longer needed and needs to be removed from the admins theme file, usually located in `admin/src/theme.ts`:

    ```diff
    -declare module "@mui/styles/defaultTheme" {
    -    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    -    export interface DefaultTheme extends Theme {}
    -}
    ```

    - Class-keys originating from MUI components have been removed from Comet Admin components, causing certain class-names and `styleOverrides` to no longer be applied.
      The components `root` class-key is not affected. Other class-keys will retain the class-names and `styleOverrides` from the underlying MUI component.
      For example, in `ClearInputAdornment` (when used with `position="end"`) the class-name `CometAdminClearInputAdornment-positionEnd` and the `styleOverrides` for `CometAdminClearInputAdornment.positionEnd` will no longer be applied.
      The component will retain the class-names `MuiInputAdornment-positionEnd`, `MuiInputAdornment-root`, and `CometAdminClearInputAdornment-root`.
      Also, the `styleOverrides` for `MuiInputAdornment.positionEnd`, `MuiInputAdornment.root`, and `CometAdminClearInputAdornment.root` will continue to be applied.

        This affects the following components:
        - `AppHeader`
        - `AppHeaderMenuButton`
        - `ClearInputAdornment`
        - `Tooltip`
        - `CancelButton`
        - `DeleteButton`
        - `OkayButton`
        - `SaveButton`
        - `StackBackButton`
        - `DatePicker`
        - `DateRangePicker`
        - `TimePicker`

    - For more details, see MUI's migration guide: https://mui.com/material-ui/migration/v5-style-changes/#mui-styles

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

- b777136f8: Add `ContentScopeSelect` component

    This can be used as the basis for both content-driven and data-driven applications.

    **Example**

    ```tsx
    function ContentScopeControls() {
        const [value, setValue] = useState({ domain: "main", language: "en" });

        return (
            <ContentScopeSelect
                value={value}
                onChange={(value) => {
                    setValue(value);
                }}
                options={[
                    { domain: { label: "Main", value: "main" }, language: { label: "English", value: "en" } },
                    { domain: { label: "Main", value: "main" }, language: { label: "German", value: "de" } },
                    { domain: { label: "Secondary", value: "secondary" }, language: { label: "English", value: "en" } },
                    { domain: { label: "Secondary", value: "secondary" }, language: { label: "German", value: "de" } },
                ]}
            />
        );
    }
    ```

- 2486e8a91: Add future Admin Generator that works with configuration files
- 5c5500733: Remove "Re-login"-button from `CurrentUserProvider`

    The button is already implemented in `createErrorDialogApolloLink()`. The correct arrangement of
    the components in `App.tsx` (see migration guide) makes the double implementation needless.

- 3b1dc72d3: Adapt `Header` and `UserHeaderItem` used in `AppHeader` for mobile devices (<900px)

### Patch Changes

- Updated dependencies [865f253d8]
- Updated dependencies [05ce68ec0]
- Updated dependencies [51a0861d8]
- Updated dependencies [dc8bb6a99]
- Updated dependencies [803bc607f]
- Updated dependencies [54f775497]
- Updated dependencies [33ba50719]
- Updated dependencies [73140014f]
- Updated dependencies [9a4530b06]
- Updated dependencies [dc8bb6a99]
- Updated dependencies [33ba50719]
- Updated dependencies [e3efdfcc3]
- Updated dependencies [02d33e230]
- Updated dependencies [c702cc5b2]
- Updated dependencies [ad73068f4]
- Updated dependencies [6054fdcab]
- Updated dependencies [535444623]
- Updated dependencies [d0869ac82]
- Updated dependencies [9a4530b06]
- Updated dependencies [47ec528a4]
- Updated dependencies [33ba50719]
- Updated dependencies [956111ab2]
- Updated dependencies [f9615fbf4]
- Updated dependencies [19eaee4ca]
- Updated dependencies [758c65656]
- Updated dependencies [9a4530b06]
- Updated dependencies [cb544bc3e]
- Updated dependencies [04ed68cc9]
- Updated dependencies [61b2acfb2]
- Updated dependencies [0263a45fa]
- Updated dependencies [4ca4830f3]
- Updated dependencies [3397ec1b6]
- Updated dependencies [20b2bafd8]
- Updated dependencies [33ba50719]
- Updated dependencies [51a0861d8]
- Updated dependencies [9c4b7c974]
- Updated dependencies [b5753e612]
- Updated dependencies [2a7bc765c]
- Updated dependencies [774977311]
- Updated dependencies [f8114cd39]
- Updated dependencies [b87c3c292]
- Updated dependencies [f06f4bea6]
- Updated dependencies [cce88d448]
- Updated dependencies [2a7bc765c]
- Updated dependencies [b87c3c292]
- Updated dependencies [d2e64d1ec]
- Updated dependencies [865f253d8]
- Updated dependencies [f8114cd39]
- Updated dependencies [241249bd4]
- Updated dependencies [be4e6392d]
- Updated dependencies [a53545438]
- Updated dependencies [1a1d83156]
- Updated dependencies [a2f278bbd]
- Updated dependencies [66330e4e6]
- Updated dependencies [b0249e3bc]
- Updated dependencies [92eae2ba9]
- Updated dependencies [33ba50719]
    - @comet/admin@7.0.0-beta.0
    - @comet/admin-theme@7.0.0-beta.0
    - @comet/admin-date-time@7.0.0-beta.0
    - @comet/admin-rte@7.0.0-beta.0
    - @comet/blocks-admin@7.0.0-beta.0
    - @comet/admin-icons@7.0.0-beta.0

## 6.17.1

### Patch Changes

- @comet/admin@6.17.1
- @comet/admin-date-time@6.17.1
- @comet/admin-icons@6.17.1
- @comet/admin-rte@6.17.1
- @comet/admin-theme@6.17.1
- @comet/blocks-admin@6.17.1

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

### Patch Changes

- 987fe9adf: Fix `DocumentInterface.updateMutation` type

    The type for the `input` variable needs to be `DocumentOutput`, not `DocumentInput`.

- Updated dependencies [536e95c02]
- Updated dependencies [7ecc30eba]
- Updated dependencies [ec4685bf3]
    - @comet/admin@6.17.0
    - @comet/admin-date-time@6.17.0
    - @comet/admin-icons@6.17.0
    - @comet/admin-rte@6.17.0
    - @comet/admin-theme@6.17.0
    - @comet/blocks-admin@6.17.0

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
            };
        }
    }
    ```

    Users need the `translation` permission to use the translation feature.

    **Admin:**

    Wrap the section where you want to use the content translation with the `AzureAiTranslatorProvider` provider:

    ```tsx
    <AzureAiTranslatorProvider enabled={true}>{/*  ...  */}</AzureAiTranslatorProvider>
    ```

    Note: `AzureAiTranslatorProvider` automatically checks for the `translation` permission. The translation button is only shown for users with this permission.

### Patch Changes

- Updated dependencies [fb0fe2539]
- Updated dependencies [747fe32cc]
    - @comet/admin@6.16.0
    - @comet/admin-date-time@6.16.0
    - @comet/admin-icons@6.16.0
    - @comet/admin-rte@6.16.0
    - @comet/admin-theme@6.16.0
    - @comet/blocks-admin@6.16.0

## 6.15.1

### Patch Changes

- @comet/admin@6.15.1
- @comet/admin-date-time@6.15.1
- @comet/admin-icons@6.15.1
- @comet/admin-rte@6.15.1
- @comet/admin-theme@6.15.1
- @comet/blocks-admin@6.15.1

## 6.15.0

### Minor Changes

- cdc861cb7: Add `buttonChildren` and `children` props to `UserHeaderItem`

    This increases the flexibility of the `UserHeaderItem` component by allowing the `AppHeaderDropdown` label to be passed via `buttonChildren`. More buttons or other list items in the dropdown can be passed via `children`.

    **Example:**

    ```tsx
    <UserHeaderItem buttonChildren="Some custom label">
        <Button variant="contained">Some custom button</Button>
        <Button>Some custom button 2</Button>
    </UserHeaderItem>
    ```

### Patch Changes

- 0654f7bce: Handle unauthorized and unauthenticated correctly in error dialog

    The error dialog now presents screens according to the current state. Required to work in all conditions:
    - `CurrentUserProvider` must be beneath `MuiThemeProvider` and `IntlProvider` and above `RouterBrowserRouter`
    - `ErrorDialogHandler` must be parallel to `CurrentUserProvider`

- Updated dependencies [406027806]
- Updated dependencies [0654f7bce]
- Updated dependencies [ec7fb9ff2]
    - @comet/admin-icons@6.15.0
    - @comet/admin@6.15.0
    - @comet/blocks-admin@6.15.0
    - @comet/admin-date-time@6.15.0
    - @comet/admin-rte@6.15.0
    - @comet/admin-theme@6.15.0

## 6.14.1

### Patch Changes

- @comet/admin@6.14.1
- @comet/admin-date-time@6.14.1
- @comet/admin-icons@6.14.1
- @comet/admin-rte@6.14.1
- @comet/admin-theme@6.14.1
- @comet/blocks-admin@6.14.1

## 6.14.0

### Minor Changes

- 73dfb61c9: Add `PhoneLinkBlock` and `EmailLinkBlock`
- 9055ff71a: Remove label from `DamVideoBlock` file field

    This was done to streamline it with the `DamImageBlock`.

- dddb03d1b: Add capability to generate alt texts and titles for images in DAM

    You can find instructions for adding this feature to your project [in the docs](https://docs.comet-dxp.com/docs/content-generation/).

- acfcef9e4: The `documentTypes` prop of `PagesPage` now also accepts a function mapping categories to document types

    Previously, only the supported documentTypes of the current category could be passed to the `PagesPage`.
    That made it impossible to verify if a document can be moved to another category.
    If a document was moved to a category that didn't support its type, the PageTree crashed.

    If a mapping function is passed to `documentTypes`, documents can only be moved to categories that support their type.

    ```diff
    <PagesPage
    -   documentTypes={pageTreeDocumentTypes}
    +   documentTypes={(category): Record<DocumentType, DocumentInterface> => {
    +       if (category === "TopMenu") {
    +           return {
    +               Page,
    +               PredefinedPage,
    +           };
    +       }
    +
    +       return {
    +           Page,
    +           PredefinedPage,
    +           Link,
    +       };
    +   }}
        // ...
    />
    ```

- 61a43d270: Add a menu item to `PixelImageBlock`, `SvgImageBlock` and `DamVideoBlock` that opens the chosen file in the DAM

    Note: This feature only works if the `DependenciesConfig` is configured for `DamFile`:

    ```diff
    // App.tsx

    <DependenciesConfigProvider
        entityDependencyMap={{
    +       DamFile: createDamFileDependency(),
            // ...
        }}
    >
    ```

### Patch Changes

- Updated dependencies [2fc764e29]
- Updated dependencies [2de81e40b]
- Updated dependencies [efccc42a3]
- Updated dependencies [012a768ee]
    - @comet/admin@6.14.0
    - @comet/admin-theme@6.14.0
    - @comet/admin-icons@6.14.0
    - @comet/admin-date-time@6.14.0
    - @comet/admin-rte@6.14.0
    - @comet/blocks-admin@6.14.0

## 6.13.0

### Minor Changes

- c51b250ca: Add loading spinner to `IFrameViewer`

    This feature was added to inform users that the iframe is loading. It is particularly useful when loading takes a long time due to a slow network connection or a large amount of content or data. The feedback remains visible until the iframe is fully loaded and the `onLoad` event is triggered.

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

### Patch Changes

- aee7ae4a2: Use the same logic for checking the user's content scope in Admin as it is used in the API.
- Updated dependencies [5e25348bb]
- Updated dependencies [796e83206]
    - @comet/admin@6.13.0
    - @comet/admin-rte@6.13.0
    - @comet/admin-date-time@6.13.0
    - @comet/admin-icons@6.13.0
    - @comet/admin-theme@6.13.0
    - @comet/blocks-admin@6.13.0

## 6.12.0

### Minor Changes

- 3ee8c7a33: Add a `DamFileDownloadLinkBlock` that can be used to download a file or open it in a new tab

    Also, add new `/dam/files/download/:hash/:fileId/:filename` endpoint for downloading assets.

### Patch Changes

- Updated dependencies [dc7eaeccb]
- Updated dependencies [16ffa7be9]
- Updated dependencies [c06c6f1e9]
    - @comet/admin-rte@6.12.0
    - @comet/admin@6.12.0
    - @comet/admin-theme@6.12.0
    - @comet/admin-date-time@6.12.0
    - @comet/admin-icons@6.12.0
    - @comet/blocks-admin@6.12.0

## 6.11.0

### Minor Changes

- e10753b65: Allow disabling the "Open preview" button in the `PageTree` for certain document types

    The "Open preview" button is shown for all document types in the `PageTree`.
    But some document types (e.g., links) don't have a preview.
    Clicking on the preview button leads to an error page.

    Now, it's possible to disable the button by setting `hasNoSitePreview` for the document:

    ```diff
    export const Link: DocumentInterface<Pick<GQLLink, "content">, GQLLinkInput> = {
        // ...
    +   hasNoSitePreview: true,
    };
    ```

- fdf9fa7cb: Automatic Redirects are now set to false if the page is unpublished or archived

### Patch Changes

- 815ba51e7: Fix link target validation in `ExternalLinkBlock`

    Previously, two different validation checks were used.
    This resulted in an error when saving an invalid link target but no error message was shown.

- Updated dependencies [8e3dec523]
    - @comet/admin@6.11.0
    - @comet/admin-date-time@6.11.0
    - @comet/admin-icons@6.11.0
    - @comet/admin-rte@6.11.0
    - @comet/admin-theme@6.11.0
    - @comet/blocks-admin@6.11.0

## 6.10.0

### Minor Changes

- f89af8bb2: Add `disableHideInMenu` option to `createEditPageNode` to hide the "Hide in menu" checkbox
- d4a269e1e: Add `filterByFragment` to replace graphql-anywhere's `filter`

    [graphql-anywhere](https://www.npmjs.com/package/graphql-anywhere) is no longer maintained.
    However, its `filter` utility is useful for filtering data by a GraphQL document, e.g., a fragment.
    Therefore, the function was copied to `@comet/admin`.
    To migrate, replace all `filter` calls with `filterByFragment`:

    ```diff
    - import { filter } from "graphql-anywhere";
    + import { filterByFragment } from "@comet/admin";

    const initialValues: Partial<FormValues> = data?.product
        ? {
    -       ...filter<GQLProductPriceFormFragment>(productPriceFormFragment, data.product),
    +       ...filterByFragment<GQLProductPriceFormFragment>(productPriceFormFragment, data.product),
            price: String(data.product.price),
        }
        : {};
    ```

    You can then uninstall the `graphql-anywhere` package:

    ```bash
    # In admin/
    npm uninstall graphql-anywhere
    ```

- f528bc340: CronJobModule: Show logs for job run

### Patch Changes

- d340cabc2: DAM: Fix the duplicate name check when updating a file

    Previously, there were two bugs:
    1. In the `EditFile` form, the `folderId` wasn't passed to the mutation
    2. In `FilesService#updateByEntity`, the duplicate check was always done against the root folder if no `folderId` was passed

    This caused an error when saving a file in any folder if there was another file with the same name in the root folder.
    And it was theoretically possible to create two files with the same name in one folder (though this was still prevented by admin-side validation).

- Updated dependencies [a8a098a24]
- Updated dependencies [d4a269e1e]
- Updated dependencies [52130afba]
- Updated dependencies [e938254bf]
    - @comet/admin@6.10.0
    - @comet/admin-date-time@6.10.0
    - @comet/admin-icons@6.10.0
    - @comet/admin-rte@6.10.0
    - @comet/admin-theme@6.10.0
    - @comet/blocks-admin@6.10.0

## 6.9.0

### Minor Changes

- e85837a17: Loosen peer dependency on `react-intl` to allow using v6

### Patch Changes

- Updated dependencies [9ff9d66c6]
- Updated dependencies [8fb8b209a]
- Updated dependencies [e85837a17]
    - @comet/admin@6.9.0
    - @comet/admin-rte@6.9.0
    - @comet/admin-date-time@6.9.0
    - @comet/blocks-admin@6.9.0
    - @comet/admin-icons@6.9.0
    - @comet/admin-theme@6.9.0

## 6.8.0

### Patch Changes

- c1ca9c335: Don't remove references to `DamFile` from blocks when copying a document from one scope to another if DAM scoping is not enabled
- Updated dependencies [90c6f192e]
- Updated dependencies [90c6f192e]
    - @comet/blocks-admin@6.8.0
    - @comet/admin@6.8.0
    - @comet/admin-date-time@6.8.0
    - @comet/admin-icons@6.8.0
    - @comet/admin-rte@6.8.0
    - @comet/admin-theme@6.8.0

## 6.7.0

### Patch Changes

- 2db3bc855: Fix `CurrentUserInterface` type

    Add missing `id` field, make `name`, `email`, and `language` required.
    - @comet/admin@6.7.0
    - @comet/admin-date-time@6.7.0
    - @comet/admin-icons@6.7.0
    - @comet/admin-rte@6.7.0
    - @comet/admin-theme@6.7.0
    - @comet/blocks-admin@6.7.0

## 6.6.2

### Patch Changes

- 0758d2339: Hide the "Dependents" tab in the DAM if the `DependenciesConfigProvider` is not configured

    Previously, the tab was always shown, even if the feature wasn't configured. Though it didn't cause an error, the tab showed no valuable information.

    Now, we hide the tab if no configuration is passed via the `DependenciesConfigProvider`.
    - @comet/admin@6.6.2
    - @comet/admin-date-time@6.6.2
    - @comet/admin-icons@6.6.2
    - @comet/admin-rte@6.6.2
    - @comet/admin-theme@6.6.2
    - @comet/blocks-admin@6.6.2

## 6.6.1

### Patch Changes

- @comet/admin@6.6.1
- @comet/admin-date-time@6.6.1
- @comet/admin-icons@6.6.1
- @comet/admin-rte@6.6.1
- @comet/admin-theme@6.6.1
- @comet/blocks-admin@6.6.1

## 6.6.0

### Patch Changes

- c76666503: Make headers in `includeInvisibleContentContext` overridable in query

    You can now override the headers `x-include-invisible-content` and `x-preview-dam-urls` in your query like this:

    ```tsx
    const { loading, data, error } = useQuery(exampleQuery, {
        // ...
        context: {
            headers: {
                "x-include-invisible-content": [],
                "x-preview-dam-urls": 0,
            },
        },
    });
    ```

- Updated dependencies [95b97d768]
- Updated dependencies [a65679ba3]
- Updated dependencies [6b04ac9a4]
    - @comet/admin@6.6.0
    - @comet/blocks-admin@6.6.0
    - @comet/admin-date-time@6.6.0
    - @comet/admin-icons@6.6.0
    - @comet/admin-rte@6.6.0
    - @comet/admin-theme@6.6.0

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
- Updated dependencies [6cb2f9046]
    - @comet/blocks-admin@6.5.0
    - @comet/admin@6.5.0
    - @comet/admin-date-time@6.5.0
    - @comet/admin-icons@6.5.0
    - @comet/admin-rte@6.5.0
    - @comet/admin-theme@6.5.0

## 6.4.0

### Minor Changes

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

- 322da3831: Add `DependencyInterface`

    The `DependencyInterface` must be implemented for entities to be displayed correctly in the `DependencyList`.
    The implementation must then be passed to the `DependenciesConfigProvider`.

    You can use one of the helper methods to implement the `resolvePath()` method required by `DependencyInterface`:
    - `createDocumentDependencyMethods()` for documents
    - `createDependencyMethods()` for all other entities

    You can find more information in [the docs](https://docs.comet-dxp.com/docs/dependencies/).

- 322da3831: Add `DependencyList` that can be used to display the dependencies of an entity in the admin

    The `DependencyList` is intended to be used in `Tabs` (as done in the DAM).

### Patch Changes

- f6c972e59: Correctly evaluate the `language`-field of the `CurrentUser`-object
- 811903e60: Disable the content translation feature for input fields where it doesn't make sense
- 0efae68ff: Prevent XSS attacks in `isLinkTarget()` validator
- Updated dependencies [30d9e0dee]
- Updated dependencies [811903e60]
- Updated dependencies [8ce21f34b]
- Updated dependencies [322da3831]
- Updated dependencies [811903e60]
- Updated dependencies [887365c76]
    - @comet/blocks-admin@6.4.0
    - @comet/admin@6.4.0
    - @comet/admin-date-time@6.4.0
    - @comet/admin-icons@6.4.0
    - @comet/admin-rte@6.4.0
    - @comet/admin-theme@6.4.0

## 6.3.0

### Minor Changes

- 80e6fde4: Show DAM import source in grid

    To show the "Source" column in the DAM's data grid, provide `importSources` in `DamConfigProvider`:

    ```tsx
    <DamConfigProvider
        value={{
            ...
            importSources: {
                unsplash: {
                    label: <FormattedMessage id="dam.importSource.unsplash.label" defaultMessage="Unsplash" />,
                },
            },
        }}
    >
        ...
    </DamConfigProvider>
    ```

### Patch Changes

- @comet/admin@6.3.0
- @comet/admin-date-time@6.3.0
- @comet/admin-icons@6.3.0
- @comet/admin-rte@6.3.0
- @comet/admin-theme@6.3.0
- @comet/blocks-admin@6.3.0

## 6.2.1

### Patch Changes

- @comet/admin@6.2.1
- @comet/admin-date-time@6.2.1
- @comet/admin-icons@6.2.1
- @comet/admin-rte@6.2.1
- @comet/admin-theme@6.2.1
- @comet/blocks-admin@6.2.1

## 6.2.0

### Minor Changes

- 75865caa: Deprecate `isHref` validator, `IsHref` decorator and `IsHrefConstraint` class.

    New versions `isLinkTarget`, `IsLinkTarget` and `IsLinkTargetConstraint` are added as replacement.

### Patch Changes

- ad153c99: Add the `x-preview-dam-urls` header to our axios client

    Now the axios client always requests preview DAM urls just like the GraphQL client.

- 5dfe4839: Prevent the document editor from losing its state when (re)gaining focus

    In v6.1.0 a loading indicator was added to the document editor (in `PagesPage`).
    This had an unwanted side effect: Focusing the edit page automatically causes a GraphQL request to check for a newer version of the document. This request also caused the loading indicator to render, thus unmounting the editor (`EditComponent`). Consequently, the local state of the editor was lost.
    - @comet/admin@6.2.0
    - @comet/admin-date-time@6.2.0
    - @comet/admin-icons@6.2.0
    - @comet/admin-rte@6.2.0
    - @comet/admin-theme@6.2.0
    - @comet/blocks-admin@6.2.0

## 6.1.0

### Patch Changes

- 7ea5f61f: Use `useCurrentUser` hook where possible
- 693cbdb4: Add loading state for edit `StackPage` in `PagesPage`

    Prevents flash of "Document not found" error message when reloading the page editor

- Updated dependencies [dcfa03ca]
- Updated dependencies [08e0da09]
- Updated dependencies [b35bb8d1]
- Updated dependencies [f1fc9e20]
- Updated dependencies [8eb13750]
- Updated dependencies [a4fac913]
    - @comet/admin@6.1.0
    - @comet/admin-icons@6.1.0
    - @comet/admin-rte@6.1.0
    - @comet/admin-theme@6.1.0
    - @comet/admin-date-time@6.1.0
    - @comet/blocks-admin@6.1.0

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

- d86d5a90: Make sites config generic

    The sites config was previously assumed to be `Record<string, SiteConfg>`.
    However, as the sites config is solely used in application code, it could be of any shape.
    Therefore, the `SitesConfigProvider` and `useSitesConfig` are made generic.
    The following changes have to be made in the application:
    1.  Define the type of your sites config

        Preferably this should be done in `config.ts`:

        ```diff
        export function createConfig() {
            // ...

            return {
                ...cometConfig,
                apiUrl: environmentVariables.API_URL,
                adminUrl: environmentVariables.ADMIN_URL,
        +       sitesConfig: JSON.parse(environmentVariables.SITES_CONFIG) as SitesConfig,
            };
        }

        + export type SitesConfig = Record<string, SiteConfig>;
        ```

    2.  Use the type when using `useSitesConfig`

        ```diff
        - const sitesConfig = useSitesConfig();
        + const sitesConfig = useSitesConfig<SitesConfig>();
        ```

    3.  Optional: Remove type annotation from `ContentScopeProvider#resolveSiteConfigForScope` (as it's now inferred)

        ```diff
        - resolveSiteConfigForScope: (configs: Record<string, SiteConfig>, scope: ContentScope) => configs[scope.domain],
        + resolveSiteConfigForScope: (configs, scope: ContentScope) => configs[scope.domain],
        ```

### Minor Changes

- 0f814c5e: Add `MasterMenu` and `MasterMenuRoutes` components which both take a single data structure to define menu and routes.

### Patch Changes

- Updated dependencies [921f6378]
- Updated dependencies [76e50aa8]
- Updated dependencies [298b63b7]
- Updated dependencies [803f5045]
- Updated dependencies [a525766c]
- Updated dependencies [0d768540]
- Updated dependencies [62779124]
    - @comet/admin@6.0.0
    - @comet/admin-icons@6.0.0
    - @comet/admin-rte@6.0.0
    - @comet/admin-date-time@6.0.0
    - @comet/blocks-admin@6.0.0
    - @comet/admin-theme@6.0.0

## 5.6.0

### Minor Changes

- fe26a6e6: Show an error message when trying to edit a non-existing document and when trying to edit an archived document
- 3ee4ce09: Return newly uploaded items from `useDamFileUpload#uploadFiles`

### Patch Changes

- Updated dependencies [fb6c8063]
- Updated dependencies [76f85abe]
    - @comet/admin-theme@5.6.0
    - @comet/blocks-admin@5.6.0
    - @comet/admin@5.6.0
    - @comet/admin-date-time@5.6.0
    - @comet/admin-icons@5.6.0
    - @comet/admin-rte@5.6.0

## 5.5.0

### Patch Changes

- 1b37b1f6: Show `additionalToolbarItems` in `ChooseFileDialog`

    The `additionalToolbarItems` were only shown inside the `DamPage`, but not in the `ChooseFileDialog`.
    To fix this, use the `additionalToolbarItems` option in `DamConfigProvider`.
    The `additionalToolbarItems` prop of `DamPage` has been deprecated in favor of this option.

    **Previously:**

    ```tsx
    <DamPage
        // ...
        additionalToolbarItems={<ImportFromExternalDam />}
    />
    ```

    **Now:**

    ```tsx
    <DamConfigProvider
        value={{
            // ...
            additionalToolbarItems: <ImportFromExternalDam />,
        }}
    >
        {/*...*/}
    </DamConfigProvider>
    ```

- 85aa962c: Set unhandled dependencies to `undefined` when copying documents to another scope

    This prevents leaks between scopes. In practice, this mostly concerns links to documents that don't exist in the target scope.

    **Example:**
    - Page A links to Page B
    - Page A is copied from Scope A to Scope B
    - Link to Page B is removed from Page A by replacing the `id` with `undefined` (since Page B doesn't exist in Scope B)

    **Note:** The link is only retained if both pages are copied in the same operation.

- c4639be5: Clip crop values when cropping an image in the DAM or `PixelImageBlock`

    Previously, negative values could occur, causing the image proxy to fail on delivery.
    - @comet/admin@5.5.0
    - @comet/admin-date-time@5.5.0
    - @comet/admin-icons@5.5.0
    - @comet/admin-rte@5.5.0
    - @comet/admin-theme@5.5.0
    - @comet/blocks-admin@5.5.0

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

- 51d6c2b9: Move soft-hyphen functionality to `@comet/admin-rte`

    This allows using the soft-hyphen functionality in plain RTEs, and not only in `RichTextBlock`

    ```tsx
    const [useRteApi] = makeRteApi();

    export default function MyRte() {
        const { editorState, setEditorState } = useRteApi();
        return (
            <Rte
                value={editorState}
                onChange={setEditorState}
                options={{
                    supports: [
                        // Soft Hyphen
                        "soft-hyphen",
                        // Other options you may wish to support
                        "bold",
                        "italic",
                    ],
                }}
            />
        );
    }
    ```

- dcaf750d: Make all DAM license fields optional if `LicenseType` is `ROYALTY_FREE` even if `requireLicense` is true in `DamConfig`

### Patch Changes

- 087cb01d: Enable copying documents from one `PageTree` category to another (e.g. from "Main navigation" to "Top menu" in Demo)
- Updated dependencies [ba800163]
- Updated dependencies [981bf48c]
- Updated dependencies [60a18392]
- Updated dependencies [51d6c2b9]
    - @comet/admin@5.4.0
    - @comet/admin-rte@5.4.0
    - @comet/admin-date-time@5.4.0
    - @comet/admin-icons@5.4.0
    - @comet/admin-theme@5.4.0
    - @comet/blocks-admin@5.4.0

## 5.3.0

### Patch Changes

- 0fdf4eaf: Always use the `/preview` file URLs in the admin application

    This is achieved by setting the `x-preview-dam-urls` in the `includeInvisibleContentContext`.

    This fixes a page copy bug where all files were downloaded and uploaded again, even when copying within the same environment.

- Updated dependencies [0ff9b9ba]
- Updated dependencies [0ff9b9ba]
- Updated dependencies [a677a162]
- Updated dependencies [60cc1b2a]
- Updated dependencies [5435b278]
- Updated dependencies [a2273887]
    - @comet/admin-icons@5.3.0
    - @comet/admin@5.3.0
    - @comet/blocks-admin@5.3.0
    - @comet/admin-date-time@5.3.0
    - @comet/admin-rte@5.3.0
    - @comet/admin-theme@5.3.0

## 5.2.0

### Minor Changes

- 0bed4e7c: Improve the `SaveConflictDialog`
    - extend the text in the dialog to explain
        - what happened
        - what the next steps are
        - what can be done to avoid conflicts
    - make the button labels more precise
    - once the save dialog is closed
        - stop polling
        - mark the save button red and with an error icon

- 0bed4e7c: `useSaveConflict()`, `useSaveConflictQuery()` and `useFormSaveConflict()` now return a `hasConflict` prop

    If `hasConflict` is true, a save conflict has been detected.
    You should pass `hasConflict` on to `SaveButton`, `FinalFormSaveButton` or `FinalFormSaveSplitButton`. The button will then display a "conflict" state.

- 0bed4e7c: Admin Generator: In the generated form, the `hasConflict` prop is passed from the `useFormSaveConflict()` hook to the `FinalFormSaveSplitButton`
- 6fda5a53: CRUD Generator: Change the file ending of the private sibling GraphQL files from `.gql.tsx` to `.gql.ts`

    The GraphQL files do not contain JSX.
    Regenerate the files to apply this change to a project.

### Patch Changes

- Updated dependencies [25daac07]
- Updated dependencies [0bed4e7c]
- Updated dependencies [9fc7d474]
- Updated dependencies [3702bb23]
- Updated dependencies [824ea66a]
    - @comet/admin@5.2.0
    - @comet/admin-icons@5.2.0
    - @comet/blocks-admin@5.2.0
    - @comet/admin-date-time@5.2.0
    - @comet/admin-rte@5.2.0
    - @comet/admin-theme@5.2.0

## 5.1.0

### Patch Changes

- e1d3f007: Prevent false positive save conflicts while editing documents (e.g. `Page`):
    - Stop checking for conflicts while saving is in progress
    - Ensure that all "CheckForChanges" polls are cleared

- 6d69dfac: Fix issue in PixelImageBlock that caused the preview URLs for files without a file extension in their filename to be invalid
- 21c30931: Improved the EditPageNode dialog ("Page Properties" dialog):
    - Execute the asynchronous slug validation less often (increased the debounce wait time from 200ms to 500ms)
    - Cache the slug validation results. Evict the cache on the initial render of the dialog

- Updated dependencies [21c30931]
- Updated dependencies [93b3d971]
- Updated dependencies [e33cd652]
    - @comet/admin@5.1.0
    - @comet/admin-date-time@5.1.0
    - @comet/admin-icons@5.1.0
    - @comet/admin-rte@5.1.0
    - @comet/admin-theme@5.1.0
    - @comet/blocks-admin@5.1.0

## 5.0.0

### Major Changes

- 9d3e8555: Add scoping to the DAM

    The DAM scoping can be enabled optionally. You can still use the DAM without scoping.

    To enable DAM scoping, you must

    In the API:
    - Create a DAM folder entity using `createFolderEntity({ Scope: DamScope });`
    - Create a DAM file entity using `createFileEntity({ Scope: DamScope, Folder: DamFolder });`
    - Pass the `Scope` DTO and the `File` and `Folder` entities when initializing the `DamModule`

    In the Admin:
    - Set `scopeParts` in the `DamConfigProvider` (e.g. `<DamConfigProvider value={{ scopeParts: ["domain"] }}>`)
    - Render the content scope indicator in the `DamPage`
        ```tsx
        <DamPage renderContentScopeIndicator={(scope) => <ContentScopeIndicator scope={scope} />} />
        ```

    You can access the current DAM scope in the Admin using the `useDamScope()` hook.

    See the [Demo project](https://github.com/vivid-planet/comet/pull/976) for an example on how to enable DAM scoping.

- 9875e7d4: Support automatically importing DAM files into another scope when copying documents from one scope to another

    The copy process was reworked:
    - The `DocumentInterface` now requires a `dependencies()` and a `replaceDependenciesInOutput()` method
    - The `BlockInterface` now has an optional `dependencies()` and a required `replaceDependenciesInOutput()` method
    - `rewriteInternalLinks()` was removed from `@comet/cms-admin`. Its functionality is replaced by `replaceDependenciesInOutput()`.

    `dependencies()` returns information about dependencies of a document or block (e.g. a used `DamFile` or linked `PageTreeNode`). `replaceDependenciesInOutput()` replaces the IDs of all dependencies of a document or block with new IDs (necessary for copying documents or blocks to another scope).

    You can use the new `createDocumentRootBlocksMethods()` to generate the methods for documents.

- c3f96d7d: Don't remember the last folder or file the user opened in the DAM. The `ChooseFileDialog` still remembers the last folder opened.

### Minor Changes

- 168380d9: Add Admin CRUD Generator that creates a simple CRUD admin view for an entity

    It automatically generates an admin page, grid and form based on the GraphQL schema definition of an object type.
    It's meant to be used together with the existing API CRUD Generator.
    Go through [the commits of this PR](https://github.com/vivid-planet/comet/pull/1294/files) for a step-by-step example of how to use the API and Admin Generators.

- 8ed96981: Support copy/pasting DAM files across server instances by downloading the copied file
- adb5bc34: Add `queryUpdatedAt()` helper that can be used to check conflicts without having to write an additional query
- 6b9787e6: It's now possible to opt-out of creating a redirect when changing the slug of a page. Previously, a redirect was always created.
- e6b8ec60: Show a bigger version of an image when hovering over an image thumbnail in the DAM and `ChooseFileDialog`
- 5bae9ab3: Show `LinearProgress` instead of `CircularProgress` when polling after initially loading the PageTree
- 47a7272c: Add `requireLicense` option to `DamConfig` to allow making DAM license fields required (when updating a file)
- e26bd900: Add various UI/UX improvements to the DAM
    - Replace underlying `Table` with `DataGrid`
    - Add paging to improve performance
    - Add a dialog to move files to another folder (instead of drag and drop)
    - Highlight newly uploaded files
    - Add a new footer to execute bulk actions
    - Add a "More Actions" dropdown above the `DataGrid` to execute bulk actions

- a6734760: Add new `createDocumentRootBlocksMethods()` helper for creating methods needed by DocumentInterface

    It automatically adds `inputToOutput()`, `anchors()`, `dependencies()` and `replaceDependenciesInOutput()` to a document.

    You can see how it can be used [in the COMET Demo project](https://github.com/vivid-planet/comet/blob/a673476017fa35efb6361877d0fcf2b0c8231439/demo/admin/src/pages/Page.tsx#L57-L60).

- f25eccf0: Add a hover preview for images to the DAM
- e57c6c66: Move dashboard components from the COMET Starter to the library (`DashboardHeader`, `LatestBuildsDashboardWidget`, `LatestContentUpdatesDashboardWidget`)
- 2d0f320c: Add `useFormSaveConflict()` hook to check for save conflicts in forms

### Patch Changes

- 564f66d3: Allow `:`, `?`, `=` and `&` in redirect source paths
- c0e03edc: Add a progress dialog to the `PageTree` when pasting pages
- 49e85432: Show a button to re-login when API responses with 401 - Not Authenticated instead of a plain error message.
- Updated dependencies [0453c36a]
- Updated dependencies [692c8555]
- Updated dependencies [2559ff74]
- Updated dependencies [fe5e0735]
- Updated dependencies [ed692f50]
- Updated dependencies [987f08b3]
- Updated dependencies [d0773a1a]
- Updated dependencies [4fe08312]
- Updated dependencies [5f0f8e6e]
- Updated dependencies [7c6eb68e]
- Updated dependencies [9875e7d4]
- Updated dependencies [d4bcab04]
- Updated dependencies [0f2794e7]
- Updated dependencies [80b007ae]
- Updated dependencies [a7116784]
- Updated dependencies [a7116784]
- Updated dependencies [e57c6c66]
    - @comet/admin@5.0.0
    - @comet/admin-icons@5.0.0
    - @comet/blocks-admin@5.0.0
    - @comet/admin-date-time@5.0.0
    - @comet/admin-rte@5.0.0
    - @comet/admin-theme@5.0.0

## 4.7.0

### Minor Changes

- dbdc0f55: Add support for non-breaking spaces to RTE

    Add `"non-breaking-space"` to `supports` when creating an RTE:

    ```tsx
    const [useRteApi] = makeRteApi();

    export default function MyRte() {
        const { editorState, setEditorState } = useRteApi();
        return (
            <Rte
                value={editorState}
                onChange={setEditorState}
                options={{
                    supports: [
                        // Non-breaking space
                        "non-breaking-space",
                        // Other options you may wish to support
                        "bold",
                        "italic",
                    ],
                }}
            />
        );
    }
    ```

- 17f977aa: Add the possibility to search for a path in PageSearch

### Patch Changes

- Updated dependencies [d1c7a1c5]
- Updated dependencies [dbdc0f55]
- Updated dependencies [eac9990b]
- Updated dependencies [fe310df8]
- Updated dependencies [fde8e42b]
- Updated dependencies [f48a768c]
    - @comet/admin-theme@4.7.0
    - @comet/admin-icons@4.7.0
    - @comet/admin-rte@4.7.0
    - @comet/admin@4.7.0
    - @comet/blocks-admin@4.7.0
    - @comet/admin-date-time@4.7.0

## 4.6.0

### Patch Changes

- c3b7f992: Replace current icons in the RTE toolbar with new icons from `@comet/admin-icons`
- Updated dependencies [c3b7f992]
- Updated dependencies [c3b7f992]
- Updated dependencies [031d86eb]
- Updated dependencies [c3b7f992]
    - @comet/admin-rte@4.6.0
    - @comet/admin-icons@4.6.0
    - @comet/blocks-admin@4.6.0
    - @comet/admin@4.6.0
    - @comet/admin-date-time@4.6.0
    - @comet/admin-theme@4.6.0

## 4.5.0

### Patch Changes

- 8a2c3302: Correctly position loading indicators by centring them using the new `Loading` component
- Updated dependencies [46cf5a8b]
- Updated dependencies [8a2c3302]
- Updated dependencies [6d4ca5bf]
- Updated dependencies [07d921d2]
- Updated dependencies [01677075]
    - @comet/admin@4.5.0
    - @comet/admin-theme@4.5.0
    - @comet/admin-date-time@4.5.0
    - @comet/admin-icons@4.5.0
    - @comet/admin-rte@4.5.0
    - @comet/blocks-admin@4.5.0

## 4.4.3

### Patch Changes

- 0d2a2b96: Ignore empty labels for publisher
    - @comet/admin@4.4.3
    - @comet/admin-date-time@4.4.3
    - @comet/admin-icons@4.4.3
    - @comet/admin-rte@4.4.3
    - @comet/admin-theme@4.4.3
    - @comet/blocks-admin@4.4.3

## 4.4.2

### Patch Changes

- b299375f: Fix the typing of `lastUpdatedAt` in the `createUsePage()` factory
    - @comet/admin@4.4.2
    - @comet/admin-date-time@4.4.2
    - @comet/admin-icons@4.4.2
    - @comet/admin-rte@4.4.2
    - @comet/admin-theme@4.4.2
    - @comet/blocks-admin@4.4.2

## 4.4.1

### Patch Changes

- Updated dependencies [662abcc9]
    - @comet/admin@4.4.1
    - @comet/admin-date-time@4.4.1
    - @comet/admin-icons@4.4.1
    - @comet/admin-rte@4.4.1
    - @comet/admin-theme@4.4.1
    - @comet/blocks-admin@4.4.1

## 4.4.0

### Minor Changes

- 9b1a6507: Silence polling errors in page tree

    Errors during polling (pages query, check for changes query) led to multiple consecutive error dialogs, which were irritating for our users. As these errors occurred randomly and would typically be resolved by the next poll, we decided to silence them altogether.

- a77da844: Add little helper for mui grid pagination (muiGridPagingToGql)

    Sample usage:

    ```
    const { data, loading, error } = useQuery<GQLProductsListQuery, GQLProductsListQueryVariables>(productsQuery, {
        variables: {
            ...muiGridFilterToGql(columns, dataGridProps.filterModel),
            ...muiGridPagingToGql({ page: dataGridProps.page, pageSize: dataGridProps.pageSize }),
            sort: muiGridSortToGql(sortModel),
        },
    });
    ```

### Patch Changes

- 11583624: Add content validation for SVG files to prevent the upload of SVGs containing JavaScript
- Updated dependencies [e824ffa6]
- Updated dependencies [d4960b05]
- Updated dependencies [3e15b819]
- Updated dependencies [a77da844]
    - @comet/admin@4.4.0
    - @comet/blocks-admin@4.4.0
    - @comet/admin-date-time@4.4.0
    - @comet/admin-icons@4.4.0
    - @comet/admin-rte@4.4.0
    - @comet/admin-theme@4.4.0

## 4.3.0

### Minor Changes

- afc7a6b6: Add human readable label for publisher (cron jobs and jobs)
- c302bc46: Admin: AboutModal: make logo configurable

### Patch Changes

- c725984f: Disable the DAM license feature per default.

    The form fields to add license information to assets are now hidden per default. License warnings are not shown per default.
    Setting the `enableLicenseFeature` option via the DamConfigProvider is now necessary to show the license fields and warnings.

- Updated dependencies [3dc5f55a]
- Updated dependencies [865cc5cf]
    - @comet/admin-rte@4.3.0
    - @comet/admin@4.3.0
    - @comet/admin-date-time@4.3.0
    - @comet/admin-icons@4.3.0
    - @comet/admin-theme@4.3.0
    - @comet/blocks-admin@4.3.0

## 4.2.0

### Minor Changes

- 7b7b786e: Add support to search values in content scope controls. Add `searchable: true` to a control's config to make it searchable. See [ContentScopeProvider](demo/admin/src/common/ContentScopeProvider.tsx) for an example

### Patch Changes

- b4d564b6: Add spacing by default between the tabs and the tab content when using `AdminTabs` or `BlockPreviewWithTabs`. This may add unwanted additional spacing in cases where the spacing was added manually.
- Updated dependencies [67e54a82]
- Updated dependencies [3567533e]
- Updated dependencies [7b614c13]
- Updated dependencies [aaf1586c]
- Updated dependencies [b4d564b6]
- Updated dependencies [d25a7cbb]
- Updated dependencies [0f4ed6c1]
    - @comet/admin-theme@4.2.0
    - @comet/admin@4.2.0
    - @comet/blocks-admin@4.2.0
    - @comet/admin-date-time@4.2.0
    - @comet/admin-icons@4.2.0
    - @comet/admin-rte@4.2.0

## 4.1.0

### Patch Changes

- 51466b1a: Fix DAM path display
- Updated dependencies [51466b1a]
- Updated dependencies [51466b1a]
- Updated dependencies [51466b1a]
- Updated dependencies [51466b1a]
- Updated dependencies [51466b1a]
- Updated dependencies [51466b1a]
- Updated dependencies [c5f2f918]
    - @comet/admin@4.1.0
    - @comet/admin-icons@4.1.0
    - @comet/admin-date-time@4.1.0
    - @comet/admin-rte@4.1.0
    - @comet/admin-theme@4.1.0
    - @comet/blocks-admin@4.1.0
