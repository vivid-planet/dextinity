import { createContext } from "react";

import type { ContentScope } from "../../contentScope/Provider";

export const DamScopeContext = createContext<ContentScope>({});
