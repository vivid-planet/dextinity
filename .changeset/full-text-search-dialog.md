---
"@dextinity/cms-admin": minor
---

Show the header search in a dialog with type tabs and highlighted snippets

The header search only showed the names of the results, in no particular order, so it was hard to tell why an item was found and to find the item you were looking for.

**How to use the search**

- Click the search field in the header, or press `Ctrl+K` (`⌘+K` on macOS) anywhere in the admin.
- Each result shows its type, its title and the paragraph of its content that matches best, with the matching words highlighted. Results whose name matches come first.
- The results are grouped by type. The tabs show the number of results per type; select a tab to see only that type.
- With the gear button, choose which types are searched. The choice is stored in the browser.
- `Esc` clears the search, and a second `Esc` closes the dialog.

**Setup**

Projects that already render `SearchHeaderItem` in their header get the dialog without changes. Otherwise, add it:

```tsx
<Header>
    <SearchHeaderItem />
</Header>
```

The labels of the types come from the `displayName` in the `entityDependencyMap`. Results whose entity has no entry there are shown, but can't be opened.
