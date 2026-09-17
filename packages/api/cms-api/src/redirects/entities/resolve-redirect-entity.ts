import type { EntityClass } from "@mikro-orm/postgresql";

import { resolveEntityClass } from "../../mikro-orm/helper/resolve-entity-class";
import type { RedirectInterface } from "./redirect-entity.factory";

const REDIRECT_ENTITY_NAME = "Redirect";

/** Resolves the concrete redirect entity created by `RedirectEntityFactory.create()`. */
export function resolveRedirectEntity(): EntityClass<RedirectInterface> {
    return resolveEntityClass<RedirectInterface>(REDIRECT_ENTITY_NAME);
}
