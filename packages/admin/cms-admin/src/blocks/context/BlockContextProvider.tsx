import type { PropsWithChildren } from "react";

import { type BlockContext, CustomBlockContext } from "./BlockContext";

interface Props {
    value: Omit<BlockContext, "apiUrl" | "apolloClient" | "damBasePath" | "pageTreeScope">;
}

export const BlockContextProvider = ({ value, children }: PropsWithChildren<Props>) => {
    return <CustomBlockContext.Provider value={value}>{children}</CustomBlockContext.Provider>;
};
