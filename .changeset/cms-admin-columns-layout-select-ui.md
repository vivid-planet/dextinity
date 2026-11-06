---
"@dextinity/cms-admin": major
---

Build the layout and columns selects of columns blocks with `@dextinity/ui`, and add `LayoutSelectField` and `ColumnsSelectField`

`LayoutSelectField` chooses a `ColumnsBlockLayout` in a React Final Form form, showing each layout's preview in the menu and the chosen one in the field. It brings its own label, so use it directly instead of passing `FinalFormLayoutSelect` to a `Field`:

```tsx
<BlocksFinalForm<{ layout: ColumnsBlockLayout }> onSubmit={({ layout }) => updateState(layout.name)} initialValues={{ layout }}>
    <LayoutSelectField name="layout" label={<FormattedMessage id="layoutBlock.layout" defaultMessage="Layout" />} layouts={layouts} />
</BlocksFinalForm>
```

`ColumnsSelectField` chooses the number of columns with a segmented control.

Breaking changes:

- `FinalFormLayoutSelect` is deprecated. It renders a `Select` of `@dextinity/ui` with its own "Layout" label (change it with `selectLabel`), so a label passed to the surrounding `Field` shows twice. MUI props passed through the `Field`, like `fullWidth` or `sx`, have no effect. Layouts of several sections are listed in order with the section's label next to each layout instead of under section headers.
- `ColumnsLayoutPreview`, `ColumnsLayoutPreviewContent` and `ColumnsLayoutPreviewSpacing` are styled with the design tokens instead of the MUI theme, and render `span`s so they fit into the select's options. `ColumnsLayoutPreviewSpacing` is no longer a styled component and doesn't take `className` or `sx`.
