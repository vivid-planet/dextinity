import { capitalCase } from "change-case";
import { type ReactNode, useCallback } from "react";

import { useDextinityConfig } from "../config/DextinityConfigContext";
import { useDependenciesConfig } from "../dependencies/dependenciesConfig";

export function useFullTextSearchTypeLabel(): (options: { type: string; entityName: string }) => ReactNode {
    const { entityDependencyMap } = useDependenciesConfig();
    const { pageTree } = useDextinityConfig();

    return useCallback(
        ({ type, entityName }) =>
            entityDependencyMap[type]?.displayName ??
            pageTree?.documentTypes[type]?.displayName ??
            entityDependencyMap[entityName]?.displayName ??
            capitalCase(type),
        [entityDependencyMap, pageTree],
    );
}
