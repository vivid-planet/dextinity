# Grid with Edit on Page

Use `StackSwitch` with separate `StackPage`s for grid, add, and edit. Use `StackLink` for navigation.

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

return (
    <Stack topLevelTitle={<FormattedMessage id="myEntities.title" defaultMessage="My Entities" />}>
        <StackSwitch>
            <StackPage name="grid">
                <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                    <ToolbarBackButton />
                    <ToolbarAutomaticTitleItem />
                </StackToolbar>
                <StackMainContent fullHeight>
                    <DataGrid ... />
                </StackMainContent>
            </StackPage>
            <StackPage name="add">
                <SaveBoundary>
                    <FormToolbar />
                    <StackMainContent>
                        <MyForm />
                    </StackMainContent>
                </SaveBoundary>
            </StackPage>
            <StackPage name="edit">
                {(id) => (
                    <SaveBoundary>
                        <FormToolbar />
                        <StackMainContent>
                            <MyForm id={id} />
                        </StackMainContent>
                    </SaveBoundary>
                )}
            </StackPage>
        </StackSwitch>
    </Stack>
);
```

Key points:

- **`StackSwitch` must be wrapped in a `Stack`** with a `topLevelTitle` — this sets the top-level breadcrumb and is required for the stack navigation to work
- Use `StackLink` for navigation: `<Button component={StackLink} pageName="add" payload="add">` (`payload` becomes the URL segment — use `"add"` for add pages, `row.id` for edit pages)
- Edit row via: `<IconButton component={StackLink} pageName="edit" payload={row.id}>`
- `StackPage name="edit"` uses render function `{(id) => ...}` to receive the URL payload
- `StackPage name="add"` does not need a render function
- Each form page gets its own `SaveBoundary`
- **Redirect after create:** The form component can call `useStackSwitchApi()` to access the parent StackSwitch and redirect to the edit page after creation: `const stackSwitchApi = useStackSwitchApi(); ... stackSwitchApi.activatePage("edit", newId);`. Wrap in `setTimeout` to avoid updating state during render.
