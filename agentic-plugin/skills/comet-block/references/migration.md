# Block Migration Rules

Detailed rules for deciding when a block migration is needed and how to write one. Load this file when an existing block is being edited and the change may affect persisted data.

---

## Overview

Block migrations transform persisted data from an old shape to a new shape when a block's structure changes. They are **API-only** -- Admin and Site layers always work with the latest block shape and never need migration files.

Not every block change requires a migration. This document provides a decision matrix for when a migration is needed, a step-by-step workflow for writing one, rules for structuring the migration class, and annotated real-world examples.

---

## Decision Matrix

Use this table to determine whether a migration is needed for a given change.

| Change type                                                                                                   | Migration needed? | Reason                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Add a required field** (string, number, enum, boolean)                                                      | Yes               | Existing data lacks the field; the API validator rejects it. A default value must be injected.                                                                                                |
| **Add a required child block**                                                                                | Yes               | Existing data lacks the field; the block expects a structural object (e.g., empty RichTextBlock).                                                                                             |
| **Add an optional/nullable field**                                                                            | No                | `@IsUndefinable()` + `@BlockField({ nullable: true })` allows `undefined`. Existing data is valid.                                                                                            |
| **Remove a field or child block**                                                                             | Recommended       | Old data still contains the field. A migration keeps persisted data clean (not strictly required).                                                                                            |
| **Change a field's type** (e.g., string → RichText)                                                           | Yes               | Existing data has the old type; the new block definition rejects it.                                                                                                                          |
| **Rename a field**                                                                                            | Yes               | Existing data uses the old key name; the new key would be empty.                                                                                                                              |
| **Add enum values**                                                                                           | No                | Old data uses existing valid values; new options are simply available going forward.                                                                                                          |
| **Remove enum values**                                                                                        | Depends           | If persisted data contains removed values, a migration must map them to a valid replacement.                                                                                                  |
| **Change an enum's default**                                                                                  | No                | The default only applies to new blocks in the Admin; existing data already has a stored value.                                                                                                |
| **Add a block type to a BlocksBlock/OneOfBlock**                                                              | No                | New types are additive; existing data never references them.                                                                                                                                  |
| **Remove a block type from a BlocksBlock/OneOfBlock**                                                         | Recommended       | Orphaned entries persist in the data. A migration filters them out for cleanliness.                                                                                                           |
| **Change a number field's min/max constraints**                                                               | Depends           | If existing values fall outside the new range, a migration must clamp them.                                                                                                                   |
| **Change a boolean's default**                                                                                | No                | Existing data already has an explicit `true`/`false` value stored.                                                                                                                            |
| **Wrap a block in a new structure** (e.g., composite → one-of, composite → list, single block → blocks-block) | Yes               | The persisted data has the old block's flat shape; the new wrapper expects a different structural envelope (e.g., `activeType` + `attachedBlocks` for one-of, or an array of items for list). |
| **Replace a block entirely** (swap one block for a different block with a different data shape)               | Yes               | The persisted data contains the old block's shape; the new block definition rejects it. A migration must transform the old shape into the new one (or provide an empty default).              |

**Rule of thumb:** if existing persisted data would fail validation or render incorrectly after the change, a migration is needed. When in doubt, create a migration -- it is always the safer choice.

---

## Workflow: Writing a Migration

Follow these steps when a migration is needed.

### 1. Create the migration file

Place the file in a `migrations/` directory next to the block file. Use the naming convention `{version}-{kebab-case-description}.migration.ts`.

If the block already has migrations, the version is one higher than the current highest `toVersion`. If this is the first migration, the version is `1`.

### 2. Define the `From` and `To` interfaces

Only include fields **relevant to this migration**. Use `unknown` for field values that pass through unchanged.

| Pattern               | `From`                               | `To`                                        |
| --------------------- | ------------------------------------ | ------------------------------------------- |
| Adding a field        | All current fields as `unknown`      | `extends From` with the new field           |
| Removing a field      | Includes the field being removed     | Omits the removed field                     |
| Changing a field type | Field typed with old value structure | Field typed with new value structure        |
| Renaming a field      | Includes old field name              | Includes new field name, omits old          |
| No shape change       | `type To = From`                     | Same shape (filtering entries, moving data) |

