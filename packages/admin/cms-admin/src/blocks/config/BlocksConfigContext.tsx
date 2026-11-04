import { createContext, type PropsWithChildren, useContext } from "react";

import type { ContentScope } from "../../contentScope/Provider";
import type { BlockInterface } from "../types";

export type BlocksConfig = {
    /**
     * Check if a block is supported in the current scope.
     *
     * @param block The block.
     * @param scope The current content scope.
     * @returns {boolean} True if the block is supported in the current scope.
     */
    isBlockSupported?: (block: BlockInterface, scope: ContentScope) => boolean;
};

const BlocksConfigContext = createContext<BlocksConfig>({});

export function useBlocksConfig() {
    return useContext(BlocksConfigContext);
}

export function BlocksConfigProvider({ children, ...value }: PropsWithChildren<BlocksConfig>) {
    return <BlocksConfigContext.Provider value={value}>{children}</BlocksConfigContext.Provider>;
}
