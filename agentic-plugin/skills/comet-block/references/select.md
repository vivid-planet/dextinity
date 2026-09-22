# Select Field Patterns

Comet-specific patterns for select (dropdown) fields. Load this file when a block contains a select/enum field.

The basic enum definition (`export enum Variant { ... }`, `@IsEnum`, `@BlockField({ type: "enum" })`) is covered in api-patterns.md. The full `createCompositeBlockSelectField` options table is in admin-patterns.md. This file covers the **unique patterns** only.

---

## Numeric Select (Non-Enum)

Select fields work for `number` values too — no enum needed in the API. Use `@IsInt` (or `@IsNumber`) instead of `@IsEnum`, and plain `number` as the TypeScript type.

**API:**

```ts
class ExampleBlockData extends BlockData {
    @BlockField()
    overlay: number;
}

class ExampleBlockInput extends BlockInput {
    @IsInt()
    @Min(0)
    @Max(90)
    @BlockField()
    overlay: number;

    transformToBlockData(): ExampleBlockData {
        return blockInputToData(ExampleBlockData, this);
    }
}
```

**Admin** — use `FormattedNumber` for locale-aware labels:

```tsx
const overlayOptions: Array<{ value: ExampleBlockData["overlay"]; label: ReactNode }> = [
    { value: 90, label: <FormattedNumber value={0.9} style="percent" /> },
    { value: 70, label: <FormattedNumber value={0.7} style="percent" /> },
    { value: 50, label: <FormattedNumber value={0.5} style="percent" /> },
    { value: 30, label: <FormattedNumber value={0.3} style="percent" /> },
    { value: 0,  label: <FormattedNumber value={0}   style="percent" /> },
];

overlay: {
    block: createCompositeBlockSelectField<ExampleBlockData["overlay"]>({
        defaultValue: 50,
        options: overlayOptions,
    }),
    title: <FormattedMessage id="exampleBlock.overlay" defaultMessage="Overlay" />,
},
```

> Pass percentages as fractions (`0.9` for 90%) to `FormattedNumber`.

---

## Generated Options (`.map`)

When options follow a regular pattern, generate them programmatically instead of listing each manually:

```tsx
titleHtmlTag: {
    block: createCompositeBlockSelectField<ExampleItemBlockData["titleHtmlTag"]>({
        label: <FormattedMessage id="exampleItemBlock.titleHtmlTag" defaultMessage="Title HTML tag" />,
        defaultValue: "h3",
        options: ([1, 2, 3, 4, 5, 6] as const).map((level) => ({
            value: `h${level}` as ExampleItemBlockData["titleHtmlTag"],
            label: <FormattedMessage id="exampleItemBlock.headline" defaultMessage="Headline {level}" values={{ level }} />,
        })),
        required: true,
    }),
},
```

---

## `label` vs `title` — Mutual Exclusivity

| Scenario                                                               | Use                                                               |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Field has its own inline label (visible inside the dropdown component) | `label` on the field options; **omit** `title` on the block entry |
| No inline label                                                        | **Omit** `label`; use `title` on the block entry instead          |

Using both creates redundant, stacked headings.

```tsx
// label only — no title
variant: {
    block: createCompositeBlockSelectField<ExampleBlockData["variant"]>({
        label: <FormattedMessage id="exampleBlock.variant" defaultMessage="Variant" />,
        defaultValue: "contained",
        options: variantOptions,
    }),
},

// title only — no label
alignment: {
    block: createCompositeBlockSelectField<ExampleBlockData["alignment"]>({
        defaultValue: "left",
        options: alignmentOptions,
    }),
    title: <FormattedMessage id="exampleBlock.alignment" defaultMessage="Alignment" />,
},
```

---

## Multi-Select

**API** — add `array: true` to `@BlockField` and `{ each: true }` to `@IsEnum`:

```ts
class MyBlockData extends BlockData {
    @BlockField({ type: "enum", enum: Category, array: true })
    categories: Category[];
}

class MyBlockInput extends BlockInput {
    @IsEnum(Category, { each: true })
    @BlockField({ type: "enum", enum: Category, array: true })
    categories: Category[];
    ...
}
```

An empty array `[]` is valid — `{ each: true }` passes on zero elements.

**Admin** — set `multiple: true` and `defaultValue: []`:

```tsx
categories: {
    block: createCompositeBlockSelectField<MyBlockData["categories"]>({
        label: <FormattedMessage id="myBlock.categories" defaultMessage="Categories" />,
        defaultValue: [],
        options: [
            { value: "news",  label: <FormattedMessage id="myBlock.categories.news"  defaultMessage="News" /> },
            { value: "blog",  label: <FormattedMessage id="myBlock.categories.blog"  defaultMessage="Blog" /> },
            { value: "event", label: <FormattedMessage id="myBlock.categories.event" defaultMessage="Event" /> },
        ],
        multiple: true,
    }),
},
```

---

## `required` Option

`required: true` removes the empty/placeholder option from the dropdown — the user must always have a value selected.

Use it for fields with no meaningful "none" state (e.g., HTML tag choice). For most enum fields, prefer `defaultValue` over `required` — this keeps the block savable immediately while still letting users change the value.

---

## Default Value Rules

| Scenario                       | `defaultValue`                                                   |
| ------------------------------ | ---------------------------------------------------------------- |
| Single select, logical default | Most common/neutral value (`"left"`, `"contained"`, `"default"`) |
| HTML tag select                | Most semantically common tag (`"h3"`)                            |
| Numeric select                 | Middle or most common value (`50` for overlay percentage)        |
| Multi-select                   | `[]`                                                             |

Enum fields are always required in the API (`@IsEnum` rejects `undefined`), so the Admin **must** provide a `defaultValue`.

---

## Common Pitfalls

1. **`label` and `title` both set** — creates duplicate headings; use one or the other.
2. **Multi-select: missing `{ each: true }`** — `@IsEnum(MyEnum)` without it rejects arrays.
3. **Multi-select: missing `array: true` in `@BlockField`** — field serialises as a single value instead of an array.
4. **Missing `defaultValue`** — block fails to save on first add because `@IsEnum` rejects `undefined`.
5. **Enum not exported** — must be exported from the API file to appear in the generated GraphQL schema and `@src/blocks.generated` types.
6. **`@IsOptional()` on an enum field** — enum fields must always have a value; making them optional creates an API/Admin inconsistency.
