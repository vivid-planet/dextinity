import type { FilterQuery } from "@mikro-orm/postgresql";

import type { DamScopeInterface } from "../types";
import type { DamSettings } from "./entities/dam-settings.entity";

export function damSettingsByScope(scope?: DamScopeInterface): FilterQuery<DamSettings> {
    // An object condition on a JSON property is matched per key, so it would also match the settings of a scope with additional parts
    return { scope: scope ? { $eq: { ...scope } } : null };
}
