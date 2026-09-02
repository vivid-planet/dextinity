import { useContext } from "react";

import type { ContentScope } from "../../contentScope/Provider";
import { DamScopeContext } from "./DamScopeContext";

function useDamScope(): ContentScope {
    return useContext(DamScopeContext);
}

export { useDamScope };
