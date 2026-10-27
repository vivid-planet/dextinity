# Architecture decisions: serverless (Dextinity on Cloudflare Workers)

Status: decided in principle, 2026-10-24. Applies to the API and the admin. The site is out of scope.

The decisions are based on prototypes and experiments run in the Workers runtime (workerd, locally). Nothing was deployed to Cloudflare yet. The prototype implements them for the DAM and the page tree with its documents: the package `@dextinity/serverless` is in [`packages/serverless`](packages/serverless) (see its README), the demo in [`demo/serverless`](demo/serverless).

## Goals

1. Works well on Cloudflare: fast and efficient (performance is important)
2. Flexible database: PostgreSQL **or** Cloudflare D1, chosen per project
3. Modern and future-proof
4. Works well for AI and fast coding

Not goals:

- Keeping as much of the existing code as possible (a plus, not a requirement)
- Keeping GraphQL or MikroORM if they bring no advantage

Future direction:

- Give up the split between API and admin
- Port all of the repository, starting with the DAM

## Summary

| Area           | Decision                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Runtime        | Cloudflare Workers, one Worker per project: admin as static assets, API at `/api`                  |
| HTTP / API     | Hono, REST, zod validation, typed client (`hc`) per module                                         |
| Database       | Drizzle; D1 or PostgreSQL (via Hyperdrive) per project; no interactive transactions                |
| Admin app      | Vite single-page app, no server rendering; `@dextinity/admin` unchanged; TanStack Query for data   |
| Routing        | React Router (client-only); for now v5 as used by `@dextinity/admin`                               |
| Package        | One package `@dextinity/serverless` with `./server`, `./client` and `./vite`; a folder per feature |
| Authentication | Cloudflare Access; dev-only Access emulator for local dev                                          |
| Authorization  | Dextinity's permission model, ported as its own module                                             |
| Files          | R2                                                                                                 |
| Images         | Cloudflare Images via the Workers Images binding, replacing imgproxy                               |
| Blocks         | Admin: the block framework of `@dextinity/cms-admin`; API: zod schemas; documents stored as JSON   |

## 1. Runtime and HTTP framework: Hono on Cloudflare Workers

**Decision:** Hono on Cloudflare Workers. NestJS is dropped.

Options considered:

| Option                                                                      | Result                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NestJS + Express + Apollo + MikroORM 7 on Workers (via `httpServerHandler`) | Works, but needs workarounds: tsc before bundling (esbuild emits no decorator metadata), aliases for Nest's optional packages, pointing `@nestjs/graphql` at its Node entry (its `browser` export is a shim). 1.6 MB gzipped for a minimal app. Nest rebuilds its dependency graph and GraphQL schema on every new isolate. Not officially supported. |
| Hono + TypeGraphQL + GraphQL Yoga + MikroORM 7                              | Works. 761 KB gzipped.                                                                                                                                                                                                                                                                                                                                |
| Hono + REST + Drizzle (prototype)                                           | Works. 330 KB gzipped for the DAM prototype. No startup work.                                                                                                                                                                                                                                                                                         |

Reasons:

- Smallest bundle and no startup work per isolate
- Built on web standards, officially supported on Workers
- Well known to AI tools; plain code without decorators and dependency injection

How NestJS concepts map to the prototype:

| NestJS                                            | Hono                                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `Module.register(options)`                        | `createDamModule(options)` returning schema, provider middleware and routes    |
| Providers, `@Injectable()`, constructor injection | Plain classes wired in a container per request (`createDamServices()`)         |
| `forwardRef()`                                    | Services reference each other through the container                            |
| Module imports                                    | Dependencies in the request context: `provide()` / `inject()`                  |
| Module exports                                    | The provider sets `c.var.dam`                                                  |
| Request-scoped providers, `onModuleDestroy`       | `provide(key, factory, { dispose })` (Workers require I/O objects per request) |
| Controllers and resolvers                         | Hono sub-apps mounted with `app.route()`                                       |
| `ValidationPipe`, class-validator                 | zod with `zValidator`                                                          |
| `@RequiredPermission`, `@AffectedEntity`          | `requirePermission()` middleware plus checks in the handler                    |
| Exception filter                                  | `HTTPException` helpers and an error handler with the NestJS error shape       |

## 2. API style: REST with Hono

**Decision:** REST with plain Hono and its typed client (`hc`). No GraphQL, no tRPC.

