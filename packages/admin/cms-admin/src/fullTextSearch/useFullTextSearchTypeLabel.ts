import { capitalCase } from "change-case";
import { type ReactNode, useCallback } from "react";

import { useDextinityConfig } from "../config/DextinityConfigContext";
import { useEntitiesConfig } from "../entities/entitiesConfig";

export function useFullTextSearchTypeLabel(): (options: { type: string; entityName: string }) => ReactNode {
    const entities = useEntitiesConfig();
    const { pageTree } = useDextinityConfig();

    return useCallback(
        ({ type, entityName }) =>
            entities[type]?.displayName ?? pageTree?.documentTypes[type]?.displayName ?? entities[entityName]?.displayName ?? capitalCase(type),
        [entities, pageTree],
    );
}
