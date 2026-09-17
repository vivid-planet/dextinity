import type { EntityClass } from "@mikro-orm/postgresql";

import { resolveEntityClass } from "../../mikro-orm/helper/resolve-entity-class";
import { PAGE_TREE_ENTITY } from "../page-tree.constants";
import type { PageTreeNodeInterface } from "../types";

/** Resolves the concrete page tree node entity provided by the application. */
export function resolvePageTreeNodeEntity(): EntityClass<PageTreeNodeInterface> {
    return resolveEntityClass<PageTreeNodeInterface>(PAGE_TREE_ENTITY);
}
