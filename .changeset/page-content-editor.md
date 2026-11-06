---
"@dextinity/cms-admin": major
---

Add `PageContentEditor`, the editor of a page's document in the `EditLayout` of `@dextinity/ui`

It shows the page's name, status and path with the save state and "Save" in a compact `PageHeader`, the live block preview on the left, and the editor's tabs in a panel on the right.
Each tab is a route below the editor's URL, so blocks can open nested routes and tabs can be deep-linked.
"More actions" offers the site preview, copying the page's address and translating the content.
Before leaving with unsaved changes, a `ConfirmDialog` asks to save or discard them.

```tsx
const pageApi = usePage({ pageId: id });

<PageContentEditor
    pageId={id}
    pageApi={pageApi}
    previewApi={previewApi}
    preview={{ url: `${siteConfig.blockPreviewBaseUrl}/page`, state: previewState, siteUrl }}
    tabs={[
        {
            key: "content",
            label: intl.formatMessage({ id: "pages.blocks", defaultMessage: "Blocks" }),
            invalid: pageApi.rootBlocksValidity.content === false,
            content: <BlockAdminComponentRoot>{pageApi.rootBlocksApi.content.adminUI}</BlockAdminComponentRoot>,
        },
        { key: "config", label: intl.formatMessage({ id: "pages.seo", defaultMessage: "SEO" }), content: pageApi.rootBlocksApi.seo.adminUI },
    ]}
/>;
```

Also add:

- `UnsavedChangesPrompt`, which asks to save or discard unsaved changes in a `ConfirmDialog` of `@dextinity/ui` before leaving an editor
- `useRouterLinkClick`, which navigates with the router when a link of `@dextinity/ui` is clicked, but keeps modifier clicks
- `usePageName`, the name and path of a page as text

**Breaking change**

`handleSavePage` of the `createUsePage` hook resolves `true` when the page was saved and `false` otherwise.
A failed save no longer marks the changes as saved.
