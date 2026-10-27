import { type Context, Hono } from "hono";
import { z } from "zod";

import { badRequest, notFound, scopesAreEqual, zValidator } from "../../../core/server/index.js";
import { requirePermission } from "../../../permissions/server/index.js";
import { contentDisposition } from "../common/http.util.js";
import type { DamEnv, DamRouteContext, DamRouteHelpers, DamScopeSchema } from "../dam.context.js";
import { booleanParam, createFolderInput, paginationQuery, sortQuery, updateFolderInput } from "../dam.dto.js";
import type { DamFolder } from "../dam.types.js";

const idParam = z.object({ id: z.uuid() });

export function createFoldersRoutes<TScopeSchema extends DamScopeSchema>(
    { scopeSchema }: DamRouteContext<TScopeSchema>,
    helpers: DamRouteHelpers<TScopeSchema>,
) {
    type Scope = z.infer<TScopeSchema>;
    const requireDamPermission = requirePermission("dam");

    const listArgs = z.object({
        parentId: z.uuid().optional(),
        includeArchived: booleanParam.optional(),
        searchText: z.string().optional(),
        ...paginationQuery,
        ...sortQuery,
    });
    const byNameArgs = z.object({ name: z.string(), parentId: z.uuid().optional() });

    const serializeFolder = (folder: DamFolder) => ({ ...folder, scope: folder.scope as Scope });

    async function findFolderOrFail(c: Context<DamEnv>, id: string): Promise<DamFolder> {
        const folder = await c.var.dam.folders.findOneById(id);
        if (!folder) {
            throw notFound(`Folder ${id} not found`);
        }
        helpers.assertScopeAllowed(c, folder.scope);
        return folder;
    }

    return new Hono<DamEnv>()
        .use(requireDamPermission)
        .get("/", zValidator("query", helpers.scopedQuery(listArgs)), async (c) => {
            const { scope, args } = helpers.splitScopedQuery(listArgs, c.req.valid("query"));
            helpers.assertScopeAllowed(c, scope);
            const { offset = 0, limit = 25, ...filter } = args;
            const [folders, totalCount] = await c.var.dam.folders.findAndCount(
                { ...filter, offset, limit, scopeFilter: helpers.scopeFilter(c) },
                scope,
            );
            return c.json({ nodes: folders.map(serializeFolder), totalCount });
        })
        .get("/flat", zValidator("query", helpers.scopedQuery(z.object({}))), async (c) => {
            const { scope } = helpers.splitScopedQuery(z.object({}), c.req.valid("query"));
            helpers.assertScopeAllowed(c, scope);
            return c.json((await c.var.dam.folders.findAllFlat(scope)).map(serializeFolder));
        })
        .get("/by-name", zValidator("query", helpers.scopedQuery(byNameArgs)), async (c) => {
            const { scope, args } = helpers.splitScopedQuery(byNameArgs, c.req.valid("query"));
            helpers.assertScopeAllowed(c, scope);
            const folder = await c.var.dam.folders.findOneByNameAndParentId(args, scope);
            return c.json(folder && serializeFolder(folder));
        })
        .post("/", zValidator("json", createFolderInput.extend({ scope: scopeSchema })), async (c) => {
            const { scope: passedScope, ...input } = c.req.valid("json") as z.output<typeof createFolderInput> & { scope: Scope };
            const scope = helpers.nonEmptyScopeOrNothing(passedScope);
            helpers.assertScopeAllowed(c, scope);
            if (input.parentId) {
                const parent = await findFolderOrFail(c, input.parentId);
                if (!scopesAreEqual(helpers.nonEmptyScopeOrNothing(parent.scope), scope)) {
                    throw badRequest("Parent folder scope doesn't match passed scope");
                }
            }
            return c.json(serializeFolder(await c.var.dam.folders.create(input, scope)), 201);
        })
        .post("/move", zValidator("json", z.object({ folderIds: z.array(z.uuid()), targetFolderId: z.uuid().nullable() })), async (c) => {
            const { folderIds, targetFolderId } = c.req.valid("json");
            const targetFolder = targetFolderId ? await findFolderOrFail(c, targetFolderId) : null;
            for (const folderId of folderIds) {
                const folder = await findFolderOrFail(c, folderId);
                if (targetFolder && !scopesAreEqual(targetFolder.scope, folder.scope)) {
                    throw badRequest("Target folder scope doesn't match folder scope");
                }
            }
            return c.json((await c.var.dam.folders.moveBatch({ folderIds, targetFolderId })).map(serializeFolder));
        })
        .get("/:id", zValidator("param", idParam), async (c) => {
            const folder = await findFolderOrFail(c, c.req.valid("param").id);
            const parents = await c.var.dam.folders.findAncestors(folder);
            return c.json({ ...serializeFolder(folder), parents: parents.map(serializeFolder) });
        })
        .get("/:id/zip", zValidator("param", idParam), async (c) => {
            const folder = await findFolderOrFail(c, c.req.valid("param").id);
            return c.body(await c.var.dam.folders.createZip(folder.id), 200, {
                "content-type": "application/zip",
                "content-disposition": contentDisposition("attachment", `${folder.name}.zip`),
                "cache-control": "no-store",
            });
        })
        .patch("/:id", zValidator("param", idParam), zValidator("json", updateFolderInput), async (c) => {
            const folder = await findFolderOrFail(c, c.req.valid("param").id);
            const input = c.req.valid("json");
            if (input.parentId) {
                const parent = await findFolderOrFail(c, input.parentId);
                if (!scopesAreEqual(parent.scope, folder.scope)) {
                    throw badRequest("Parent folder scope doesn't match folder scope");
                }
            }
            return c.json(serializeFolder(await c.var.dam.folders.update(folder, input)));
        })
        .delete("/:id", zValidator("param", idParam), async (c) => {
            const folder = await findFolderOrFail(c, c.req.valid("param").id);
            return c.json({ deleted: await c.var.dam.folders.delete(folder.id) });
        });
}
