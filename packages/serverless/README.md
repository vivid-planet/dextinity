# serverless (prototype)

A prototype of Dextinity on Cloudflare Workers, built along [DECISIONS-SERVERLESS.md](../../DECISIONS-SERVERLESS.md): Hono with REST and typed clients, Drizzle on D1 **or** PostgreSQL, the admin as a Vite single-page app on `@dextinity/admin`, Cloudflare Access for login, Dextinity's permission model and the Images binding for images. It starts with the DAM.

| Package                                            | `./server`                                                                                                                       | `./client`                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [`@dextinity/serverless-core`](core)               | `provide`/`inject`, errors, `zValidator`, portable Drizzle (`portableColumns`, `Database`), R2, image transformer, Access, cache | `ApiProvider`, `QueryErrorHandler`                |
| [`@dextinity/serverless-permissions`](permissions) | Grants, roles, group roles; `requirePermission`, `assertCan`, `scopeFilter`; `GET /me`                                           | `CurrentUserProvider`, `useCan`, `useCurrentUser` |
| [`@dextinity/serverless-blocks`](blocks)           | Block definitions (name and zod schema of the input) and factories like those of `@dextinity/cms-api`                            | `BlocksProvider`, YouTube and Vimeo factories     |
| [`@dextinity/serverless-dam`](dam)                 | Schema, services and routes of the DAM; image, video and file download blocks                                                    | `DamApiProvider`, `DamPage`, the same blocks      |
| [`@dextinity/serverless-page-tree`](page-tree)     | Schema, service and routes of the page tree and its documents; internal link block                                               | `PageTreeApiProvider`, `PageTreePage`, the block  |

`@dextinity/serverless-core/vite` contains `dextinityDevServer()`, the local development services: an emulator of Cloudflare Access and an image transformer with sharp.

The demo is [`demo/serverless`](../../demo/serverless): one Vite project and one Worker, which serves the admin as static assets and the API at `/api`. It follows the layout of Cloudflare's React template (`create-cloudflare`), with `api/` instead of `worker/`:

