import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";

import { type BlobStorage, type Database, type DatabaseDialect, type ImageTransformer, inject, ScopeColumns } from "../../core/server/index.js";
import { damDefaultAcceptedMimetypes } from "./common/dam-default-accepted-mimetypes.js";
import { type DamConfig, damDefaultBasePath, type ResolvedDamConfig } from "./dam.config.js";
import { createDamRouteHelpers, type DamEnv, type DamRouteContext, type DamScopeSchema } from "./dam.context.js";
import { createDamServices, type DamServiceDependencies } from "./dam.services.js";
import { createDamSchema } from "./db/dam.schema.js";
import { createFilesRoutes } from "./files/files.routes.js";
import { createFoldersRoutes } from "./folders/folders.routes.js";
import { createImagesRoutes } from "./images/images.routes.js";
import { createDamItemsRoutes } from "./items/dam-items.routes.js";

interface DamModuleOptions<TScopeSchema extends DamScopeSchema> {
    dialect: DatabaseDialect;
    damConfig: DamConfig;
    Scope?: TScopeSchema;
}

/**
 * The counterpart of `DamModule.register()`:
 *
 * - `schema`: the Drizzle tables (entities) for the dialect
 * - `provider`: middleware that creates the DAM services for the request and provides them as `c.var.dam` (providers and exports)
 * - `routes`: the REST routes, mount them with `app.route(basePath, dam.routes)` (controllers and resolvers)
 *
 * The module requires `database`, `blobStorage`, `imageTransformer` and the provider of the permissions module (`currentUser`) in the
 * request context (imports).
 */
export function createDamModule<TScopeSchema extends DamScopeSchema = z.ZodObject<Record<never, never>>>({
    dialect,
    damConfig,
    Scope,
}: DamModuleOptions<TScopeSchema>) {
    const scopeSchema = (Scope ?? z.object({})) as TScopeSchema;
    const scopeKeys = Object.keys(scopeSchema.shape);
    const config: ResolvedDamConfig = {
        ...damConfig,
        basePath: damConfig.basePath ?? damDefaultBasePath,
        acceptedMimeTypes: damConfig.acceptedMimeTypes ?? damDefaultAcceptedMimetypes,
    };
    const scopeColumns = new ScopeColumns(scopeKeys);
    const schema = createDamSchema({ dialect, scopeColumns });

    const createServices = (dependencies: Pick<DamServiceDependencies, "database" | "blobStorage" | "imageTransformer">) =>
        createDamServices({ ...dependencies, config, schema, scopeColumns });

    const provider = createMiddleware<DamEnv>(async (c, next) => {
        c.set(
            "dam",
            createServices({
                database: inject<Database>(c, "database", "DamModule"),
                blobStorage: inject<BlobStorage>(c, "blobStorage", "DamModule"),
                imageTransformer: inject<ImageTransformer>(c, "imageTransformer", "DamModule"),
            }),
        );
        await next();
    });

    const routeContext: DamRouteContext<TScopeSchema> = { config, scopeSchema, hasScope: scopeKeys.length > 0 };
    const helpers = createDamRouteHelpers(routeContext);

    const routes = new Hono<DamEnv>()
        .use(provider)
        .route("/files", createFilesRoutes(routeContext, helpers))
        .route("/folders", createFoldersRoutes(routeContext, helpers))
        .route("/items", createDamItemsRoutes(routeContext, helpers))
        .route("/images", createImagesRoutes(routeContext, helpers));

    return { config, schema, provider, routes, createServices };
}

export type DamModule<TScopeSchema extends DamScopeSchema> = ReturnType<typeof createDamModule<TScopeSchema>>;

/** The route types of the DAM, for typed clients: `hc<DamRoutes<typeof DamScope>>(\`${apiUrl}/dam\`)`. */
export type DamRoutes<TScopeSchema extends DamScopeSchema> = DamModule<TScopeSchema>["routes"];
