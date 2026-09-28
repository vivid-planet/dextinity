---
name: dextinity-minor-update
description: Performs a minor or patch version bump of all @dextinity/* packages across a Dextinity project (root, api, admin, and any site packages — zero, one, or many) to the newest version within the current major from npm, then installs. Use when the user asks to update Dextinity, bump Dextinity packages, do a minor Dextinity update, or upgrade Dextinity to the latest patch/minor of the current major.
---

# Dextinity Minor/Patch Update Skill

A Dextinity project is not an npm workspace — the repo root, `api/`, `admin/`, and any site packages (zero, one, or many) each have their own `package.json` and `package-lock.json`. A minor or patch Dextinity update therefore means updating every occurrence of every `@dextinity/*` dependency across those files to the same new version, then running `npm install` in each directory so each lockfile picks up the new version.

This skill covers **minor and patch** updates within the current major only (e.g. `8.20.4 → 8.21.0`). Major upgrades (e.g. `8.x → 9.x`) are different — they typically ship breaking changes, codemods, and migration guides, and are out of scope here.

## Invariants

Two rules hold across every `@dextinity/*` core package in the project, before and after the update:

- **Pinned versions only.** Every core `@dextinity/*` entry must be an exact version (e.g. `8.21.0`), never a range (`^8.21.0`, `~8.21.0`, `>=…`). If you see a caret or tilde on a core package, the project is in a broken state — stop and tell the user.
- **All core packages on the same version.** Every core `@dextinity/*` package in the project must be pinned to the same version across every `package.json`. There is no supported mix-and-match.

These rules apply only to the core set (packages released together from the Dextinity monorepo). Any other `@dextinity/*` package a project happens to depend on is out of scope — see Step 1.

## When to use

- "Do a minor dextinity update"
- "Update dextinity" / "bump dextinity" / "update all dextinity packages"
- "Upgrade to the latest patch of the current major"
- "Update `@dextinity/cms-api` and friends to the newest 8.x"

If the user asks for a **major** bump (crossing major versions), stop and tell them this skill only covers minor/patch updates.

---

## Workflow

1. [Find all `@dextinity/*` dependencies and their current version](#step-1--find-all-dextinity-dependencies)
2. [Find the newest version in the current major on npm](#step-2--find-the-newest-version-in-the-current-major)
3. [Update every `package.json`](#step-3--update-every-packagejson)
4. [Install](#step-4--install)
5. [Verify](#step-5--verify)
6. [Report the result](#step-6--report-the-result)

---

## Step 1 — Find all @dextinity dependencies

The repo root, `api/`, and `admin/` always have a `package.json`. Site packages are variable: a project may have none (api/admin only), a single site at `site/`, or several sites — often under `sites/`, though the location is not guaranteed. Discover them by content rather than path — any `package.json` outside `node_modules` that depends on `@dextinity/site-nextjs` or `@dextinity/site-react` is a site package.

```bash
grep -rl --include='package.json' --exclude-dir=node_modules \
  -E '"@dextinity/site-(nextjs|react)"' . | xargs -n1 dirname
```

Save the resulting list of site directories — Steps 3, 4, and 5 reuse it. **A project with no site packages is valid** — the grep returns nothing and the rest of the workflow only touches the root, `api/`, and `admin/`. Don't treat the empty result as an error.

Then collect every `@dextinity/*` entry across the root, `api/`, `admin/`, and each site directory's `package.json`:

```bash
grep -n '"@dextinity/' package.json api/package.json admin/package.json \
  <site-dir>/package.json ...
```

Notes:

- Not every `@dextinity/*` dependency you find follows the core release cadence. **Only** bump packages whose current version matches the core Dextinity version (the one shared by `@dextinity/cms-api`, `@dextinity/admin`, `@dextinity/site-nextjs`, etc.). Leave the others untouched.
- Use the invariants to tell core from non-core: core packages are all pinned to the same exact version, with no caret or tilde. Anything with a range or a different version is not core — verify before touching it.
- If you find core packages on different versions, or any core package using a range (`^`, `~`), the project violates the invariants. Stop and tell the user — don't paper over it by bumping.

Confirm the **current major** from the version string (e.g. `8.20.4` → major `8`).

---

## Step 2 — Find the newest version in the current major

Use `npm view` on any single core package to list versions, then filter to the current major and drop pre-releases (anything containing `-canary`, `-beta`, `-rc`, etc.):

```bash
npm view @dextinity/cms-api versions --json | \
  python3 -c "import json,sys; v=json.load(sys.stdin); \
    stable=[x for x in v if x.startswith('8.') and '-' not in x]; \
    print(stable[-1])"
```

Substitute `8.` with whatever the current major is. The last entry in the filtered list is the target version.

Sanity check: the target must be **greater than or equal to** the current version. If it is lower or equal, there is nothing to do — tell the user and stop.

Core `@dextinity/*` packages are always released together at the same version, so checking any single one is enough — no need to verify the target version for each package individually.

---

## Step 3 — Update every package.json

Update every occurrence of the current version to the new version inside `@dextinity/*` entries across every `package.json` from Step 1 (the root, `api/`, `admin/`, and each site directory). Write the new version **pinned** (e.g. `8.21.0`) — never add a caret or tilde, even if one was present before. Every core package must end up on the same target version (see Invariants).

Before editing, do a quick check that the old version string doesn't appear elsewhere in those files (i.e. on non-`@dextinity` packages pinned to the same version by coincidence):

```bash
grep -n '<OLD_VERSION>' package.json api/package.json admin/package.json \
  <site-dir>/package.json ...
```

If every match is a `@dextinity/*` line, you can safely edit each file. If there are non-`@dextinity` matches, edit the `@dextinity` lines individually.

**Do not touch** `@dextinity/*` packages that don't share the core version — see Step 1.

---

## Step 4 — Install

Install in the root first, then in each sub-package. In a sandboxed environment you may not be able to run the sub-installs in parallel (`&` can fail) — run them sequentially if parallel fails.

```bash
npm install
npm --prefix api install
npm --prefix admin install
# Then, for each site directory discovered in Step 1:
npm --prefix <site-dir> install
```

What a successful run looks like:

- npm prints `changed N packages` or `up to date` (both are fine — "up to date" means the lockfile was already correct for the new version range).
- No `ERESOLVE`, `EBADENGINE`, `404`, or `EACCES` errors.
- Harmless warnings you can ignore:
    - `npm warn tar TAR_ENTRY_ERROR ENOENT …` during extraction
    - `npm fund` / `npm audit` summaries
    - Deprecation warnings on transitive deps

After each install, verify the lockfile actually moved:

```bash
grep '"@dextinity/cms-api":' api/package-lock.json | head -3
```

The direct-dependency line should show the new version.

### If install fails

If any install fails because of the **sandbox** (no network access to the npm registry, read-only filesystem on `node_modules`, EPERM/EACCES on a lockfile, etc.): **stop and ask the user to run the installs themselves**. Do not try to work around it by retrying with different flags or disabling the sandbox — this is an environment problem, not a dependency problem. The `package.json` files are already edited, so the user just needs to run the `npm install` commands from Step 4.

If any install fails with a real error (peer-dependency conflict, missing version, registry auth, etc.): **stop immediately and tell the user**. Do not attempt `--force`, `--legacy-peer-deps`, manual lockfile edits, or destructive resets — the user needs to diagnose the failure, often because it indicates a broader incompatibility (e.g. a peer dep that also needs bumping, or a transitive regression).

In either case, report: which directory failed, the exact error lines, and the state of the `package.json` files (they have already been edited — mention this so the user knows).

---

## Step 5 — Verify

Run lint and tests in each sub-package that defines them, and report the results. Do **not** start the dev server — that's the user's job (see Step 6 for why).

For each of `api/`, `admin/`, and every site directory discovered in Step 1, check the `package.json` `scripts` block and run whatever is defined:

```bash
npm --prefix <dir> run lint --if-present
npm --prefix <dir> test --if-present
```

`--if-present` makes npm exit 0 silently when the script is missing, so you can run the full set without first checking which scripts exist.

If a project has a top-level lint/test script in the root `package.json`, run that too.

What to do with the output:

- **All green:** mention it briefly in the report.
- **Failures:** report the failing command, the directory, and the first few error lines. Do not attempt to fix lint/test failures — they may indicate a real regression in the new Dextinity version, or pre-existing issues unrelated to the bump. The user decides.
- **Type errors specifically:** these often come from stale generated files (`block-meta.json`, GraphQL schema) that only refresh when the app boots. Flag this possibility in the report so the user knows to start the dev server before assuming the bump broke types.

---

## Step 6 — Report the result

Tell the user:

- The old version → the new version
- Which `package.json` files were touched
- That each lockfile was updated and install succeeded
- The verify results (lint/tests green, or which ones failed and where)
- Anything suspicious you noticed (e.g. "the api/ install emitted a peer-dep warning about X — probably benign but worth a look")
- **Remind the user to start the app once** (`npm run dev`). A minor Dextinity release can ship changes to generated artifacts like `block-meta.json` or the GraphQL schema, which are only regenerated when the app boots. Without this step, stale generated files can cause confusing type errors or runtime mismatches.

---

## Common pitfalls

| Pitfall                                               | How to avoid                                                                                        |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Picking a canary/beta as "newest"                     | Filter out any version containing `-` in Step 2.                                                    |
| Bumping a non-core `@dextinity/*` package by accident | Only bump packages pinned to the shared core version — see Step 1.                                  |
| Forgetting the root `package.json`                    | The repo root has its own `package.json` with `@dextinity/cli`. Always include it in the grep.      |
| Assuming "up to date" means the install did nothing   | It means the lockfile already satisfies the new range. Verify with `grep` against the lockfile.     |
| Running installs in parallel in a sandbox             | If `&` backgrounding fails, just run the installs sequentially. Takes a bit longer, works reliably. |
| Crossing a major version                              | This skill is minor/patch only. Stop and warn the user.                                             |
