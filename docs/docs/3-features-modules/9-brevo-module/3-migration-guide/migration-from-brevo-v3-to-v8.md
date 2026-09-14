---
title: Migrating from v3 to v8
sidebar_position: -8
---

:::info
We moved the brevo packages from the [comet-brevo-module](https://github.com/vivid-planet/comet-brevo-module) repo to the main [comet](https://github.com/vivid-planet/dextinity) monorepo.
From now on, versions are coupled to the comet core packages. That's why there is a jump from v3 to v8.
:::

## Prerequisites

v8 of the `@comet/brevo-*` packages requires v8 for all other `@comet/` packages.
Check out the [migration guide](/docs/migration-guide/migration-from-v7-to-v8).

## API

There should be no necessary changes in the API.

## Admin

### Brevo prefix for entities and GraphQL operations

All entities and GraphQL operations have been prefixed with `brevo` to prevent naming issues in projects.

This should only affect you in one place: Update the entity name in the `additionalPageTreeNodeFieldsFragment` GraphQL fragment from `TargetGroup` to `BrevoTargetGroup` in the `targetGroupFormConfig`.

```diff title="admin/src/common/brevoModuleConfig/targetGroupFormConfig.tsx"
export const additionalPageTreeNodeFieldsFragment = {
    fragment: gql`
-       fragment TargetGroupFilters on TargetGroup {
+       fragment TargetGroupFilters on BrevoTargetGroup {
            filters {
                SALUTATION
                BRANCH
            }
        }
   `,
    name: "TargetGroupFilters",
};
```

## Site

### Remove `@comet/brevo-mail-rendering` package

The `@comet/brevo-mail-rendering` package was removed.
It only exported the `NewsletterImageBlock`.
If you used this block, copy it to your project from the [old repository](https://github.com/vivid-planet/comet-brevo-module/tree/main/packages/mail-rendering).

### Recommended: Use `@comet/mail-react` for block factories

The new `@comet/mail-react` contains mjml-compatible implementations of the block factories

- `BlocksBlock`
- `ListBlock`
- `OneOfBlock`
- `OptionalBlock`

If you need any of these factories, you can import them from this package.

### Note: Migration to app router (optional)

It's not necessary to migrate to app router. You can stay on pages router without problems.

But if you want to migrate your project to app router, this PR could be helpful for the implementation: https://github.com/vivid-planet/dextinity/pull/5012.
