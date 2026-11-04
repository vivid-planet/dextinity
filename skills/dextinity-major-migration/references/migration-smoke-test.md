# Migration Smoke-Test

Run after a major migration finishes (lint/tsc green, all commits pushed) to catch runtime regressions that lint and tsc can't see.

## Project shape

The dispatching prompt should tell you the project shape — the list of sites with their dev URLs/ports. **Use what's in the prompt; don't re-run discovery `grep`.**

The dispatching prompt states the site list and whether a page tree is present. Decide each pass on its own signal:

| Pass           | Run it when...                               |
| -------------- | -------------------------------------------- |
| Admin pass     | always                                       |
| Page-tree CRUD | the prompt says a page tree is present       |
| Site pass      | one or more sites are listed (once per site) |

For multi-site projects, the site pass runs **once per site** — each has its own sitemap and regression surface. A Next.js major can break one site while leaving another working.

Note the shape (verbatim from the prompt) at the top of `test-report.md` so the reader knows what was and wasn't covered.

**Fallback if the prompt is missing this info:** scan `package.json` files for `@dextinity/site-nextjs` and flag the gap in your summary.

```bash
grep -l '"@dextinity/site-nextjs"' $(find . -name package.json -not -path '*/node_modules/*' -not -path '*/.next/*')
```

## Prerequisites

1. **Services running.** `dev-pm status`; admin, api, and codegens must be `Running`. Site only matters if `@dextinity/site-nextjs` exists. Restart any that aren't.
2. **Fixtures loaded.** `npm --prefix api run fixtures` — for projects with a page tree, this seeds the sitemap URLs. Re-run if the migration changed seed/slug logic.
3. **Drive via Playwright MCP** (`browser_*` tools) so console errors are captured. `curl` is fine for HTTP-status sweeps but won't see hydration/DOM-prop errors.
4. **Fresh repo-root `test-report.md` ready to write to.** Append findings as you go.

## Inventory the surface

Skip if the project already has an authoritative inventory file. Otherwise:

- **Admin routes:** read `admin/src/common/MasterMenu.tsx` (or equivalent), list every `path:` entry, group by section.
- **Admin grids/forms:** for each route, identify writable entities (Add/Edit/Delete) — those need a full CRUD pass.
- **Site URL buckets** _(skip if no site package)_: fetch the site's `sitemap.xml` (find the dev URL/port it listens on via `dev-pm status`). Parse `<loc>` entries, classify into buckets by URL pattern.

Keep inventory in scratch; don't write to `test-report.md` yet.

## Admin pass

For each admin route:

1. `browser_navigate` to it.
2. `browser_snapshot` to confirm rendering — `<main>` with content vs empty/error fallback.
3. `browser_console_messages level=error` and `level=warning`. Record error/warning counts and one-line excerpts (~120 chars).
4. For writable entities, run CRUD:
    - **Add:** open form, fill required fields with `playwright-smoke-<timestamp>`. Save.
    - **Edit:** change one field, save.
    - **Delete:** remove the record. If no delete control, verify the underlying mutation works via console `fetch('/api/graphql', ...)` before declaring the API broken.
    - If Save fails, capture the error and skip Edit/Delete to avoid half-state.

### Page Tree CRUD is mandatory (when a page tree is present)

**Skip if the project has no page tree** (the dispatching prompt says whether it does).

Otherwise: the page tree exercises the most upstream code paths (block editor, RTE, file picker, page-tree GraphQL, route-tab navigation). Run a full Add → Edit → Delete on at least one page-tree category:

1. Open the page tree in the admin (find it via the menu). Pick any category.
2. **Add:** create a page, fill the required fields, save. Confirm the row appears and the URL is clean.
3. **Edit:** open the page. **Walk every tab the page-edit view exposes.** Capture console after each tab switch. Change one field, save, reload, verify it persisted.
4. **Delete:** remove the page and confirm the row is gone.

If any step fails, that's a blocker for the PR.

After the run, delete any test records (or note them in `test-report.md`).

### Baseline errors

A project may have a few errors that fire on _every_ admin page. Identify these once and call them "baseline" — count per-route errors _above_ baseline rather than reporting baseline N times.

## Site pass

**Skip this section entirely if no `@dextinity/site-nextjs` package.** Note "no site package, site pass skipped" in `test-report.md` and stop here.

**For multi-site projects, run once per site.** Each has its own sitemap, routes, and regression surface. Sites typically expose themselves:

- Each site config declares its `domains` (a main domain plus any additional ones). Locally these resolve to `localhost`, usually as distinct subdomains (e.g. `<site>.localhost:<port>`); check the site configs and `dev-pm status` for each site's dev URL.
- Hit a specific site with its dev URL.

Write per-site results under their own subheading (e.g. `### Site: <site-name> (<dev-url>)`).

