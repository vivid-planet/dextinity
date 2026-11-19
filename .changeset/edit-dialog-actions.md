---
"@dextinity/admin": minor
---

Add `EditDialogActions` and the `disableDialogActions` prop to `EditDialog`

Pressing Enter in an `EditDialog` only saved the dialog when its form had a single text field, because the dialog's save button is rendered outside the form.
Set `disableDialogActions` and render `EditDialogActions` inside the form instead. The save button is then the form's submit button, so pressing Enter in a field saves and closes the dialog.

```tsx
<EditDialog disableDialogActions>
    <FinalForm mode="add" onSubmit={handleSubmit}>
        <DialogContent>
            <TextField name="title" label="Title" fullWidth />
            <TextField name="description" label="Description" fullWidth />
        </DialogContent>
        <EditDialogActions />
    </FinalForm>
</EditDialog>
```
