import type { ReactNode } from "react";

import { DamScopeContext } from "./DamScopeContext";
import { useDamScopeFromContentScope } from "./useDamScope";

export function DamScopeProvider({ children }: { children?: ReactNode }) {
    const damScope = useDamScopeFromContentScope();

    return <DamScopeContext.Provider value={damScope}>{children}</DamScopeContext.Provider>;
}