1. Fetch `sitemap.xml`, parse `<loc>` entries.
2. **Bucket URLs** by pattern (locale-prefixed, fixture/scaffold, normal pages, ...). Some buckets need sampling; small ones can be exhausted.
3. **Pick a seeded sample.** Common shape: 20 normal + all of any small bucket the user cares about. Use a deterministic shuffle for reproducible runs.
4. For each picked URL: navigate, snapshot, collect errors/warnings.
5. For high-volume buckets, **bulk-fetch HTTP status first**: `curl -s -o /dev/null -w "%{http_code}"` catches blanket 404s in seconds. Browser-walk 200s plus a handful of 404s to see the error page.
6. **Bytes-check sitemap URLs with special characters.** If a `<loc>` contains `:`, `?`, `#`, `&`, or other RFC 3986 sub-delims, verify it resolves. Use `od -c` to confirm a colon is real, not a `&#58;` artifact.

### Embedded webcomponents (high-risk)

If the site embeds third-party **webcomponents** / micro-frontends — a block that loads an external `<script>` mounting a widget owned by another team — treat every page that renders one as high-risk and test each webcomponent **individually in the browser**.

Webcomponents can crash at runtime while lint, `tsc`, and the build all pass.

1. **Detect:** `grep -rnE "customElements|next/script|<script" site/src`, plus any block whose job is to embed an external widget.
2. **Browser-test each webcomponent type** (not just each page): navigate to a page that renders it, confirm it actually **mounts and is interactive** — a 200 status or a rendered page shell is not enough — and capture console errors.
3. A crash here is a **production blocker**, not a warning.
4. Call out every webcomponent and its result explicitly in `test-report.md`, and tell the user to verify each one on staging **before deploying to production**.

### Side effect of 404s

Any URL that falls through to not-found may produce _additional_ errors from the not-found page itself. Don't count these against the per-URL budget — they're a single not-found bug surfacing N times.

## Triage findings

Apply one of three labels _while_ walking, not after:

1. **Project-fixable** — broken code is under `admin/src`, `site/src`, `api/src`. Belongs in the migration PR or a follow-up.
2. **Dextinity upstream** — broken code is under `node_modules/@dextinity/*`. Surface to the user; don't workaround.
3. **Pre-existing / out-of-scope** — same warning pre-existed the migration. Note once at the bottom; don't itemize per-route.

If you can't tell which bucket, grep for the symbol in the project source — if absent, it's upstream or a transitive dep.

## Output: `test-report.md`

Write findings to `test-report.md` at the repo root as you go. The file is the deliverable.

```markdown
# Smoke-test findings — <date>

Tool: Playwright MCP (Chromium). Branch: `<branch>`.
Sites detected: <none | list of site dirs + dev URLs>.
Page tree: <present | absent>.
Scope: <admin route count> admin routes; per site, <URL count> sampled from <total>.

## TL;DR — biggest problems first

<5–8 numbered bullets, ordered by user impact, each with file path or error excerpt>

## Session-global console errors (every admin page)

<the 0–2 baseline errors, called out once>

## Admin

### <route>

- **Screen**: clean | "<visible error>"
- **Console**: <n> errors, <m> warnings (above baseline)
    - <one-line excerpt of each>
- **CRUD** (if applicable): create/edit/delete: ok | failed (<why>)

## Sites

(One block per site. Skip the section entirely if no sites.)

### Site: <site-name> (<dev-url>)

#### Sampling

- Sitemap total: <n> URLs in <bucket-count> buckets.
- Sample: <breakdown by bucket>.

#### Per-URL results

<grouped by error class, e.g. "0 errors", "1 error — <error string>">

## Hand off to Dextinity upstream

<numbered list of upstream bugs with @dextinity/\* module paths>

## Numbers

- Admin routes visited: <n>. Broken: <n>. With extra console errors: <n>.
- Site URLs sampled: <n total>. HTTP 200: <n>. HTTP 404: <n>.

## Cleanup

- Test records left in DB: <list or "none">.
```

Avoid one heading per URL when most look the same — group by failure mode. Five URLs with the same console warning are one finding with five examples.

## Re-verify after fixes

After the engineer fixes project-fixable findings:

1. **Re-run failing scenarios in the browser** — not just the unit test. Green `tsc` doesn't tell you if the URL resolves.
2. **For each "Fixed" item**: load a previously-broken URL, capture console, confirm the specific error string is gone. A different error could have replaced it.
3. **Re-run fixtures if the migration changed seed/slug logic** before re-checking site URLs.
4. **Bytes-check the sitemap** for previously-broken patterns (use `od -c`, not just `grep`).
5. **Update `test-report.md`** with a "Fixed in this branch" section. Keep upstream/out-of-scope findings in place.

Useful pattern: ask "commit each fix atomically?" before starting — answer is almost always yes — and re-run the smoke test after to confirm hooks didn't revert anything.

## When to stop and ask the human

- **Hundreds of URLs in a bucket all 404.** Route-group regression, not N bugs. Stop after the first 5–10 confirm the pattern.
- **A console error mentions a file you can't locate** under `src/` or `node_modules/@dextinity/*`. Ask, don't guess.
- **CRUD test fails with a 500 suggesting data corruption** (FK violation, dangling reference). Stop before continuing; test data may be polluting subsequent runs.
- **Playwright MCP can't reach the dev server** (timeouts, ECONNREFUSED). Check `dev-pm status`; if everything is `Running` but unreachable, surface the discrepancy before random restart commands.