- `src/`: the admin, `api/`: the API (the Worker's entry point), `shared/`: code for both (e.g. the content scope), `scripts/`: Node.js scripts
- one tsconfig each (`tsconfig.app.json`, `tsconfig.api.json`, `tsconfig.node.json`), referenced from `tsconfig.json` for the editor and `tsc -b`
- ESLint forbids imports between `src/` and `api/`, values from `@dextinity/*/server` in the admin (types are fine) and `@dextinity/*/client` in the API

## Running the demo

Requires the builds of `@dextinity/admin`, `@dextinity/admin-icons` and `@dextinity/cms-admin`.

```bash
# On D1 (local SQLite of wrangler), no Docker needed. The seed applies the migrations first, `db:migrate:d1` only migrates.
pnpm --filter dextinity-demo-serverless db:seed:d1
pnpm exec dev-pm start @demo-serverless

# On PostgreSQL (the container of docker-compose.yml, database main_serverless) via Hyperdrive
pnpm exec dev-pm start demo-docker
pnpm --filter dextinity-demo-serverless db:seed:postgresql # creates the database and applies the migrations first
pnpm exec dev-pm start @demo-serverless-postgresql

# Both on http://localhost:8010. Exercises the API through the typed clients:
pnpm --filter dextinity-demo-serverless smoke-test

# The block preview in the page editor: the demo site (demo/site) on http://localhost:3000, which allows the serverless admin to frame it
pnpm exec dev-pm start demo-serverless-site
```

The Access emulator shows a login page with three users: Admin (group `admins`, all permissions by rule), Editor (group `editors`, the DAM and the page tree of `main` through a group role) and Guest (only the DAM of `secondary`, through a stored grant). The seed adds a home page per domain.

`pnpm --filter dextinity-demo-serverless build` builds the Worker and the admin for production; the emulator and the dev image transformer aren't part of it.
To deploy, create the D1 database (or the Hyperdrive config), the R2 bucket and an Access application, put their IDs into `wrangler.jsonc`, set the secret (`wrangler secret put DAM_SECRET`), apply the migrations (`wrangler d1 migrations apply DB --remote`) and run `deploy`. The public file and image URLs (`/api/dam/files/<hash>/…`, `/api/dam/images/<hash>/…`) need a bypass policy in Access.

## Wiring modules into an app

```ts
const permissions = createPermissionsModule({ dialect, contentScopes, rules: permissionRules });
const dam = createDamModule({ dialect, damConfig: config.dam, Scope: DamScope });

new Hono<{ Bindings: Bindings }>()
    .basePath("/api")
    .onError(dextinityErrorHandler)
    .use(provideDatabase(dialect)) // `database`: createD1Database(env.DB) or createPostgresqlDatabase(drizzle(postgres(env.HYPERDRIVE…)))
    .use(provide("blobStorage", (c) => new R2BlobStorage(c.env.DAM_FILES)))
    .use(
        provide("imageTransformer", (c) =>
            import.meta.env.DEV ? new DevServerImageTransformer(origin) : new CloudflareImagesTransformer(c.env.IMAGES),
        ),
    )
    .use(cloudflareAccess((c) => (import.meta.env.DEV ? devAccessConfig(c) : config.access))) // `identity`
    .use(permissions.provider) // `currentUser` with its grants
    .route("/", permissions.routes)
    .route("/dam", dam.routes);
```

In the admin, each module has its own typed client below the `ApiProvider`'s URL (`hc<DamRoutes<…>>("/api/dam")`), so typechecking stays fast and the admin never imports Worker code.

Documents: the API's page tree config has the root blocks of each document type (zod schemas, `{ Page: { rootBlocks: { content: PageContentBlock, … } } }`), the admin's `PageTreeApiProvider` the admin blocks with the same keys, and for the block preview the site's preview URL of the scope (`blockPreviewUrl`) and a `previewPath` per root block. The admin needs `BlocksProvider` below the `ApiProvider`, for the block framework of `@dextinity/cms-admin`, and react-dnd's `DndProvider`, for reordering blocks.

## Writing code for D1 and PostgreSQL

Tables are defined once with `portableColumns(dialect)`, which returns SQLite or PostgreSQL column builders. Both are typed as SQLite tables, and `database.drizzle` is typed as a SQLite database, so services are written once. drizzle-kit generates the migrations per dialect from the same definition (`pnpm --filter dextinity-demo-serverless db:generate`).

Rules, because the types don't catch everything:

- Build queries with `select`, `insert`, `update`, `delete` and `$count` and await them. `.get()`, `.all()`, `.run()` and `.values()` only exist on SQLite.
- No interactive transactions (D1 has none): generate IDs with `crypto.randomUUID()` and write several rows with `database.batch((db) => [...])`, a batch on D1 and a transaction on PostgreSQL.
- Portable SQL only: `containsIgnoringCase()` instead of `ILIKE`, recursive queries (`database.rows(sql\`with recursive …\`)`) instead of arrays, window functions are fine. Quote identifiers with double quotes.
- The smoke test runs against both databases, run it on both after changing queries.

## What the prototype covers

- DAM: files (list, search, get with DAM path and duplicates, update, move, archive, delete), upload and replace, file delivery (hashed public URLs, preview URLs, downloads, ranges), images (focus and smart crops, allowed sizes and aspect ratios, AVIF/WebP negotiation, Cache API), folders (recursive ancestors, move, delete, zip), DAM items, dominant color on upload
- Page tree: nodes per category with name, slug, path, position, visibility, document type and "hide in menu"; add, edit, move (drag and drop, into another category), archive with subpages, restore with a free slug, delete with subpages, slug availability (duplicate and reserved paths); paths are calculated in memory from one query per scope (`PageTreeSnapshot`)
- Documents: an editor per node with a tab per root block (the demo's pages have content, stage and SEO, links a link), unsaved changes prompt, conflict detection; one document per node and type; the site's block preview next to the blocks
- Blocks: the blocks of the demo's pages, links and stages except TipTap, news, contact form and user groups, see [11. Blocks and documents](../../DECISIONS-SERVERLESS.md#11-blocks-and-documents). The admin uses the block framework of `@dextinity/cms-admin`, the API validates each block with a strict zod schema.
- Permissions: grants with validity, roles, roles per identity provider group, rules in project code, content scopes with `*` wildcards, `scopeFilter` on the DAM and page tree lists, `GET /me`, `useCan` in the admin
- Access: JWT verification against the team's keys with `jose`, groups from the identity endpoint (cached per isolate), service tokens, the emulator for local development

Left out for now: the TipTap blocks, copying pages, redirects on slug changes and the read API for the site (block data, dependencies, search texts), impersonation and the admin UI for grants, users stored on first request, DAM dependencies, warnings and media alternatives, SVG validation (DOMPurify needs a DOM), background jobs, migrating existing projects (the schema no longer maps to the MikroORM tables: no `mpath`, column names without the embeddable prefixes).
