import { useDextinityConfig } from "../config/DextinityConfigContext";
import type { DependencyInterface } from "./types";

export type DependenciesConfig = {
    entityDependencyMap: EntityDependencyMap;
};

interface EntityDependencyMap {
    [graphqlObjectType: string]: DependencyInterface;
}

export function useDependenciesConfig(): DependenciesConfig {
    const dextinityConfig = useDextinityConfig();

    if (!dextinityConfig.dependencies) {
        return { entityDependencyMap: {} };
    }

    return dextinityConfig.dependencies;
}
