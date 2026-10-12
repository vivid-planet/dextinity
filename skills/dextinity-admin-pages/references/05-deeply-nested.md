# Deeply Nested Navigation

`StackSwitch` inside a `RouterTab` inside another `StackSwitch`. Use `StackPageTitle` to set breadcrumb titles in nested stacks.

```tsx
<StackSwitch>
    <StackPage name="grid">
        {/* ... main grid page ... */}
    </StackPage>
    <StackPage name="edit">
        {(id) => (
            <SaveBoundary>
                <FormToolbar />
                <StackMainContent>
                    <RouterTabs>
                        <RouterTab forceRender={true} path="" label="Details">
                            <MyForm id={id} />
                        </RouterTab>
                        <RouterTab path="/child-items" label="Child Items">
                            <StackSwitch>
                                <StackPage name="grid">
                                    <FullHeightContent>
                                        <DataGrid ... />
                                    </FullHeightContent>
                                </StackPage>
                                <StackPage name="edit">
                                    {(childId) => (
                                        <SaveBoundary>
                                            <StackPageTitle title={getChildTitle(childId)}>
                                                <FormToolbar />
                                            </StackPageTitle>
                                            <StackMainContent>
                                                <ChildForm id={childId} />
                                            </StackMainContent>
                                        </SaveBoundary>
                                    )}
                                </StackPage>
                            </StackSwitch>
                        </RouterTab>
                    </RouterTabs>
                </StackMainContent>
            </SaveBoundary>
        )}
    </StackPage>
</StackSwitch>
```

Key points:

- Nested `StackSwitch` gets its own `SaveBoundary` for child edit pages
- Use `StackPageTitle` to dynamically set the breadcrumb title in nested stacks
- Parent `RouterTabs` auto-hide when a nested `StackPage` is active
- The child-items tab does NOT use `forceRender` because it contains a `StackSwitch`
