# Grid with Edit in Dialog

Use `useEditDialog` for simple CRUD where the edit form is small. No page navigation needed.

```tsx
const [EditDialog, { id: selectedId, mode }, editDialogApi] = useEditDialog();

return (
    <>
        <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
            <ToolbarBackButton />
            <ToolbarAutomaticTitleItem />
        </StackToolbar>
        <StackMainContent fullHeight>
            <DataGrid ... />
        </StackMainContent>
        <EditDialog title={mode === "add" ? <FormattedMessage id="myEntity.addItem" defaultMessage="Add item" /> : <FormattedMessage id="myEntity.editItem" defaultMessage="Edit item" />}>
            {/* Dialog content with form */}
        </EditDialog>
    </>
);
```

Key points:

- `editDialogApi.openAddDialog()` to open add dialog (e.g., from a button in DataGridToolbar)
- `editDialogApi.openEditDialog(row.id)` to open edit dialog (e.g., from a row action button)
- No `StackSwitch` or `SaveBoundary` needed — the dialog handles its own save
