import { capitalCase } from "change-case";
import { type ReactNode, useCallback } from "react";

import { useDependenciesConfig } from "../dependencies/dependenciesConfig";

export function useFullTextSearchTypeLabel(): (options: { type: string; entityName: string }) => ReactNode {
    const { entityDependencyMap } = useDependenciesConfig();

    return useCallback(
        ({ type, entityName }) => entityDependencyMap[type]?.displayName ?? entityDependencyMap[entityName]?.displayName ?? capitalCase(type),
        [entityDependencyMap],
    );
}