|                                             | REST (Hono + `hc`)                  | tRPC                       | GraphQL (Hono + Yoga + Pothos)                             |
| ------------------------------------------- | ----------------------------------- | -------------------------- | ---------------------------------------------------------- |
| Typed client                                | Inferred, no codegen                | Inferred, no codegen       | Codegen from the schema                                    |
| Binary endpoints (upload, download, images) | Same framework                      | Second system next to Hono | Second system next to Hono                                 |
| Feature packages                            | Export a sub-app, mount it (tested) | Export a router, merge it  | Schema stitching                                           |
| Cost per request on Workers                 | Smallest                            | Small                      | Highest (parse and validate each query, graphql-js bundle) |
| External consumers                          | OpenAPI via `@hono/zod-openapi`     | Weak                       | Strong                                                     |
| Concepts                                    | One                                 | Two                        | Three                                                      |

Reasons:

- One concept for JSON, binary endpoints and webhooks
- Typed end to end without a build step; works from pre-built packages (tested)
- GraphQL's advantages (field selection, existing queries) don't apply: the admin is rebuilt, and block data is already a JSON scalar in today's schema

Conventions (to be written up as a project skill):

- Resource-style paths
- A zod schema per route
- One error shape: `{ statusCode, message }`
- Paged lists return `{ nodes, totalCount }`
- One typed client per module (`hc<DamRoutes>`) instead of one for the whole app, to keep typechecking fast

If a public API becomes a product requirement: OpenAPI first (`@hono/zod-openapi`). A GraphQL layer on top of the same services only if field selection is needed.

## 3. Database layer: Drizzle

**Decision:** Drizzle. Each project uses D1 or PostgreSQL (via Hyperdrive).

|                                | Kysely                        | Drizzle                                                      | MikroORM 7                                                         |
| ------------------------------ | ----------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| Bundle on Workers              | 246 KB gzipped (both drivers) | 330 KB (DAM prototype)                                       | 761 KB, plus metadata discovery per new isolate and a compile step |
| Same code on D1 and PostgreSQL | Yes (measured)                | No: schemas per database, a service for both doesn't compile | Yes, but D1 support is experimental                                |
| Schema and migrations          | Not included                  | drizzle-kit                                                  | Included                                                           |
| Relations                      | Manual                        | Relational query API                                         | Richest (Unit of Work, change tracking)                            |
| AI familiarity                 | Good                          | Best                                                         | Lower                                                              |
| Future-proof                   | Stable, small                 | Very active; 1.0 in RC                                       | Niche; v7 is a breaking upgrade                                    |

Other options checked:

- Prisma 7: works on D1 (1.2 MB gzipped with the D1 adapter), needs a schema per database, and is being rewritten (Prisma Next, early access).
- MikroORM 6 (used today) can't run on Workers: it generates code with `new Function`, which Workers forbid.

Reasons for Drizzle over Kysely:

- Most productive day to day; best known to AI tools; standard on Cloudflare
- Schema, migrations and relational queries included

Consequences:

- Library code supports both databases with one definition (implemented in the prototype):
    - tables are defined once with `portableColumns(dialect)` (`@dextinity/serverless/server`), which returns SQLite or PostgreSQL column builders, both typed as SQLite;
    - services are written once against `database.drizzle`, typed as a SQLite database. Only what both dialects support may be used (no `.get()`/`.all()`/`.run()`), which the types don't enforce; the smoke test runs on both;
    - drizzle-kit generates the migrations per dialect from the same definition. Feature packages ship schema factories, the app generates the migrations, because the scope columns are the app's.
- D1 has no interactive transactions (only batches):
    - generate IDs in the app;
    - prefer single statements (e.g. cascading foreign-key deletes);
    - use batches for multiple writes.
- Portable SQL only:
    - recursive queries instead of PostgreSQL arrays (`mpath`);
    - `lower() LIKE` instead of `ILIKE`;
    - JSON stored as text;
    - full-text search needs an implementation per database.
- D1 limits: about 10 GB per database, writes go through a single SQLite instance. Large or write-heavy projects use PostgreSQL.
- On D1, migrations go through `wrangler d1 migrations apply`, which applies drizzle-kit's SQL files as they are (Kysely's migrator failed on D1). On PostgreSQL, Drizzle's migrator applies them.

