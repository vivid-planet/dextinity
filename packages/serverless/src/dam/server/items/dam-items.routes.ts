import { Hono } from "hono";
import { z } from "zod";

import { zValidator } from "../../../core/server/index.js";
import { requirePermission } from "../../../permissions/server/index.js";
import type { DamEnv, DamRouteContext, DamRouteHelpers, DamScopeSchema } from "../dam.context.js";
import { booleanParam, paginationQuery, sortQuery, stringArrayParam } from "../dam.dto.js";

export function createDamItemsRoutes<TScopeSchema extends DamScopeSchema>(
    _context: DamRouteContext<TScopeSchema>,
    helpers: DamRouteHelpers<TScopeSchema>,
) {
    type Scope = z.infer<TScopeSchema>;

    const filterArgs = {
        folderId: z.uuid().optional(),
        includeArchived: booleanParam.optional(),
        searchText: z.string().optional(),
        mimetypes: stringArrayParam.optional(),
        ...sortQuery,
    };
    const listArgs = z.object({ ...filterArgs, ...paginationQuery });
    const positionArgs = z.object({ ...filterArgs, id: z.uuid(), type: z.enum(["File", "Folder"]) });

    return new Hono<DamEnv>()
        .use(requirePermission("dam"))
        .get("/", zValidator("query", helpers.scopedQuery(listArgs)), async (c) => {
            const { scope, args } = helpers.splitScopedQuery(listArgs, c.req.valid("query"));
            helpers.assertScopeAllowed(c, scope);
            const { offset = 0, limit = 25, ...filter } = args;
            const [items, totalCount] = await c.var.dam.items.findAndCount({ ...filter, offset, limit, scopeFilter: helpers.scopeFilter(c) }, scope);
            return c.json({
                nodes: items.map((item) =>
                    item.__typename === "DamFile"
                        ? { ...helpers.serializeFile(c, item), __typename: item.__typename }
                        : { ...item, scope: item.scope as Scope, __typename: item.__typename },
                ),
                totalCount,
            });
        })
        .get("/position", zValidator("query", helpers.scopedQuery(positionArgs)), async (c) => {
            const { scope, args } = helpers.splitScopedQuery(positionArgs, c.req.valid("query"));
            helpers.assertScopeAllowed(c, scope);
            return c.json({ position: await c.var.dam.items.getPosition(args, scope) });
        });
}
