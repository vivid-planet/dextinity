---
"@dextinity/cms-admin": minor
---

Add `PageStateProvider` and `usePageState`

Components that want to read or modify the content of the page that is currently being edited had to receive the page state as a prop from the edit page.
`PageStateProvider` shares the page state of `createUsePage`'s `usePage` hook with all nested components, so features that are rendered somewhere else in the Admin (like the AI mode) can access it via `usePageState`.

**Example**

Wrap the content of the edit page with the provider:

```tsx
const { pageState, setPageState /* ... */ } = usePage({ pageId: id });

return (
    <PageStateProvider pageState={pageState} setPageState={setPageState}>
        {/* Toolbar, blocks, ... */}
    </PageStateProvider>
);
```

Nested components can then read and modify the page's content:

```tsx
const pageStateApi = usePageState<PageState>();

const applySuggestedHtmlTitle = (htmlTitle: string) => {
    pageStateApi?.setPageState((pageState) => {
        if (!pageState?.document) {
            return pageState;
        }

        return {
            ...pageState,
            document: {
                ...pageState.document,
                seo: { ...pageState.document.seo, htmlTitle },
            },
        };
    });
};
```

`usePageState` returns `undefined` when used outside of an edit page, for instance, when the AI mode is opened on a page that doesn't provide a page state.
