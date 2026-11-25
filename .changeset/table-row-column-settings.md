---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

Add row and column settings to the table block

Declare the settings with `createTableSettings` and pass them as `rowSettings` or `columnSettings` to `createTableBlock`.
A setting is a `select`, a `multiSelect` or a `checkbox`, and the API and the admin must declare the same settings with the same defaults.
Editors change the settings in the menus of a row or column.

The API fills in the default of a setting that is missing, so a setting can be added to a table that already has content.

**Example**

```ts
// API
const TableBlock = createTableBlock(
    {
        richText: RichTextBlock,
        columnSettings: createTableSettings({
            ...defaultTableColumnSettings,
            hiddenOnMobile: { type: "checkbox", defaultValue: false },
        }),
    },
    "Table",
);
```

```tsx
// Admin
const TableBlock = createTableBlock({
    name: "Table",
    richText: RichTextBlock,
    columnSettings: createTableSettings({
        ...defaultTableColumnSettings,
        hiddenOnMobile: {
            type: "checkbox",
            label: <FormattedMessage id="tableBlock.hiddenOnMobile" defaultMessage="Hidden on mobile" />,
            defaultValue: false,
        },
    }),
});
```

The site reads the values from `settings` of each row and column.
