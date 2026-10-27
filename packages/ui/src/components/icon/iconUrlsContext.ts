import { createContext, useContext } from "react";

import type { IconUrls } from "./iconRegistry";

export const IconUrlsContext = createContext<IconUrls | undefined>(undefined);

export function useIconUrls(): IconUrls | undefined {
    return useContext(IconUrlsContext);
}
