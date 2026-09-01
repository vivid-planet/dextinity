---
name: comet-block
description: Creates and edits Comet blocks (API, Admin, Site) from natural-language prompts, including block fixture services. Use when the user asks to create a new block, edit an existing block, add/remove/change fields or child blocks, scaffold block files, or create block fixtures in a Comet project.
---

# Comet Block Skill

## Table of Contents

1. [When to use](#when-to-use)
2. [Workflow routing](#workflow-routing)
3. [Step 1 — Parse the prompt](#step-1--parse-the-prompt)
4. [Step 2 — Discover the project](#step-2--discover-the-project)
5. [Editing workflow](#editing-workflow) ← follow this for edits
6. [Step 3 — Create the API block](#step-3--create-the-api-block) ← creation only
7. [Step 4 — Create the Admin block](#step-4--create-the-admin-block) ← creation only
8. [Step 5 — Create the Site block](#step-5--create-the-site-block) ← creation only
9. [Step 6 — Register the block](#step-6--register-the-block)
10. [Step 7 — Create block fixtures](#step-7--create-block-fixtures)
11. [Naming conventions](#naming-conventions)
12. [Code generation](#code-generation)
13. [Cross-references](#cross-references)

---

## When to use

- Creating a **new** Comet block from a natural-language description.
- Scaffolding block files across API, Admin, and Site layers.
- Adding, removing, or changing fields or child blocks in an existing block.
- Changing enum values, field types, or property names in an existing block.
- Creating block fixture services for seeding development databases.

---

## Workflow routing

```
User request
    │
    ├─ Creating a new block?   → Steps 1 → 2 → 3 → 4 → 5 → 6 → 7
    │
    └─ Editing an existing block? → Steps 1 → 2 → Editing workflow → 7
```

---

## Step 1 — Parse the prompt

Extract from the user's request:

1. **Block name** — derive PascalCase for Admin/Site (`TeaserItemBlock`) and kebab-case for API (`teaser-item.block.ts`). See [Naming conventions](#naming-conventions).
2. **Properties** — for each property determine its type. Common types:
    - **String** — plain text (`title`, `label`).
    - **Number** — numeric with min/max (`overlay`).
    - **Boolean** — toggle/switch (`showOverlay`).
    - **Numeric select** — fixed numeric options. Use `@IsInt()` + `@BlockField()` in the API (not `type: "enum"`); use `createCompositeBlockSelectField` with number options in Admin. See [select.md](references/select.md).
    - **Enum/select** — fixed string values (`variant`, `alignment`). See [select.md](references/select.md).
    - **RichText** — formatted text. Choose shared `RichTextBlock` or a scoped inline one. See [rich-text.md](references/rich-text.md).
    - **Image** — choose `DamImageBlock`, `PixelImageBlock`, `SvgImageBlock`, or a project-specific `MediaBlock`. See [image.md](references/image.md).
    - **Child block** — any other existing block used as a property.
    - **List** — multiple instances of a child block; requires a list block + item block pair. See [block-types.md](references/block-types.md).
3. **Registration target** — where the block is added. Default: `PageContentBlock` (and `ContentGroupBlock` if it exists). Ask if unclear.
4. **Ambiguities** — if "image" is mentioned without specifics, or a referenced block may not exist, ask before proceeding.

For block type decision guidance, see [block-types.md](references/block-types.md).

---

## Step 2 — Discover the project

Before generating any code:

1. **Locate `api`, `admin`, `site` directories.** The `site` directory is optional.
2. **Find existing blocks directories** — typically `src/documents/pages/blocks/`. Some shared blocks live in `common/blocks/` or similar. Check both.
3. **Verify referenced blocks exist** — search for any blocks named in the prompt (e.g., `HeadingBlock`, `LinkBlock`) in all layers and note their import paths.
4. **Find registration targets** — search for `createBlocksBlock` usages to locate `PageContentBlock`, `ContentGroupBlock`, or other targets. Note file paths in all layers.
5. **Confirm site directory** — if absent, skip all site steps.

---

## Editing workflow

Use this instead of Steps 3–5 when modifying an existing block.

### Classify each change

| Change type                  | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| **Add field/child block**    | A new property on the block.                         |
| **Remove field/child block** | An existing property is deleted.                     |
| **Change field type**        | One type replaces another (e.g., string → RichText). |
| **Change enum values**       | Options added to or removed from a select field.     |
| **Rename field**             | Property keeps its type but gets a new name.         |

A single request may involve multiple change types — classify each independently.

### Determine if a migration is needed

Ask the user before creating a migration if they haven't mentioned it. Explain the old vs new data shape and confirm.

**Migration IS needed:**

- Adding a **required** field (existing data lacks it).
- **Changing** a field's type (old data has the old shape).
- **Removing** a field (recommended to keep data clean).
- **Renaming** a field (old data uses the old name).

**Migration is NOT needed:**

- Adding an **optional/nullable** field (`@IsUndefinable()` + `@BlockField({ nullable: true })`).
- Adding a new supported block to a `BlocksBlock` or `OneOfBlock`.
- Adding new enum values (existing data unaffected).

When in doubt, create a migration — it is always the safer choice. See [migration.md](references/migration.md) for the full decision matrix, class template, and annotated examples.

### Apply changes in order

1. **API block** — update `BlockData` and `BlockInput` classes, decorators, validators.
2. **Migration** — create and register if needed. Update `createBlock` third argument to the options object. See [migration.md](references/migration.md).
3. **Admin block** — update the `blocks` object: add/remove entries, labels, options.
4. **Site block** (if exists) — update destructured fields and rendered output.
5. **Block fixture** (if exists) — update `generateBlockInput()` to match changes. See [fixtures.md](references/fixtures.md).
6. **Verify consistency** — confirm every property key name matches across all three layers.

---

## Step 3 — Create the API block

File: `{block-name}.block.ts` (kebab-case). Place in the blocks directory found in Step 2.

**Key patterns:**

- `BlockData` uses `@BlockField()` for fields, `@ChildBlock(X)` for child blocks.
- `BlockInput` uses validators + `@ChildBlockInput(X)` for child blocks; implement `transformToBlockData()` with `inputToData`.
- Export with `createBlock(BlockData, BlockInput, "BlockName")`.
- Enums require `@BlockField({ type: "enum", enum: MyEnum })` — never use `type: "enum"` for numeric options.
- For list blocks: create the item block first, then `createListBlock({ block: ItemBlock }, "MyList")`.

For field decorators, validator reference, savability rules, and complete examples, see [api-patterns.md](references/api-patterns.md).

---

## Step 4 — Create the Admin block

File: `{BlockName}Block.tsx` (PascalCase). Place in the blocks directory found in Step 2.

**Key patterns:**

- Use `createCompositeBlock` with a `blocks` object mapping property names to block configs.
- Helper functions: `createCompositeBlockTextField`, `createCompositeBlockSelectField`, `createCompositeBlockSwitchField`.
- `fullWidth` defaults to `true` in text and select helpers — omit it explicitly.
- All user-facing strings use `FormattedMessage` from `react-intl`. Follow ID convention: `{blockName}Block.{field}`.
- Set `BlockCategory` when the block is used inside a blocks block.
- Set `previewContent` in the override callback for meaningful block list previews.
- **`hiddenInSubroute` rule:** When the composite contains sub-route blocks (list, blocks-block, one-of), set `hiddenInSubroute: true` on every sibling entry that is _not_ a sub-route block. Never set it on sub-route block entries themselves.
- **`label` vs `title`:** when the helper has a `label`, omit `title` on the block entry. When it has no `label`, provide `title` on the entry. They are mutually exclusive.
- For list blocks: use `createListBlock` from `@comet/cms-admin` with `name`, `displayName`, `block`, `itemName`, `itemsName`.

For the full helper API, `BlockCategory` enum, and complete examples, see [admin-patterns.md](references/admin-patterns.md).

---

## Step 5 — Create the Site block (if site exists)

File: `{BlockName}Block.tsx` (PascalCase). Place in the blocks directory found in Step 2.

**Key patterns:**

- Wrap with `withPreview(Component, { label: "BlockName" })`.
- Type props as `PropsWithData<{BlockName}BlockData>` — import from `@src/blocks.generated`.
- Use `hasRichTextBlockContent` guard before rendering RichText. Never wrap `RichTextBlock` in a `Typography` component.
- `DamImageBlock` is **not** exported from `@comet/site-nextjs` — use the project-specific wrapper. See [image.md](references/image.md).
- Always validate `aspectRatio` against `allowedImageAspectRatios` in the API config. See [image.md](references/image.md).
- The `supportedBlocks` object (for `BlocksBlock`/`PageContent` site wrapper) must be defined at module level, not inside the component.

For `withPreview`, `OneOfBlock`/`OptionalBlock`, and complete site examples, see [site-patterns.md](references/site-patterns.md).

---

## Step 6 — Register the block

Add the new block to the registration target in **all three layers** using **identical camelCase key names**.

**Default target:** `PageContentBlock`. If `ContentGroupBlock` exists and mirrors `PageContentBlock` supported blocks, also register there.

```ts
// API & Admin: supportedBlocks object inside createBlocksBlock
myBlock: MyBlock,

// Site: supportedBlocks object
myBlock: (props) => <MyBlock data={props} />,
```

For the target hierarchy, multiple targets, and edge cases, see [registration.md](references/registration.md).

---

## Step 7 — Create block fixtures

Create a fixture service that generates realistic seed data for the new block.

1. **Create the fixture service** matching the block type (composite, list, blocks-block, one-of).
2. **Wire into the parent block's fixture.** If the parent has no fixture, ask the user before creating one.
3. **Register in `fixtures.module.ts`** as a provider.
4. **For nested list blocks:** create the list item fixture service first, then the parent composite fixture which injects and calls it.

For faker guidelines, patterns by block type, and full examples, see [fixtures.md](references/fixtures.md).

---

## Naming conventions

| Concept                          | Convention                | Example                     |
| -------------------------------- | ------------------------- | --------------------------- |
| API file name                    | kebab-case `.block.ts`    | `product-card.block.ts`     |
| Admin / Site file name           | PascalCase `Block.tsx`    | `ProductCardBlock.tsx`      |
| Export variable                  | PascalCase + "Block"      | `ProductCardBlock`          |
| Name string (`createBlock` etc.) | PascalCase, no "Block"    | `"ProductCard"`             |
| API `BlockData` class            | PascalCase + "BlockData"  | `ProductCardBlockData`      |
| API `BlockInput` class           | PascalCase + "BlockInput" | `ProductCardBlockInput`     |
| Registration key                 | camelCase, no "Block"     | `productCard`               |
| Child block property             | camelCase                 | `image`, `callToActionList` |
| `FormattedMessage` ID            | camelCase block + field   | `productCardBlock.headline` |

The `name` parameter in `createBlock`, `createCompositeBlock`, `createListBlock`, `createBlocksBlock`, and `createOneOfBlock` is PascalCase **without** a "Block" suffix and must be **identical** across all layers.

---

## Cross-references

| Topic                                               | File                                                      |
| --------------------------------------------------- | --------------------------------------------------------- |
| Block type overview and decision guide              | [block-types.md](references/block-types.md)               |
| API decorator patterns, validators, savability      | [api-patterns.md](references/api-patterns.md)             |
| Admin helpers, `BlockCategory`, `hiddenInSubroute`  | [admin-patterns.md](references/admin-patterns.md)         |
| Site `withPreview`, rendering patterns              | [site-patterns.md](references/site-patterns.md)           |
| Registration targets, keys, edge cases              | [registration.md](references/registration.md)             |
| RichText configuration, scoped vs shared            | [rich-text.md](references/rich-text.md)                   |
| Enum/select patterns, numeric options, multi-select | [select.md](references/select.md)                         |
| Image block selection and site wrappers             | [image.md](references/image.md)                           |
| Migration decision matrix, class template, examples | [migration.md](references/migration.md)                   |
| Block fixture patterns and faker guidelines         | [fixtures.md](references/fixtures.md)                     |
| Block loaders for server-side data fetching         | [block-loader.md](references/block-loader.md)             |
| Custom block fields for entity selection            | [custom-block-field.md](references/custom-block-field.md) |
| Response template for creation/editing output       | [response-summary.md](references/response-summary.md)     |
