import type { ReactNode } from "react";

import { type ContentScope, useContentScope } from "../../contentScope/Provider";
import { useDamConfig } from "./damConfig";
import { DamScopeContext } from "./DamScopeContext";

export function DamScopeProvider({ children }: { children?: ReactNode }) {
    const { scopeParts = [] } = useDamConfig();
    const { scope: completeScope } = useContentScope();

    const damScope = scopeParts.reduce((damScope, scope) => {
        if (completeScope[scope] !== undefined) {
            damScope[scope] = completeScope[scope];
        }
        return damScope;
    }, {} as ContentScope);

    return <DamScopeContext.Provider value={damScope}>{children}</DamScopeContext.Provider>;
}
