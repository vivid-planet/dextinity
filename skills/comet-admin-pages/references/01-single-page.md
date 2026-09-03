# Single Page (Grid or Form)

No `StackSwitch` needed. These patterns show the content of a single `StackPage` inside a parent `Stack` — just `StackToolbar` + `StackMainContent`.

## Grid page

Use `StackMainContent fullHeight` for grids.

```tsx
<>
    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
        <ToolbarBackButton />
        <ToolbarAutomaticTitleItem />
    </StackToolbar>
    <StackMainContent fullHeight>
        <DataGrid ... />
    </StackMainContent>
</>
```

Use `<ContentScopeIndicator global />` for global/unscoped entities, or `<ContentScopeIndicator />` for scoped entities.

## Form page

Wrap in `SaveBoundary`. Form component contains its own layout (FieldSet etc.).

```tsx
<SaveBoundary>
    <StackToolbar scopeIndicator={<ContentScopeIndicator />}>
        <ToolbarBackButton />
        <ToolbarAutomaticTitleItem />
        <FillSpace />
        <ToolbarActions>
            <SaveBoundarySaveButton />
        </ToolbarActions>
    </StackToolbar>
    <StackMainContent>
        <MyForm />
    </StackMainContent>
</SaveBoundary>
```