## 4. Admin app: Vite single-page app, no server rendering

**Decision:** A Vite single-page app, served as static assets by the project's Worker. No server rendering.

|                                 | Plain Vite SPA + Hono                            | React Router (framework mode)                    | TanStack Start                                                               |
| ------------------------------- | ------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------- |
| Worker cost per admin page view | Lowest: assets served without running the Worker | Server rendering per navigation                  | Server rendering, can be switched off per route                              |
| Library packages                | Natural (Hono routes + components)               | Needs wrappers in the app (expected, not tested) | Server functions don't work from pre-built packages (tested); Hono routes do |
| Maturity                        | Highest                                          | Very mature                                      | Youngest                                                                     |

Reasons:

- The admin doesn't need server rendering
- Cheapest on Workers
- Library packages work without framework compilers

TanStack Start on Workers was tested and works (282 KB gzipped server code, 108 KB client), but its server functions only work from app source, not from pre-built packages.

Setup:

- One Vite project per app with Cloudflare's Vite plugin; local dev runs on the Workers runtime with real bindings (D1, R2, Hyperdrive)
- One package (`package.json`) for admin and API, like Cloudflare's React template and the full-stack frameworks: they are built, deployed and versioned together. Separate packages are for separately deployed apps (e.g. the site later).
    - Layout: the admin in `src/`, the API in `api/`, one tsconfig each, referenced from the root `tsconfig.json`
    - ESLint forbids imports between them; the admin uses the typed clients of the feature packages
- Data fetching with TanStack Query through the typed Hono client

## 5. Routing: React Router (client-only)

**Decision:** React Router as the client-side router.

- `@dextinity/admin` stays as it is, so for now React Router v5, which it is built on (`RouterBrowserRouter`, `Stack`, `StackLink`, the unsaved-changes prompt, URL state in `useDataGridRemote`). `demo/serverless` runs this way with React 19.
- Moving `@dextinity/admin` to React Router 8 (data mode, needed for `useBlocker`) is a separate, later library change. The main work is `Stack`/`StackSwitch`, which build URLs from v5's `match.url`. 22 files in `@dextinity/admin` use React Router.
- v5 is no longer developed: technical debt, not a blocker.

## 6. Admin UI library: `@dextinity/admin` unchanged

**Decision:** Keep `@dextinity/admin` (MUI) as it is.

Consequences:

- `@apollo/client` and `graphql` remain required peer dependencies and end up in the bundle, unused.
- Avoid the Apollo-bound parts:
    - `CrudContextMenu`: use `RowActionsMenu` with `DeleteDialog`;
    - `ErrorDialogHandler` (works through an Apollo link): use a TanStack Query error handler;
    - legacy table components, `useDataGridExcelExport`, generated GraphQL grids and forms.
- `FinalForm` works without Apollo (it reads it only if present).
- Shared admin glue goes into new small packages, not into `@dextinity/admin`:
    - the API client provider and the query error handler: `ApiProvider` and `QueryErrorHandler` in `@dextinity/serverless/client`;
    - `useCan`, also in `@dextinity/serverless/client`;
    - a REST variant of `CrudContextMenu` if needed.
