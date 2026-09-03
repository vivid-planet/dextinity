# Grid with Edit Page with RouterTabs

Extends pattern 03 (Grid with Edit on Page). The grid page uses `StackMainContent fullHeight`, and the edit page uses `RouterTabs` to organize content into tabs. Use `forceRender` on form tabs to preserve state, `FullHeightContent` for grid tabs.

```tsx
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
                <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
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
        </StackPage>
        <StackPage name="edit">
            {(id) => (
                <SaveBoundary>
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                        <ToolbarBackButton />
                        <ToolbarAutomaticTitleItem />
                        <FillSpace />
                        <ToolbarActions>
                            <SaveBoundarySaveButton />
                        </ToolbarActions>
                    </StackToolbar>
                    <StackMainContent>
                        <RouterTabs>
                            <RouterTab forceRender={true} path="" label="Details">
                                <MyForm id={id} />
                            </RouterTab>
                            <RouterTab path="/related-items" label="Related Items">
                                <FullHeightContent>
                                    <DataGrid ... />
                                </FullHeightContent>
                            </RouterTab>
                        </RouterTabs>
                    </StackMainContent>
                </SaveBoundary>
            )}
        </StackPage>
    </StackSwitch>
</Stack>
```

Key points:

- **`StackSwitch` must be wrapped in a `Stack`** with a `topLevelTitle` — this sets the top-level breadcrumb and is required for the stack navigation to work

- `forceRender={true}` on form tabs — keeps form state alive when switching tabs within the same `SaveBoundary`
- Do NOT use `forceRender` on tabs that contain a nested `StackSwitch`
- Use `FullHeightContent` (not `StackMainContent fullHeight`) for grids inside tabs
- `SaveBoundary` wraps all tabs so a single save button saves all form tabs
