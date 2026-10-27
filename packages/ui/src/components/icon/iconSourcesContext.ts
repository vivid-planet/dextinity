import { createContext, useContext } from "react";

import type { IconSources } from "./iconRegistry";

export const IconSourcesContext = createContext<IconSources | undefined>(undefined);

export function useIconSources(): IconSources | undefined {
    return useContext(IconSourcesContext);
}
