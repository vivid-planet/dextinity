# Simple Form Toolbar

A lightweight inline toolbar for form pages. No query, no loading/error handling — just layout and save button.

Use this when the toolbar doesn't need to fetch entity data (e.g. the title comes from automatic breadcrumbs).

```tsx
const FormToolbar = () => (
    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
        <ToolbarBackButton />
        <ToolbarAutomaticTitleItem />
        <FillSpace />
        <ToolbarActions>
            <SaveBoundarySaveButton />
        </ToolbarActions>
    </StackToolbar>
);
```

## Adaptation Rules

- Use `<ContentScopeIndicator global />` for global/unscoped entities, `<ContentScopeIndicator />` for scoped entities.
- Can be defined as a local component in the page file — no separate file needed.
- Reuse the same `FormToolbar` for both add and edit pages within the same `StackSwitch`.

## Usage in Pages

```tsx
<StackPage name="edit">
    {(id) => (
        <SaveBoundary>
            <FormToolbar />
            <StackMainContent>
                <ProductForm id={id} />
            </StackMainContent>
        </SaveBoundary>
    )}
</StackPage>
<StackPage name="add">
    <SaveBoundary>
        <FormToolbar />
        <StackMainContent>
            <ProductForm />
        </StackMainContent>
    </SaveBoundary>
</StackPage>
```
