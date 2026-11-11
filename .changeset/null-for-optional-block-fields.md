---
"@dextinity/cli": major
"@dextinity/cms-api": major
"@dextinity/cms-admin": major
"@dextinity/site-react": major
"@dextinity/site-nextjs": major
"@dextinity/mail-react": major
---

Use `null` for optional block fields

An optional block field, i.e., a field with `@BlockField({ nullable: true })`, is always present and `null` when it has no value, never `undefined`.
The properties of the library blocks are typed as `T | null`, and `generate-block-types` generates `T | null` instead of `?: T` for these fields:

```diff
  export interface AnchorBlockData {
-     name?: string;
+     name: string | null;
  }
```

Block inputs must contain optional fields: `null` is accepted, a missing field fails validation.
Validate custom optional fields with `@IsNullable()` instead of `@IsOptional()` or `@IsUndefinable()`, and pass the type to `@BlockField` explicitly, e.g. `@BlockField({ type: "string", nullable: true })`. TypeScript emits `Object` as the design type of a union with `null`, so it can't be inferred.

Existing block data is migrated when it's loaded: missing optional fields are set to `null`. The `migrateBlocks` command persists the migrated data.

In the Admin, use `null` instead of `undefined` as the default value of optional fields. `BlocksFinalForm` submits a cleared field as `null`.
See the migration guide for details.
