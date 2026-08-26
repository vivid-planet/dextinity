---
"@dextinity/site-react": minor
"@dextinity/site-nextjs": minor
---

Render TipTap tables in `renderTipTapRichText`

`renderTipTapRichText` now has default node mappings for `table`, `tableRow`, `tableHeader` and `tableCell`, so content from `createTipTapTableBlock` (and from a rich text block with `"table"` support) renders without extra configuration:

- a leading row whose cells are all header cells becomes a `<thead>`, the remaining rows a `<tbody>`
- `colspan` and `rowspan` are applied when a cell spans more than one row or column
- a header cell gets `scope="col"` in an all-header row and `scope="row"` otherwise
- stored column widths become a `<colgroup>`

As with all other nodes, the mappings can be overridden via `nodeMapping`:

```tsx
const nodeMapping: Record<string, TipTapNodeHandler> = {
    table: ({ children }) => <table className={styles.table}>{children}</table>,
};
```
