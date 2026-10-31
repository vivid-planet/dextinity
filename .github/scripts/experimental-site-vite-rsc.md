# @vivid/experimental-site-vite-rsc

`@dextinity/site-vite-rsc` isn't released on npmjs.org yet.
To try it out in projects, [release-experimental-site-vite-rsc.yml](../workflows/release-experimental-site-vite-rsc.yml) publishes it as `@vivid/experimental-site-vite-rsc` to the private npm registry of gitlab.vivid-planet.com (package registry of project 899, where the `@vivid` packages are published).
The public release of the `@dextinity/*` packages isn't affected.

## How it is released

- Every push to `site-vite-rsc` (or `site-vite-rsc-gitlab-release`) publishes a release; a manual run (`workflow_dispatch`) works once the workflow is on the default branch.
- [pack-experimental-site-vite-rsc.mjs](pack-experimental-site-vite-rsc.mjs) packs the built package with `pnpm pack` (which replaces the `workspace:` ranges with the versions of the workspace packages) and changes the name, the version and `publishConfig` in the packed `package.json`. The `package.json` in the repository stays as it is.
- The version is `<version of @dextinity/site-vite-rsc>-canary-<YYYYMMDDHHmm>-<short SHA>`, e.g. `10.11.0-canary-202610311551-7825fce`, published with the dist-tag `canary`.
- Without the `VIVID_GITLAB_NPM_TOKEN` secret, or with the `dry-run` input of a manual run, the workflow only runs `npm publish --dry-run`.

To inspect the package locally:

```bash
pnpm --filter '@dextinity/site-vite-rsc...' run build
node .github/scripts/pack-experimental-site-vite-rsc.mjs /tmp/experimental-site-vite-rsc
cd /tmp/experimental-site-vite-rsc/package && npm publish --dry-run --tag canary --userconfig /dev/null
```

## Installing it in a project

Add the registry and a token to the project's `.npmrc`. Use a personal or project access token with the `read_api` scope (or a deploy token with `read_package_registry`), never commit the token itself:

```ini
@vivid:registry=https://gitlab.vivid-planet.com/api/v4/projects/899/packages/npm/
//gitlab.vivid-planet.com/api/v4/projects/899/packages/npm/:_authToken=${GITLAB_NPM_TOKEN}
```

Projects that already install `@vivid/*` packages through the instance-level endpoint (`https://gitlab.vivid-planet.com/api/v4/packages/npm/`) can keep it: that endpoint finds the package, too, since project 899 belongs to the `vivid` group.

Then install the package in the site:

```bash
pnpm add @vivid/experimental-site-vite-rsc@canary
```

It is the same code as `@dextinity/site-vite-rsc`, so replace `@dextinity/site-vite-rsc` with `@vivid/experimental-site-vite-rsc` in the imports and in the Vite config, e.g. `import { dextinitySite } from "@vivid/experimental-site-vite-rsc/vite";`.
Follow [demo/site-vite-rsc](../../demo/site-vite-rsc) for the setup.

### Dependencies on `@dextinity/*`

The package depends on `@dextinity/site-react` with the exact version it was built with (currently `10.11.0`), which is published on npmjs.org.
`@dextinity/site-vite-rsc` re-exports `@dextinity/site-react`, so import everything from `@vivid/experimental-site-vite-rsc` and make sure the project resolves a single copy of `@dextinity/site-react`, e.g. by using the same version in the project.

`@dextinity/site-react` is published from `main`, so the experimental package only works as long as `site-vite-rsc` doesn't need unreleased changes of `@dextinity/site-react`.
Check this before publishing when the branch changes other packages: if it does, also publish the changed packages under `@vivid/*`, or wait for their release.
