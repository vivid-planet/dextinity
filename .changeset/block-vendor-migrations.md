---
"@dextinity/cms-api": minor
---

Add vendor migrations to blocks

A block's `version` is a single counter, so only one party can advance it. That doesn't work for a block that receives migrations from the library providing it as well as from the application using it: `createTipTapRichTextBlock` with `migrateFromDraftJs` took version 1, so the application had to know that and start its own migrations at 2 — and the numbers collided as soon as the library added a migration of its own.

The migrations that ship with a block are therefore declared in `migrateVendor`, next to the `migrate` option the application fills. They form a chain of their own, counting from 1 independently of the block's `version`, stored per block instance in `$$vendorVersion`, and they run before the block's own migrations. Both options stay separate, so neither side can overwrite the other's migrations.

**Example**

```ts
createBlock(VideoBlockData, VideoBlockInput, {
    name: "Video",
    migrate: {
        version: 1,
        migrations: typeSafeBlockMigrationPipe([ChangeTitleMigration]),
    },
    migrateVendor: {
        version: 1,
        migrations: typeSafeBlockMigrationPipe([ChangeAspectRatioMigration]),
    },
});
```

The migrations of the blocks Dextinity ships — `ExternalLinkBlock`, `YouTubeVideoBlock`, `DamVideoBlock` and the Draft.js migration of `createTipTapRichTextBlock` — moved into their vendor chain. Existing content doesn't need to be touched: the version it was saved with is split into the two counters when it is loaded.

A block extending one of those blocks inherits its vendor migrations along with its data, so it runs them before its own migrations without declaring them, and its own migrations start at 1. `ExternalLinkBlockData`, `YouTubeVideoBlockData`, `DamVideoBlockData` and their input classes are exported for that.

Deploy this before content is saved with it: once a block instance has been saved with `$$vendorVersion`, an older Dextinity version reads its vendor chain as unmigrated and migrates it a second time.

**Migrating existing `migrateFromDraftJs` blocks**

The Draft.js → TipTap migration is now a vendor migration, so it no longer occupies version 1 of the block. Renumber the migrations of a block that uses `migrateFromDraftJs`, so they start at 1 again:

```diff
 export const TipTapRichTextBlock = createTipTapRichTextBlock(
     { link: LinkBlock, migrateFromDraftJs: true },
     {
         name: "TipTapRichText",
         migrate: {
-            version: 2,
+            version: 1,
             migrations: typeSafeBlockMigrationPipe([Heading1ToHeading2Migration]),
         },
     },
 );
```

Lower the `toVersion` of each of those migrations by one as well.
