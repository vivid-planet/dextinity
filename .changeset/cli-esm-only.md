---
"@dextinity/cli": major
---

Make `@dextinity/cli` ESM-only

The package is now published as an ES module with an `exports` map.
Programmatic consumers must `import` it instead of using `require()`, and deep imports such as `@dextinity/cli/lib/...` are no longer allowed.
The package only exports types (`BaseSiteConfig`, `ExtractPrivateSiteConfig`, `ExtractPublicSiteConfig`), so type-only imports keep working as long as your `moduleResolution` supports `exports` (`node16`, `nodenext` or `bundler`).

The `dextinity` command works as before.
`inject-site-configs` now loads the site-configs file with [jiti](https://github.com/unjs/jiti) instead of `ts-node`.
TypeScript site configs with extensionless relative imports keep working, but `ts-node` is no longer installed with the CLI.
`inject-site-configs` no longer fails on type errors in the site configs, because jiti only strips the types.
Type-check them with your project's `tsc` or lint step instead.
