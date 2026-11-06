---
"@dextinity/cms-admin": minor
---

Add copy, paste, duplicate, move to another category, translate and delete to `PageTreeDetailPage`

The menu of the selected page offers them all; the bulk action bar copies, translates and deletes the checked pages. Copy and paste also work with the keyboard in the tree: <kbd>Mod+C</kbd> copies the checked pages, or the focused one, with their subpages; <kbd>Mod+V</kbd> pastes them as subpages of the focused page and <kbd>Mod+Shift+V</kbd> after it. Pasting into another content scope works too: copy, switch the scope, paste. Deleting asks first, with the number of pages per status, since it can't be undone; checked pages can only be deleted together with all their subpages.

Pass `getCategoryUrl` so the message after moving a page to another category links to it:

```tsx
<PageTreeDetailPage
    path={`/pages/pagetree/${categoryToUrlParam(category)}`}
    getCategoryUrl={(category) => `/pages/pagetree/${categoryToUrlParam(category)}`}
    category={category}
    documentTypes={documentTypes}
/>
```

**Breaking changes**

- `useCopyPastePages` returns the paste `progress` to show with `@dextinity/ui`, and `sendPages` resolves to whether the pages were pasted. It takes the options `onPasteError`, to report errors instead of the error dialog of `@dextinity/admin`, and `category`, for use outside a page tree. `progressDialog` is deprecated.
- The confirmation, progress and error dialogs of translating pages, also in `PagesPage`, are built with `@dextinity/ui`, so they need its CSS.
