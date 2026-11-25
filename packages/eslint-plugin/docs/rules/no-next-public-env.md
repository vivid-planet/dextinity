# @dextinity/no-next-public-env

📝 Disallow reading `NEXT_PUBLIC_*` environment variables.

<!-- end auto-generated rule header -->

Next.js replaces `process.env.NEXT_PUBLIC_*` with its value when it builds the site. The value is then fixed in the build, so the same build can't run with different values in different environments, for example staging and production. Use site configs or a custom provider instead, see [Environment variables in the site](https://cms-docs.dextinity.com/docs/faqs/environment-variables-in-site).

## Examples

Code that fails:

```ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const { NEXT_PUBLIC_API_URL } = process.env;
```

Code that passes:

```ts
const apiUrl = process.env.API_URL;
```

## Presets

Enabled as `error` in the `nextjs` preset of `@dextinity/oxlint-config`. The rule also works as an oxlint JS plugin.
