---
"@dextinity/cms-api": minor
---

Add migration scopes to block migrations

A block's `version` is a single counter, so only one party can advance it. When a block is configured by a project but also receives migrations from a library — for instance `createTipTapRichTextBlock` with `migrateFromDraftJs`, which reserves version 1 — the project has to continue the library's numbering, and the numbers collide as soon as the library adds another migration.

A migration scope is an independent chain of migrations for the same block. Each scope counts its versions from 1, regardless of the block's `version` and of every other scope. The counters are stored per block instance in `$$versions`, next to the existing `$$version`.

Scopes are optional: a block whose migrations you fully own keeps using `version` and `migrations`, and existing block data is unaffected because a new scope starts at 0 for it.

**Example**

```ts
export const RichTextBlock = createTipTapRichTextBlock(
    { link: LinkBlock, migrateFromDraftJs: true },
    {
        name: "RichText",
        migrate: {
            scopes: {
                project: {
                    version: 1,
                    migrations: typeSafeBlockMigrationPipe([ChangeEyebrowMigration]),
                },
            },
        },
    },
);
```

To move a migration that has already run into a scope, use `initialVersionFromLegacy` to derive the scope's starting version from `$$version`, so the migration is not applied a second time:

```ts
initialVersionFromLegacy: (legacyVersion) => (legacyVersion >= 2 ? 1 : 0),
```
