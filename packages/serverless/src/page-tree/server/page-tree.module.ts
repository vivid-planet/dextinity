import { type Context, Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";

import {
    type AccessVariables,
    badRequest,
    createScopedQueryHelpers,
    type Database,
    type DatabaseDialect,
    inject,
    notFound,
    ScopeColumns,
    scopesAreEqual,
    type ScopeSchema,
    unprocessableEntity,
    zValidator,
} from "../../core/server/index.js";
import { assertCan, type PermissionsVariables, requirePermission, scopeFilter } from "../../permissions/server/index.js";
import type { PageTreeConfig } from "./page-tree.config.js";
import { createPageTreeSchema, pageTreeNodeVisibilities } from "./page-tree.schema.js";
import { PageTreeService } from "./page-tree.service.js";
import type { PageTreeDocument, PageTreeNode } from "./page-tree.types.js";

export type PageTreeEnv = { Variables: AccessVariables & PermissionsVariables & { database: Database; pageTree: PageTreeService } };

interface PageTreeModuleOptions<TScopeSchema extends ScopeSchema> {
    dialect: DatabaseDialect;
    config: PageTreeConfig;
    Scope?: TScopeSchema;
}

const permission = "pageTree";
const slug = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-_]*$/, "Only letters, digits, hyphens and underscores, starting with a letter or digit");
const idParam = z.object({ id: z.uuid() });

/**
 * The page tree: nodes with name, slug, path, position, visibility, category and document type, and the document of each node, which
 * stores the input of the document type's root blocks.
 *
 * - `schema`: the Drizzle tables for the dialect
 * - `provider`: middleware that provides the service as `c.var.pageTree`
 * - `routes`: the REST routes, mount them with `app.route("/page-tree", pageTree.routes)`
 *
 * Requires `database` and the provider of the permissions module (`currentUser`) in the request context. Users need the `pageTree`
 * permission in the node's scope.
 */
