---
"@dextinity/cli": major
"@dextinity/cms-api": major
"@dextinity/cms-admin": major
"@dextinity/site-react": major
"@dextinity/site-nextjs": major
"@dextinity/mail-react": major
---

Allow `null` in optional block fields

Optional block fields, i.e., fields with `@BlockField({ nullable: true })`, can be `undefined` or `null`.
The properties of the library blocks are typed as `?: T | null`, and `generate-block-types` generates `?: T | null` instead of `?: T` for these fields.

```diff
  export interface AnchorBlockData {
-     name?: string;
+     name?: string | null;
  }
```

When typing a custom block field as `?: T | null`, pass the type to `@BlockField` explicitly, e.g. `@BlockField({ type: "string", nullable: true })`. TypeScript emits `Object` as the design type of a union with `null`, so it can't be inferred.

Values of optional fields can't be passed to props that only accept `undefined` anymore. Convert them where needed, e.g., `name ?? undefined`.
Strict comparisons with `undefined` (`name === undefined`) miss `null`, and default values (`{ name = "" }`) don't apply to `null`.
See the migration guide for details.