For detailed rules on structuring these interfaces, see [From/To Interface Rules](#fromto-interface-rules) below.

### 3. Implement the `migrate` method

The `migrate` method receives the old data (without the internal `$$version` field) and returns the new shape:

- Always spread `...from` to preserve fields not involved in the migration.
- Use plain literals for default values -- **never** import enums, block classes, or other application code. Migrations must be self-contained so they don't break when the application code changes later.
- For RichTextBlock empty defaults, use the inline DraftJS structure: `{ draftContent: { blocks: [], entityMap: {} } }`.
- For child block empty defaults, use `{}` (an empty object representing the block's default state).

### 4. Register the migration in the block file

- **First migration:** Convert the `createBlock` third argument from a plain string to an options object with `name` and `migrate`.
- **Subsequent migration:** Import the new migration class, append it to the `typeSafeBlockMigrationPipe` array, and increment `version`.

The `version` in the options object must always equal the highest `toVersion` among all migrations. See [Registering Migrations](#registering-migrations) for full patterns, code examples, and version numbering rules.

### 5. Update the block classes

Apply the structural change to `BlockData` and `BlockInput` so the API accepts the new shape going forward. Then update the Admin and Site layers.

---

## Migration Class Template

```ts
import { BlockMigration, type BlockMigrationInterface } from "@comet/cms-api";

interface From {
    // Fields that exist before this migration. Use `unknown` for values.
    existingField: unknown;
}

interface To extends From {
    // New field being added (for an "add field" migration).
    newField: unknown;
}

export class AddNewFieldMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(from: From): To {
        return {
            ...from,
            newField: "defaultValue",
        };
    }
}
```

This template shows the most common pattern — adding a field. Adapt the `From` and `To` interfaces for other change types using the [From/To Interface Rules](#fromto-interface-rules) below.

---

## From/To Interface Rules

- Only include fields **relevant to this migration** in `From` and `To`. Fields that pass through unchanged do not need to appear — the `...from` spread preserves them. For included fields whose values are not inspected, use `unknown` as the type.
- **`To extends From`** when adding a field — the new shape is the old shape plus the addition.
- **`type To = From`** when the structural shape does not change — e.g., filtering entries from an inner array or transforming data within existing fields. With all fields typed as `unknown`, the interfaces are structurally identical.
- **Define `To` independently** (not extending `From`) when removing or renaming fields, because the old and new shapes have different keys.
- **Never import application types** into `From` or `To`. Use `unknown` for field values and inline type literals for nested structures. Importing block classes, enums, or shared interfaces couples the migration to code that may change later.

See the table in [workflow step 2](#2-define-the-from-and-to-interfaces) for a per-pattern quick reference. For annotated code examples of each pattern, see the [Annotated Examples](#annotated-examples) section below.

---

## Common Default Values

Use these defaults when a migration injects a new field into existing data.

| New field type              | Default value in migration                                                                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| String (required)           | `""`                                                                                                                                                            |
| Enum                        | The default enum value as a plain string (e.g., `"primary"`)                                                                                                    |
| Number                      | The logical default (e.g., `50`)                                                                                                                                |
| Boolean                     | `false`                                                                                                                                                         |
| RichTextBlock (empty)       | `{ draftContent: { blocks: [], entityMap: {} } }`                                                                                                               |
| RichTextBlock (from string) | `{ draftContent: { blocks: [{ key: uuid(), text: oldValue, type: "unstyled", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} }], entityMap: {} } }` |
| Child block (empty)         | `{}` -- an empty object representing the block's default state                                                                                                  |
| OneOfBlock (empty)          | `{ activeType: "firstType", attachedBlocks: [{ type: "firstType", props: {} }] }`                                                                               |

**Notes:**

- **RichTextBlock (from string):** When converting a string field to a RichTextBlock, wrap the existing string value in the DraftJS content structure shown above. Import `uuid` via `import { v4 as uuid } from "uuid"` and use `uuid()` to generate the block key. Fall back to `""` if the old string may be `undefined` (e.g., `text: from.myField ?? ""`). See [Example 2](#example-2-replacing-a-string-field-with-a-richtextblock) for the full pattern.
- **OneOfBlock (empty):** Replace `"firstType"` with the actual key of the first supported block type (e.g., `"image"` if `supportedBlocks` starts with `image: DamImageBlock`). The `props: {}` represents the child block's empty default state.
- **Child block (empty):** Most child blocks use `{}` as their empty default. For RichTextBlock children, use the RichTextBlock (empty) pattern above instead.

---

## Registering Migrations

After writing the migration class, register it in the block's `createBlock` call so the API knows to run it against persisted data.

### First Migration on a Block

When a block has **no existing migrations**, the `createBlock` third argument is a plain name string. Convert it to an options object with `name` and `migrate`:

```ts
// Before (no migrations)
export const MyBlock = createBlock(MyBlockData, MyBlockInput, "My");

// After (first migration added)
import { typeSafeBlockMigrationPipe } from "@comet/cms-api";
import { AddSubtitleMigration } from "./migrations/1-add-subtitle.migration";

export const MyBlock = createBlock(MyBlockData, MyBlockInput, {
    name: "My",
    migrate: {
        version: 1,
        migrations: typeSafeBlockMigrationPipe([AddSubtitleMigration]),
    },
});
```

The `name` value must be the same string that was previously used as the third argument.

### Adding a Subsequent Migration

When a block **already has migrations**, three changes are needed:

1. **Import** the new migration class.
2. **Append** it to the end of the `typeSafeBlockMigrationPipe` array.
3. **Increment** `version` to match the new migration's `toVersion`.

```ts
import { typeSafeBlockMigrationPipe } from "@comet/cms-api";
import { AddSubtitleMigration } from "./migrations/1-add-subtitle.migration";
import { ReplaceTextWithRichTextMigration } from "./migrations/2-replace-text-with-rich-text.migration";

export const MyBlock = createBlock(MyBlockData, MyBlockInput, {
    name: "My",
    migrate: {
        version: 2, // incremented from 1 to 2
        migrations: typeSafeBlockMigrationPipe([AddSubtitleMigration, ReplaceTextWithRichTextMigration]),
    },
});
```

### `typeSafeBlockMigrationPipe`

`typeSafeBlockMigrationPipe` accepts an ordered array of migration classes and enforces type-safe chaining at compile time (each migration's `To` must be compatible with the next migration's `From`). Import it from `@comet/cms-api`.

Rules for the migrations array:

- **Order by `toVersion` ascending** — the migration with `toVersion = 1` comes first, `toVersion = 2` second, and so on.
- **No gaps** — version numbers must be sequential (1, 2, 3, ...).
- **Maximum 20 migrations** per pipe (TypeScript inference limit).

### Version Numbering Rules

| Property                                   | Must equal                                                |
| ------------------------------------------ | --------------------------------------------------------- |
| `migrate.version` in `createBlock` options | The highest `toVersion` among all migrations in the array |
| Each migration's `toVersion`               | Its sequential position (first = 1, second = 2, etc.)     |

If a block has three migrations with `toVersion` values 1, 2, and 3, then `migrate.version` must be `3`.

### Block Factory Variants

Blocks created with factory helpers (e.g., `ColumnsBlockFactory.create`) accept the same name-or-options argument as `createBlock`. The registration pattern is identical — replace the name string with an options object:

```ts
// Before
export const ColumnsBlock = ColumnsBlockFactory.create(
    {
        /* ... */
    },
    "Columns",
);

// After
export const ColumnsBlock = ColumnsBlockFactory.create(
    {
        /* ... */
    },
    {
        name: "Columns",
        migrate: {
            version: 1,
            migrations: typeSafeBlockMigrationPipe([MyMigration]),
        },
    },
);
```

For full annotated examples of migration registration, see the [Annotated Examples](#annotated-examples) section below.

---

## Important Rules

1. **Never import application code in migrations.** Use plain string literals, inline objects, and hardcoded values. Migrations must remain self-contained so they don't break when enums, block classes, or constants are renamed or removed later.
2. **Each migration file exports exactly one class.** The class name is the PascalCase version of the file's kebab-case description plus a `Migration` suffix.
3. **Version numbers must be sequential.** The first migration has `toVersion = 1`, the second has `toVersion = 2`, and so on. Gaps are not allowed.
4. **The block's `version` must equal the highest `toVersion`.** In the `createBlock` options, `migrate.version` must match the `toVersion` of the last migration in the array.
5. **Migrations are ordered by `toVersion` (ascending)** in the `typeSafeBlockMigrationPipe` array.
6. **Migrations are API-only.** Admin and Site layers do not need migration files -- they always work with the latest block shape.
7. **`From` and `To` interfaces should be minimal.** Only include fields relevant to the migration. Use `unknown` for field values that are not inspected or transformed.

---

## Annotated Examples

### Example 1: Adding a New Required Field with a Default Value

**Scenario:** A `HeadlineBlock` has three properties -- `headline` (RichTextBlock), `eyebrow` (string), and `textPosition` (enum). A new `background` enum field must be added. Existing content must default to `"LightGrey"`.

**Migration file** (`migrations/1-add-background-option.migration.ts`):

```ts
import { BlockMigration, type BlockMigrationInterface } from "@comet/cms-api";

interface From {
    headline: unknown;
    eyebrow: unknown;
    textPosition: unknown;
}

interface To extends From {
    background: unknown;
}

export class AddBackgroundOptionMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(from: From): To {
        return {
            ...from,
            background: "LightGrey",
        };
    }
}
```

**Registration:**

```ts
import { typeSafeBlockMigrationPipe } from "@comet/cms-api";
import { AddBackgroundOptionMigration } from "./migrations/1-add-background-option.migration";

export const HeadlineBlock = createBlock(HeadlineBlockData, HeadlineBlockInput, {
    name: "Headline",
    migrate: {
        version: 1,
        migrations: typeSafeBlockMigrationPipe([AddBackgroundOptionMigration]),
    },
});
```

---

### Example 2: Replacing a String Field with a RichTextBlock

**Scenario:** The `eyebrow` field on `HeadlineBlock` must be changed from a plain string to a `RichTextBlock`. Existing string content must be preserved inside the new structure.

**Migration file** (`migrations/2-replace-text-with-rich-text-block.migration.ts`):

```ts
import { BlockMigration, type BlockMigrationInterface } from "@comet/cms-api";
import { v4 as uuid } from "uuid";

interface From {
    headline: unknown;
    eyebrow: unknown;
    textPosition: unknown;
    background: unknown;
}

type To = From;

export class ReplaceTextWithRichTextMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 2;

    protected migrate(from: From): To {
        return {
            ...from,
            eyebrow: {
                draftContent: {
                    blocks: [
                        {
                            key: uuid(),
                            text: from.eyebrow ?? "",
                            type: "unstyled",
                            depth: 0,
                            inlineStyleRanges: [],
                            entityRanges: [],
                            data: {},
                        },
                    ],
                    entityMap: {},
                },
            },
        };
    }
}
```

`type To = From` because the field name stays the same -- only its runtime value changes. With all fields typed as `unknown`, the interfaces are structurally identical.

---

### Example 3: Adding a New Child Block with an Empty Default

**Scenario:** A `ContactFormBlock` with one property (`contactFormDisclaimer`) needs a new `text` child block (RichTextBlock). It must default to an empty RichTextBlock so existing content renders without changes.

**Migration file** (`migrations/1-add-text-to-contact-form.migration.ts`):

```ts
import { BlockMigration, type BlockMigrationInterface } from "@comet/cms-api";

interface From {
    contactFormDisclaimer: unknown;
}

interface To extends From {
    text: unknown;
}

export class AddTextToContactFormMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(from: From): To {
        return {
            ...from,
            text: {
                draftContent: {
                    blocks: [],
                    entityMap: {},
                },
            },
        };
    }
}
```

---

### Example 4: Removing a Block Type from a Blocks-Block

**Scenario:** The `contactForm` block type has been removed from `ColumnsContentBlock`'s `supportedBlocks`, but existing data may still contain `contactForm` entries. A migration filters out orphaned entries.

The overall shape does not change -- `From` and `To` are identical. The migration only filters entries from an inner array.

**Migration file** (`migrations/1-remove-contact-form-from-columns-block.migration.ts`):

```ts
import { BlockMigration, type BlockMigrationInterface } from "@comet/cms-api";

type From = {
    columns: Array<{
        props: {
            blocks: Array<{
                type: string;
            }>;
        };
    }>;
};

type To = From;

export class RemoveContactFormFromColumnsBlockMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(from: From): To {
        const columnsWithoutContactForm = from.columns.map((column) => ({
            ...column,
            props: {
                ...column.props,
                blocks: column.props.blocks.filter((block) => block.type !== "contactForm"),
            },
        }));

        return {
            ...from,
            columns: columnsWithoutContactForm,
        };
    }
}
```

**Registration with ColumnsBlockFactory:**

```ts
import { ColumnsBlockFactory, typeSafeBlockMigrationPipe } from "@comet/cms-api";
import { RemoveContactFormFromColumnsBlockMigration } from "./migrations/1-remove-contact-form-from-columns-block.migration";

export const ColumnsBlock = ColumnsBlockFactory.create(
    { contentBlock: ColumnsContentBlock, layouts: [{ name: "9-9" }, { name: "12-6" }] },
    {
        name: "Columns",
        migrate: {
            version: 1,
            migrations: typeSafeBlockMigrationPipe([RemoveContactFormFromColumnsBlockMigration]),
        },
    },
);
```

---

### Example 5: Renaming a Field

**Scenario:** A `VideoBlock`'s `thumbnail` field must be renamed to `previewImage`. The image data must be moved to the new key.

**Migration file** (`migrations/1-thumbnail-to-preview-image.migration.ts`):

```ts
import { BlockMigration, type BlockMigrationInterface } from "@comet/cms-api";

interface From {
    thumbnail: unknown;
}

interface To {
    previewImage: unknown;
}

export class ThumbnailToPreviewImageMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(from: From): To {
        const { thumbnail, ...remainingFields } = from as From & Record<string, unknown>;

        return {
            ...remainingFields,
            previewImage: thumbnail,
        };
    }
}
```

`To` does **not** extend `From` because the old field is removed -- the two interfaces share no field names.

---

### Example 6: Multiple Sequential Migrations on One Block

**Scenario:** An `ArticleBlock` starts with `heading`, `image`, `description`. Three separate changes are made over time:

1. Add `colorScheme` enum field
2. Add `subtitle` RichTextBlock child block
3. Rename `heading` to `title`

Each migration's `From` reflects the block shape at the point where that migration runs, not the original or final shape.

**Migration 1** (`migrations/1-add-color-scheme.migration.ts`):

```ts
interface From {
    heading: unknown;
    image: unknown;
    description: unknown;
}

interface To extends From {
    colorScheme: unknown;
}

export class AddColorSchemeMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(from: From): To {
        return { ...from, colorScheme: "light" };
    }
}
```

**Migration 2** (`migrations/2-add-subtitle.migration.ts`) -- `From` includes `colorScheme` (added by migration 1):

```ts
interface From {
    heading: unknown;
    image: unknown;
    description: unknown;
    colorScheme: unknown;
}

interface To extends From {
    subtitle: unknown;
}

export class AddSubtitleMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 2;

    protected migrate(from: From): To {
        return { ...from, subtitle: { draftContent: { blocks: [], entityMap: {} } } };
    }
}
```

**Migration 3** (`migrations/3-rename-heading-to-title.migration.ts`) -- only lists fields relevant to the rename:

```ts
interface From {
    heading: unknown;
}

interface To {
    title: unknown;
}

export class RenameHeadingToTitleMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 3;

    protected migrate(from: From): To {
        const { heading, ...remainingFields } = from as From & Record<string, unknown>;
        return { ...remainingFields, title: heading };
    }
}
```

**Registration:**

```ts
export const ArticleBlock = createBlock(ArticleBlockData, ArticleBlockInput, {
    name: "Article",
    migrate: {
        version: 3,
        migrations: typeSafeBlockMigrationPipe([AddColorSchemeMigration, AddSubtitleMigration, RenameHeadingToTitleMigration]),
    },
});
```

**Runtime behaviour:** A document at version 0 runs all three migrations in sequence. A document at version 1 skips migration 1 and runs 2 and 3. A document at version 2 runs only migration 3. A document at version 3 runs no migrations.

---

## Cross-references

| Topic                                                         | File                                                                          |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Editing workflow (when to check for migration need)           | [SKILL.md — Editing an existing block](../SKILL.md#editing-an-existing-block) |
| Enum field patterns (relevant to enum-related migrations)     | [select.md](select.md)                                                        |
| RichText structure (relevant to string → RichText migrations) | [rich-text.md](rich-text.md)                                                  |
