import { createContext, useContext } from "react";

export const InsideMjmlWrapperContext = createContext<boolean>(false);

/** Returns `true` when rendered inside a custom `MjmlWrapper` subtree. Internal use only. */
export function useIsInsideMjmlWrapper(): boolean {
    return useContext(InsideMjmlWrapperContext);
}
