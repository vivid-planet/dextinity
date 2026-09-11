---
title: Content Visibility
---

Dextinity has a built-in content visibility system that controls which content is served to different consumers. Pages in the page tree have a **visibility state**, and individual blocks inside documents can be toggled **visible or invisible**. The API uses the `x-include-invisible-content` HTTP header to decide what content to include in responses.

## Page Tree Node Visibility

Every page tree node has a visibility state, which is one of:

| State           | Description                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| **Published**   | The page is live and visible to site visitors.                              |
| **Unpublished** | The page is not yet ready for visitors. Only visible in the admin and preview. |
| **Archived**    | The page has been retired. Only visible in the admin and preview.           |

New pages default to **Unpublished**. Editors can change the visibility state in the admin UI through the page tree context menu.

:::info

The home page cannot be set to Unpublished or Archived.

:::


## Block Visibility

Several block factories — including `createBlocksBlock`, `createListBlock`, `createOneOfBlock`, and `createOptionalBlock` — support a per-block **visible** toggle. When a block is marked invisible, it is hidden from site visitors but still visible to editors in the admin UI.

This lets editors prepare content ahead of time or temporarily hide a block without deleting it.

The "Show only visible blocks" toggle in the [block preview menu bar](/docs/features-modules/preview#menuBarButtons) lets editors switch between viewing all blocks and viewing only visible blocks.

## The `x-include-invisible-content` Header

The `x-include-invisible-content` HTTP header tells the API which invisible content to include in its response. It accepts a comma-separated list of entries:

| Entry               | Effect                                                      |
| ------------------- | ----------------------------------------------------------- |
| `Pages:Unpublished` | Include page tree nodes with visibility state "Unpublished" |
| `Pages:Archived`    | Include page tree nodes with visibility state "Archived"    |
| `Blocks:Invisible`  | Include blocks that are marked as invisible                 |

**Example:**

```
x-include-invisible-content: Pages:Unpublished,Pages:Archived,Blocks:Invisible
```

When the header is **absent**, only published pages and visible blocks are returned — this is the default behavior for the public site.

### Authentication Requirement

When the `x-include-invisible-content` header is present, the API **requires authentication** — even on endpoints that would normally be public (decorated with `@DisableDextinityGuards()`). This ensures that invisible content is never accidentally exposed to unauthenticated users.

## How Each Layer Uses the Header

### Admin

The admin UI **always** sends the full header on every request so that editors can see all content regardless of its visibility state:

```typescript
const headers = {
    "x-include-invisible-content": "Pages:Unpublished,Pages:Archived,Blocks:Invisible",
};
```

This is configured automatically by the built-in Apollo link (`includeInvisibleContentContext`) and the HTTP client.

:::note

Since the API always returns all content to the admin, visibility filtering is performed **client-side**. Archived pages are hidden from the page tree by default and can be shown using the "Archived items" toggle. Similarly, the "Show only visible blocks" toggle in the block preview controls whether invisible blocks are displayed.

:::

### Site (Public)

The public site does **not** send the header. All API requests return only published pages and visible blocks — no additional configuration is needed.

### Site Preview

The site preview mode allows editors to see content that is not yet live. The admin generates a signed JWT containing preview parameters, which the site converts into the appropriate header values.

**Unpublished pages are always included in preview mode.** Whenever preview data is present (i.e., the site is in draft/preview mode), `Pages:Unpublished` is sent unconditionally. This ensures editors can always navigate to and preview unpublished pages without any extra configuration.

The **visibility toggle** ("Show only visible") in the `SitePreview` component controls **only block visibility**. When the toggle is off (showing all content), `Blocks:Invisible` is added to the header so that hidden blocks are also rendered in the preview. When the toggle is on, only visible blocks are shown — but unpublished pages remain accessible.

```typescript
// From @dextinity/site-react — convertPreviewDataToHeaders
const includeInvisiblePages = !!previewData; // Always true when in preview mode
const includeInvisibleBlocks = previewData && previewData.includeInvisible; // Controlled by the toggle
```

## Using the Header in Custom Resolvers

If you write custom GraphQL resolvers that have their own visibility logic, use the `@RequestContext()` decorator to respect the header. For example, a news resolver with a `visible` boolean column:

```typescript title="news.resolver.ts"
import { RequestContext, RequestContextInterface } from "@dextinity/cms-api";

@Resolver(() => News)
export class NewsResolver {
    constructor(private readonly newsRepository: EntityRepository<News>) {}

    @Query(() => [News])
    async newsList(
        @RequestContext() { includeInvisiblePages }: RequestContextInterface,
    ): Promise<News[]> {
        if (includeInvisiblePages) {
            return this.newsRepository.findAll();
        }

        return this.newsRepository.find({ visible: true });
    }
}
```

This ensures site visitors only see visible news items while authenticated admin users can access all items regardless of their visibility state.


## How Block Visibility Works Internally

Block factories like `createBlocksBlock`, `createListBlock`, and `createOneOfBlock` check the `includeInvisibleContent` flag in the block context during transformation:

- **`createBlocksBlock`**: Each block in the list has a `visible` property. When `includeInvisibleContent` is `false`, invisible blocks return empty props, effectively hiding their content.
- **`createOneOfBlock`**: Inactive (non-selected) attached blocks are only included when `includeInvisibleContent` is `true`.
- **`createListBlock`** and **`createOptionalBlock`**: Follow the same pattern, filtering invisible items from the output.

The `BlocksTransformerService` reads the header and passes `includeInvisibleContent` through the `BlockContext` to all block transformations automatically.

## Summary

| Consumer                        | Header sent                                          | Pages returned                         | Blocks returned     |
| ------------------------------- | ---------------------------------------------------- | -------------------------------------- | ------------------- |
| Public site                     | _(none)_                                             | Published only                         | Visible only        |
| Site preview (toggle on)        | `Pages:Unpublished`                                  | Published + Unpublished                | Visible only        |
| Site preview (toggle off)       | `Pages:Unpublished,Blocks:Invisible`                 | Published + Unpublished                | Visible + Invisible |
| Admin                           | `Pages:Unpublished,Pages:Archived,Blocks:Invisible`  | All (Published, Unpublished, Archived) | All (Visible + Invisible) |
