import type { EntityClass } from "@mikro-orm/postgresql";

import { resolveEntityClass } from "../../mikro-orm/helper/resolve-entity-class.js";
import { PAGE_TREE_ENTITY } from "../page-tree.constants.js";
import type { PageTreeNodeInterface } from "../types.js";

export function resolvePageTreeNodeEntity(): EntityClass<PageTreeNodeInterface> {
    return resolveEntityClass<PageTreeNodeInterface>(PAGE_TREE_ENTITY);
}
