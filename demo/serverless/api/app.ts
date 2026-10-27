import {
    type BlobStorage,
    cloudflareAccess,
    CloudflareImagesTransformer,
    createD1Database,
    createDamModule,
    createPageTreeModule,
    createPermissionsModule,
    createPostgresqlDatabase,
    type Database,
    type DatabaseDialect,
    devAccessConfig,
    DevServerImageTransformer,
    dextinityErrorHandler,
    type ImageTransformer,
    provide,
    R2BlobStorage,
} from "@dextinity/serverless/server";
import { drizzle } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import postgres from "postgres";

import { ContentScope } from "../shared/content-scope";
import type { Config } from "./config";
import { pageTreeConfig } from "./page-tree";
import { contentScopes, permissionRules } from "./permissions";

export interface Bindings {
    DB: D1Database;
    HYPERDRIVE: Hyperdrive;
    DAM_FILES: R2Bucket;
    IMAGES: ImagesBinding;
}

type AppEnv = { Bindings: Bindings };

function provideDatabase(dialect: DatabaseDialect) {
    return provide<"database", Database & { close?: () => Promise<void> }, AppEnv>(
        "database",
        (c) => {
            if (dialect === "postgresql") {
                // Hyperdrive pools the connections, so a client per request is cheap. It must not outlive the request.
                const client = postgres(c.env.HYPERDRIVE.connectionString, { max: 5, fetch_types: false });
                return { ...createPostgresqlDatabase(drizzle(client)), close: () => client.end() };
            }
            return createD1Database(c.env.DB);
        },
        {
            dispose: ({ close }, c) => {
                if (close) {
                    c.executionCtx.waitUntil(close());
                }
            },
        },
    );
}

/**
 * The counterpart of `AppModule`: the API of the project, mounted at /api of the Worker. The admin is served as static assets.
 */
export function createApp(config: Config) {
    const dialect = config.databaseDialect;
    const permissions = createPermissionsModule({ dialect, contentScopes, rules: permissionRules });
    const dam = createDamModule({ dialect, damConfig: config.dam, Scope: ContentScope });
    const pageTree = createPageTreeModule({ dialect, config: pageTreeConfig, Scope: ContentScope });

    return new Hono<AppEnv>()
        .basePath("/api")
        .onError(dextinityErrorHandler)
        .use(provideDatabase(dialect))
        .use(provide<"blobStorage", BlobStorage, AppEnv>("blobStorage", (c) => new R2BlobStorage(c.env.DAM_FILES)))
        .use(
            provide<"imageTransformer", ImageTransformer, AppEnv>("imageTransformer", (c) =>
                // Wrangler's local emulation of the Images binding ignores crops, sharp in the Vite dev server doesn't
                import.meta.env.DEV ? new DevServerImageTransformer(new URL(c.req.url).origin) : new CloudflareImagesTransformer(c.env.IMAGES),
            ),
        )
        .use(cloudflareAccess((c) => (import.meta.env.DEV ? devAccessConfig(c) : config.access)))
        .use(permissions.provider)
        .get("/status", (c) => c.json({ status: "ok", databaseDialect: dialect }))
        .route("/", permissions.routes)
        .route(`/${dam.config.basePath}`, dam.routes)
        .route("/page-tree", pageTree.routes);
}