export function createPageTreeModule<TScopeSchema extends ScopeSchema = z.ZodObject<Record<never, never>>>({
    dialect,
    config,
    Scope,
}: PageTreeModuleOptions<TScopeSchema>) {
    type Scope = z.infer<TScopeSchema>;
    const scopeSchema = (Scope ?? z.object({})) as TScopeSchema;
    const scopeColumns = new ScopeColumns(Object.keys(scopeSchema.shape));
    const schema = createPageTreeSchema({ dialect, scopeColumns });
    const { scopedQuery, splitScopedQuery, nonEmptyScopeOrNothing } = createScopedQueryHelpers(scopeSchema);

    const category = z.enum(config.categories as [string, ...string[]]);
    const documentType = z.enum(Object.keys(config.documentTypes) as [string, ...string[]]);
    const documentSchemas = new Map(
        Object.entries(config.documentTypes).map(([type, { rootBlocks }]) => [
            type,
            z.strictObject(Object.fromEntries(Object.entries(rootBlocks).map(([key, block]) => [key, block.schema]))),
        ]),
    );

    const provider = createMiddleware<PageTreeEnv>(async (c, next) => {
        c.set("pageTree", new PageTreeService({ database: inject<Database>(c, "database", "PageTreeModule"), schema, scopeColumns, config }));
        await next();
    });

    const assertScopeAllowed = (c: Context, scope: Scope | Record<string, string> | undefined) =>
        assertCan(c, permission, scopeColumns.hasScope ? scope : undefined);
    const serialize = (node: PageTreeNode) => ({ ...node, scope: node.scope as Scope });
    const serializeDocument = (node: PageTreeNode, document: PageTreeDocument | null) => ({
        type: node.documentType,
        data: document?.data ?? null,
        updatedAt: document?.updatedAt.toISOString() ?? null,
    });

    async function findNodeOrFail(c: Context<PageTreeEnv>, id: string): Promise<PageTreeNode> {
        const node = await c.var.pageTree.findOneById(id);
        if (!node) {
            throw notFound(`Page tree node ${id} not found`);
        }
        assertScopeAllowed(c, node.scope);
        return node;
    }

    const listArgs = z.object({ category: category.optional() });
    const slugAvailabilityArgs = z.object({ parentId: z.uuid().optional(), slug });
    const createNodeInput = z.object({
        category,
        name: z.string().min(1),
        slug,
        parentId: z.uuid().nullish(),
        pos: z.number().int().min(1).optional(),
        hideInMenu: z.boolean().optional(),
        documentType,
    });

    const routes = new Hono<PageTreeEnv>()
        .use(provider)
        .use(requirePermission(permission))
        .get("/nodes", zValidator("query", scopedQuery(listArgs)), async (c) => {
            const { scope, args } = splitScopedQuery(listArgs, c.req.valid("query"));
            assertScopeAllowed(c, scope);
            const tree = await c.var.pageTree.loadTree(scope, {
                // In addition to the scope check above, fails closed
                scopeFilter: scopeColumns.hasScope ? (columns) => scopeFilter(c, { permission, columns }) : undefined,
            });
            const nodes = tree.nodes.filter((node) => args.category === undefined || node.category === args.category);
            return c.json(nodes.map(serialize));
        })
        .get("/slug-availability", zValidator("query", scopedQuery(slugAvailabilityArgs)), async (c) => {
            const { scope, args } = splitScopedQuery(slugAvailabilityArgs, c.req.valid("query"));
            assertScopeAllowed(c, scope);
            return c.json({ availability: await c.var.pageTree.slugAvailability({ parentId: args.parentId ?? null, slug: args.slug }, scope) });
        })
        .post("/nodes", zValidator("json", createNodeInput.extend({ scope: scopeSchema })), async (c) => {
            const { scope: passedScope, ...input } = c.req.valid("json") as z.output<typeof createNodeInput> & { scope: Scope };
            const scope = nonEmptyScopeOrNothing(passedScope);
            assertScopeAllowed(c, scope);
            return c.json(serialize(await c.var.pageTree.create(input, scope)), 201);
        })
        .post(
            "/nodes/move",
            zValidator("json", z.object({ ids: z.array(z.uuid()).min(1), parentId: z.uuid().nullable(), pos: z.number().int().min(1) })),
            async (c) => {
                const { ids, parentId, pos } = c.req.valid("json");
                const nodes = await Promise.all(ids.map((id) => findNodeOrFail(c, id)));
                const scope = nonEmptyScopeOrNothing(nodes[0].scope);
                if (parentId) {
                    const parent = await findNodeOrFail(c, parentId);
                    nodes.push(parent);
                }
                if (nodes.some((node) => !scopesAreEqual(node.scope, nodes[0].scope))) {
                    throw badRequest("All pages must be in the same scope");
                }
                return c.json((await c.var.pageTree.move({ ids, parentId, pos }, scope)).map(serialize));
            },
        )
        .get("/nodes/:id", zValidator("param", idParam), async (c) => {
            return c.json(serialize(await findNodeOrFail(c, c.req.valid("param").id)));
        })
        .patch(
            "/nodes/:id",
            zValidator("param", idParam),
            zValidator(
                "json",
                z.object({
                    name: z.string().min(1).optional(),
                    slug: slug.optional(),
                    hideInMenu: z.boolean().optional(),
                    documentType: documentType.optional(),
                }),
            ),
            async (c) => {
                const node = await findNodeOrFail(c, c.req.valid("param").id);
                return c.json(serialize(await c.var.pageTree.update(node, c.req.valid("json"))));
            },
        )
        .get("/nodes/:id/document", zValidator("param", idParam), async (c) => {
            const node = await findNodeOrFail(c, c.req.valid("param").id);
            return c.json(serializeDocument(node, await c.var.pageTree.findDocument(node)));
        })
        .put(
            "/nodes/:id/document",
            zValidator("param", idParam),
            zValidator("json", z.object({ data: z.record(z.string(), z.unknown()), lastUpdatedAt: z.iso.datetime().nullable().optional() })),
            async (c) => {
                const node = await findNodeOrFail(c, c.req.valid("param").id);
                const { data, lastUpdatedAt } = c.req.valid("json");
                const documentSchema = documentSchemas.get(node.documentType);
                if (!documentSchema) {
                    throw unprocessableEntity(`The document type ${node.documentType} isn't configured`);
                }
                const result = documentSchema.safeParse(data);
                if (!result.success) {
                    throw unprocessableEntity(z.prettifyError(result.error));
                }
                const document = await c.var.pageTree.saveDocument(node, {
                    data: result.data,
                    lastUpdatedAt: lastUpdatedAt === undefined || lastUpdatedAt === null ? lastUpdatedAt : new Date(lastUpdatedAt),
                });
                return c.json(serializeDocument(node, document));
            },
        )
        .put(
            "/nodes/:id/visibility",
            zValidator("param", idParam),
            zValidator("json", z.object({ visibility: z.enum(pageTreeNodeVisibilities) })),
            async (c) => {
                const node = await findNodeOrFail(c, c.req.valid("param").id);
                return c.json(serialize(await c.var.pageTree.updateVisibility(node, c.req.valid("json").visibility)));
            },
        )
        .put("/nodes/:id/category", zValidator("param", idParam), zValidator("json", z.object({ category })), async (c) => {
            const node = await findNodeOrFail(c, c.req.valid("param").id);
            return c.json(serialize(await c.var.pageTree.updateCategory(node, c.req.valid("json").category)));
        })
        .delete("/nodes/:id", zValidator("param", idParam), async (c) => {
            const node = await findNodeOrFail(c, c.req.valid("param").id);
            await c.var.pageTree.delete(node);
            return c.json({ deleted: true });
        });

    return { config, schema, provider, routes };
}

export type PageTreeModule<TScopeSchema extends ScopeSchema> = ReturnType<typeof createPageTreeModule<TScopeSchema>>;

/** The route types, for typed clients: `hc<PageTreeRoutes<typeof Scope>>(\`${apiUrl}/page-tree\`)` */
export type PageTreeRoutes<TScopeSchema extends ScopeSchema> = PageTreeModule<TScopeSchema>["routes"];
