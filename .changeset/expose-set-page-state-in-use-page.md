---
"@dextinity/cms-admin": minor
---

Expose `setPageState` in the `usePage` hook returned by `createUsePage`

Until now, the page state could only be read, so features that modify a page's content had to be built into `createUsePage` itself (like `translateContent`).
`setPageState` allows applications to change the page's content programmatically, for instance, to apply changes suggested by an assistant.
The changes are applied locally only, `handleSavePage` persists them.

Additionally, the `PageState` type is exported now.

**Example**

```tsx
const { pageState, setPageState } = usePage({ pageId: id });

const applySuggestedHtmlTitle = (htmlTitle: string) => {
    setPageState((pageState) => {
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
