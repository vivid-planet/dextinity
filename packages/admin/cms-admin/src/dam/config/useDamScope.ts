import { useContext, useMemo } from "react";

import { useDextinityConfig } from "../../config/DextinityConfigContext";
import { useContentScope } from "../../contentScope/Provider";
import { DamScopeContext } from "./DamScopeContext";

function useDamScope(): Record<string, unknown> {
    return useContext(DamScopeContext);
}

/**
 * The DAM scope of the content scope that is currently edited.
 *
 * In contrast to `useDamScope` it doesn't require a `DamScopeProvider` above, which is only mounted by the DAM, the pages page and the file field.
 */
function useDamScopeFromContentScope(): Record<string, unknown> {
    const { dam } = useDextinityConfig();
    const { scope: contentScope } = useContentScope();
    const scopeParts = dam?.scopeParts;

    return useMemo(() => {
        return (scopeParts ?? []).reduce<Record<string, unknown>>((damScope, scopePart) => {
            if (contentScope[scopePart] !== undefined) {
                damScope[scopePart] = contentScope[scopePart];
            }
            return damScope;
        }, {});
    }, [contentScope, scopeParts]);
}

export { useDamScope, useDamScopeFromContentScope };
