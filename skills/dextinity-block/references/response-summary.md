# Response Template

Use this template for the summary section at the end of **every** block creation or editing response. Include only the sections that apply — omit sections marked "conditional" when they are not relevant.

---

## Template

```
## Summary

### Blocks created        ← omit entire section for pure edit tasks
- **`BlockName`** — `Layer/path/to/BlockName.block.ts` (API), `Layer/path/to/BlockNameBlock.tsx` (Admin/Site)
  Registered in: `PageContentBlock`, `ContentGroupBlock`
- **`ListItemBlockName`** — registered in `ListBlockName`
- **`ListBlockName`** — registered in `PageContentBlock`

### Blocks edited          ← omit entire section for pure creation tasks
- **`BlockName`** — added `fieldName` (string), removed `oldField`, changed `image` from `PixelImageBlock` → `DamImageBlock`

### Migrations created     ← CONDITIONAL: only include if a migration was created
- **`BlockNameV2Migration`** — `api/src/documents/pages/blocks/migrations/block-name.migration.ts`
  Reason: [brief reason, e.g., "renamed `headline` → `title`", "added required `variant` field"]

### Fixtures
- **`BlockNameFixtureService`** — `api/src/db/fixtures/blocks/block-name-fixture.service.ts`
- **`ListItemBlockNameFixtureService`** — `api/src/db/fixtures/blocks/list-item-block-name-fixture.service.ts`
  ← omit this section if no fixture services were created or modified
```

---

## Rules

**Created blocks section:**

- List every new block file created. Include both the list block and its item block as separate entries.
- For each block, show its registration target(s). If registered in multiple parents, list all: `registered in \`PageContentBlock\` and \`ContentGroupBlock\``.
- If the item block is "registered in" a list block, make that explicit: `registered in \`TeaserListBlock\``.

**Edited blocks section:**

- Describe each change concisely: `added \`fieldName\` (type)`, `removed \`fieldName\``, `changed \`fieldName\` from X → Y`.
- List each changed block as a separate bullet.

**Migrations section (conditional):**

- Include only when one or more migration classes were created.
- State the migration class name and file path.
- Give a one-line reason (what data shape changed and why).

**Fixtures section:**

- Include when fixture services were created or meaningfully updated.
- Omit entirely when no fixture work was done.
- List each fixture service separately with its file path.
- If an existing fixture was only wired (not created), note it as "updated `ParentFixtureService` to include `BlockNameFixtureService`".

---

## Example — Block creation with list block and migration

```
## Summary

### Blocks created
- **`TeaserItemBlock`** — registered in `TeaserListBlock`
- **`TeaserListBlock`** — registered in `PageContentBlock`, `ContentGroupBlock`

### Migrations created
- **`TeaserListBlockV2Migration`** — `api/src/documents/pages/blocks/migrations/teaser-list-block.migration.ts`
  Reason: added required `variant` field (existing data defaults to `"primary"`)

### Fixtures
- **`TeaserItemBlockFixtureService`** — `api/src/db/fixtures/blocks/teaser-item-block-fixture.service.ts`
- **`TeaserListBlockFixtureService`** — `api/src/db/fixtures/blocks/teaser-list-block-fixture.service.ts`
```

---

## Example — Editing an existing block, no migration

```
## Summary

### Blocks edited
- **`HeroBlock`** — added `subtitle` (string, optional), changed `image` from `PixelImageBlock` → `DamImageBlock`

### Fixtures
- Updated **`HeroBlockFixtureService`** — added `subtitle`, updated `image` field to `DamImageBlock` input format
```

---

## Example — Pure creation, no fixtures

```
## Summary

### Blocks created
- **`QuoteBlock`** — registered in `PageContentBlock`
```