- `@dextinity/cms-admin` (GraphQL) is replaced module by module and stays for existing projects meanwhile. Its block framework is reused, see [11. Blocks and documents](#11-blocks-and-documents).
- The admin generator needs new templates (TanStack Query + REST) targeting the same components.
- The theme, components and the `dextinity-admin-ui` skill stay the same.

## 7. Package

**Decision:** All features ship in one package, `@dextinity/serverless`, with a folder per feature (`core`, `permissions`, `blocks`, `dam`, `page-tree`). The name keeps it apart from the packages of the NestJS stack (e.g. `@dextinity/cms-api`) while both exist.

- `./server`: Hono routes, services, Drizzle schema, migrations
- `./client`: React components and hooks on `@dextinity/admin`, using the typed client
- `./vite`: the local development services (Access emulator, image transformer)

The features depend on each other (the DAM and the page tree on the permissions and the blocks, the page tree's documents on the DAM's blocks), so separate packages only added versions, builds and watchers to keep in step. The entry points keep the boundary that matters: the Worker imports `./server` only, the admin `./client` and the types of `./server`. Everything is exported with unique names, so a name clash between features fails the build.

The app mounts the routes and renders the components, e.g. `createDamModule` and `DamPage`. The route types are exported (`DamRoutes`), so clients get typed requests and responses. Both entry points are built with `tsc`, so the client part works without Babel.

## 8. Authentication: Cloudflare Access

**Decision:** Cloudflare Access handles login in front of the Worker. The Worker verifies the `Cf-Access-Jwt-Assertion` header (or the `CF_Authorization` cookie) with `jose` against the team's keys and the application's audience tag.

Options considered:

|                         | Plain OIDC in the Worker (`@hono/oidc-auth`) | better-auth                       | Cloudflare Access         | Hosted (WorkOS, Clerk, Auth0)   |
| ----------------------- | -------------------------------------------- | --------------------------------- | ------------------------- | ------------------------------- |
| Enterprise IdP login    | Yes                                          | Yes (SSO plugin, SAML)            | Yes, at the edge, no code | Yes                             |
| Projects without an IdP | No                                           | Yes (passwords, passkeys, 2FA)    | Email codes only          | Yes                             |
| Users stored by us      | No                                           | Yes                               | No                        | Vendor                          |
| Cost on Workers         | Smallest                                     | Small (session lookup, cacheable) | No code                   | Network calls, per-user pricing |

Today's features and how they are covered:

| Today (NestJS)                                       | With Access                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| oauth2-proxy with OIDC in front of admin and API     | Cloudflare Access                                            |
| JWT verification against the IdP's keys (`jwks-rsa`) | Access JWT verified with `jose`                              |
| Logout at the IdP                                    | Access logout                                                |
| Basic auth for the system user (site → API)          | Access service token or our own key check                    |
| Site-preview cookie                                  | Ours, unchanged (`jose`)                                     |
| Static user in dev                                   | Dev-only Access emulator                                     |
| User list via a per-project user service             | Users stored on first request, or a per-project user service |
| IdP claims mapped to a user (`convertJwtToUser`)     | Access identity, groups via `/cdn-cgi/access/get-identity`   |

Local dev:

- **Access emulator** (daily dev): part of the Vite dev server (`dextinityDevServer()` of `@dextinity/serverless/vite`). It shows a user picker (the `dev-oidc-provider` users, with groups), signs an Access-format JWT with a local key, sets the `CF_Authorization` cookie, adds the `Cf-Access-Jwt-Assertion` header and serves the certificates and the identity endpoint. The production verification code runs, with a local key instead of Cloudflare's.
    - Fail-safe: the emulator is a Vite plugin applied only to `vite dev`, and the Worker selects its configuration (`devAccessConfig`) behind `import.meta.env.DEV`, so neither is in the production build (checked).
    - Production accepts only team domains of `cloudflareaccess.com`; requests without a valid Access JWT have no identity and get a 401 from the permission checks. The public DAM URLs need a bypass policy in Access.
- **Cloudflare Tunnel** (occasional tests): exposes local dev under a hostname protected by a real Access application, for testing logout, IdP groups and policies.

Consequences:

- Access gives no user directory: users are stored on their first request, or a per-project user service stays.
- Cloudflare-only. Verification sits behind a small interface (request → identity), so projects not on Cloudflare can swap in `@hono/oidc-auth`.

## 9. Authorization: Dextinity's permission model as its own module

**Decision:** Port Dextinity's permission model as a module of `@dextinity/serverless` (`permissions`). Access policies only gate who may reach the admin.

Today's model:

- 14 core permissions; projects add their own through `PermissionOverrides`
- Grants: permission × content scopes (dimensions with a `*` wildcard), stored per user with validity period, reason, requester, approver and source (manual or by rule)
- Rules in project code (`getPermissionsForUser`, `getContentScopesForUser`), e.g. `isAdmin` → everything
- Enforcement:
    - `@RequiredPermission` (60 uses);
    - `@AffectedEntity` (76 uses);
    - `@ScopedEntity`, a declarative entity-scope mapping usable at runtime and as SQL
- Impersonation only for users with equal or fewer permissions
- Admin UI for managing grants

Options considered:

| Option                        | Assessment                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Own module (port)             | Fits the domain exactly; existing grants, UI and rules carry over; in-process and fast                                       |
| CASL                          | The only library worth considering (isomorphic, condition-based); we'd still write the Drizzle converter and keep our tables |
| Cerbos, Oso, Permit.io        | Policy languages, operations or a vendor; often a network call per check                                                     |
| OpenFGA, SpiceDB              | Separate service; overkill for a CMS                                                                                         |
| Casbin                        | Domain RBAC fits scopes, but less known in TypeScript                                                                        |
| Access policies               | Only "may reach the admin"                                                                                                   |
| PostgreSQL row-level security | Not available on D1                                                                                                          |

Design:

1. **Data (Drizzle, D1 or PostgreSQL):**
    - grants as today;
    - new: **roles** (permission bundles);
    - new: **IdP group → role mappings**, so Access groups grant permissions.
2. **Evaluation:** pure functions:
    - `can(user, permission, scope?)`;
    - `allowedScopes(user, permission)`;
    - `scopeFilter(table, user, permission)` as a Drizzle `where` condition;
    - scope definitions per table (the `@ScopedEntity` idea), used by both.
3. **Enforcement:**
    - `requirePermission("dam")` per route;
    - `assertCan(c, "dam", entity)` in handlers;
    - list routes always filter with `scopeFilter` (fail closed).
4. **Client:** `/api/me` returns permissions and scopes; `useCan(permission, scope)` hides UI. The server stays the authority.
5. **Extensibility:** projects add permissions by type declaration and rules through a function in the app config.
6. **Impersonation:** keeps the "equal or fewer permissions" rule.

`can` and `scopeFilter` stay behind a small interface, so CASL can replace the evaluation later if condition-based rules become common.

## 10. Files and images

- **Files:** R2 (`R2BlobStorage`; the prototype no longer runs on Node.js, so the file system storage was dropped)
- **Images:** Cloudflare Images through the Workers Images binding (`env.IMAGES`), replacing imgproxy.
    - The Worker reads the original from R2 and streams it into the binding. Originals need no public URL, and there is no extra service to run.
    - The DAM's image URLs stay hashed: the Worker checks the hash before transforming, so only sizes and crops the DAM issued get rendered and billed.
    - The DAM's crop settings map directly: the crop area and focal point give the same pixel rectangle as today's imgproxy crop, which becomes `trim`; smart crops become `gravity: "auto"`; the size becomes `width`/`height` with `fit: "cover"`, never enlarged. The output format (AVIF, WebP, JPEG) follows the `Accept` header.
    - Binding results aren't cached automatically. The Worker stores them in the Cache API, keyed by the hashed URL, which also keeps the number of billed transformations down.
    - Dominant color: a 1×1 transform with `rgb` output returns three bytes, no PNG decoding (today: a 1×1 PNG from imgproxy).
    - Width, height and format on upload come from `info()`.
    - The DAM uses an image transformer interface (`ImageTransformer`), like blob storage: `CloudflareImagesTransformer` with the Images binding in production, `DevServerImageTransformer` in local dev, which calls sharp in the Vite dev server. Wrangler's local emulation of the binding only supports resize and rotate (no `trim`, no `rgb` output), so it would silently ignore crops. To test against the real service, the binding can be used remotely.

## 11. Blocks and documents

**Decision:** The admin reuses the block framework of `@dextinity/cms-admin`. The API validates the blocks with zod and stores the documents as JSON.

Admin:

- The factories and most blocks of `@dextinity/cms-admin` don't use GraphQL: `createBlocksBlock`, `createListBlock`, `createOneOfBlock`, `createOptionalBlock`, `createCompositeBlock`, `createColumnsBlock`, `createRichTextBlock`, `createSeoBlock`, `createTableBlock`, `createTextImageBlock`, the link blocks without internal links, space and anchor. Reusing them keeps the editing UI and the blocks of existing projects; rewriting them would be the largest part of the port.
- They read their config from `DextinityConfigProvider` and the Apollo client from the context, even when they don't use it. `BlocksProvider` (`@dextinity/serverless/client`) provides both, with an Apollo client that fails every operation, so a block that still sends one shows up immediately.
- The blocks that load data through GraphQL get REST variants in their features: `PixelImageBlock`, `SvgImageBlock`, `DamImageBlock`, `DamVideoBlock`, `DamFileDownloadLinkBlock` (with a DAM file chooser) in the DAM, `InternalLinkBlock` (with a page chooser) in the page tree. YouTube and Vimeo become factories taking the preview image block (`createYouTubeVideoBlock({ previewImage })`).
- Documents are loaded with `output2State` from the stored input; the REST blocks load their files and pages there. GraphQL returned the data shape (files resolved by the API) and used `input2State`. `createOneOfBlock`'s `output2State` dropped the link title, which only clipboard paste used until now; fixed in `@dextinity/cms-admin`.
- The admin bundle grows to 3.9 MB (955 KB gzipped) with `@dextinity/cms-admin` and Draft.js. Draft.js needs `global`, which Vite defines as `globalThis` for the client.

API:

- The blocks of `@dextinity/serverless/server` define a block as a name and a zod schema of its input, which is exactly what the admin's `state2Output` sends. The factories mirror those of `@dextinity/cms-api`.
- Strict objects: a field the admin sends but the schema doesn't know is rejected (422), not silently dropped.
- The validated input is stored as it is, there's no data side yet (`transformToPlain`, dependencies, search texts): the site reads documents later, out of scope for now.
- Referenced files and pages aren't checked. A deleted file leaves an empty image, a deleted page an empty link; the routes that load them check the scope.

Documents:

- One table for the documents of all document types (`PageTreeDocument`): node, type and the input of each root block as JSON (`text` on D1, `jsonb` on PostgreSQL). Changing a node's document type keeps the document of the previous type.
- `GET`/`PUT /page-tree/nodes/:id/document`. Saving sends the `updatedAt` it loaded; a conditional update makes the check atomic without a transaction, and a concurrent change answers 409.
- The document types of the API's config have the root blocks (`{ Page: { rootBlocks: { content, seo, stage } } }`); the admin's config has the admin blocks with the same keys, the editor shows a tab for each.

Block preview:

- The editor shows the site's block preview next to the blocks, with `BlockPreviewWithTabs` of `@dextinity/cms-admin` and the iframe bridge of `@dextinity/site-nextjs`. A root block with a `previewPath` gets a preview at that path below the `blockPreviewUrl` of the scope; the other tabs show the first root block's.
- The REST blocks create their preview state in the shape the site's blocks expect (`damFile` with `fileUrl` and `image`, `urlTemplate` with the crop area), with absolute URLs of the API, as the site runs on another origin.
- `BlockPreview` loaded the JWT for the site through GraphQL and only sent the block state once it had it. It now takes the JWT as `contentScopeJwt`. The serverless admin sends an unsecured JWT with the scope: the site reads the scope from it, and only the site's requests to the NestJS API needed the signature. A signed one belongs to the site's read API.
- The demo uses the block preview of the NestJS demo's site (`demo/site`), which renders the same blocks. Its content security policy allows framing and images from `ADMIN_URL` only, so it runs with the serverless admin's URL as `ADMIN_URL` (`demo-serverless-site` in dev-pm). The site's loader of the page tree index block queries the GraphQL API, which the serverless demo doesn't have, and the site's `media-src` blocks videos from the API.

Not ported yet: the TipTap rich text and table blocks (their validation needs a ProseMirror schema in the Worker), the anchors of the target page in internal links, the news, contact form and user group blocks of the demo.

## Open questions

- Background jobs: Queues, Cron Triggers, Workflows (dominant color, cron jobs, builds)
- How projects extend feature schemas (extra columns, scope dimensions on DAM tables)
- Migration of existing PostgreSQL projects: the new schema doesn't map to the MikroORM tables any more (no `mpath`, column names without the embeddable prefixes)
- Porting the admin and API generators
- Moving `@dextinity/admin` to React Router 8 (later, separate)
- Moving the block framework out of `@dextinity/cms-admin` into a package without GraphQL
- Site: out of scope for these decisions

## Next steps

1. ~~Rework the prototype into the decided shape~~ (done, see [`packages/serverless`](packages/serverless)):
    - one Vite + Worker project, admin as static assets, API at `/api`;
    - the DAM and the permissions on Drizzle, the same code on D1 and on PostgreSQL (the smoke test passes on both);
    - Cloudflare Access verification with the dev emulator;
    - images through the image transformer instead of imgproxy;
    - the permission module with grants, roles, group roles and rules. Impersonation and the admin UI for grants are still missing.
2. Deploy it to Cloudflare and measure bundle size, cold starts and request times. Locally built, the Worker is 286 KB gzipped (including postgres.js, exifr and JSZip).
3. Decide the open questions, then port module by module. Ported so far: the page tree with its documents and blocks (see the README of [`packages/serverless`](packages/serverless)).
