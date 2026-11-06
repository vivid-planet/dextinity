import { useApolloClient } from "@apollo/client";

import { type ContentScope, useContentScope } from "../contentScope/Provider";
import { useDependenciesConfig } from "../dependencies/dependenciesConfig";
import type { DependencyInterface } from "../dependencies/types";

export interface WarningSourceInfo {
    rootEntityName: string;
    targetId: string;
    jsonPath: string | null;
    rootColumnName: string | null;
}

export function useWarningSourceUrl(sourceInfo: WarningSourceInfo, scope?: ContentScope) {
    const { entityDependencyMap } = useDependenciesConfig();
    const apolloClient = useApolloClient();
    const contentScope = useContentScope();

    const dependencyObject = entityDependencyMap[sourceInfo.rootEntityName] as DependencyInterface | undefined;

    if (!dependencyObject) {
        return undefined;
    }

    return async () => {
        const path = await dependencyObject.resolvePath({
            rootColumnName: sourceInfo.rootColumnName ?? undefined,
            jsonPath: sourceInfo.jsonPath ?? undefined,
            apolloClient,
            id: sourceInfo.targetId,
        });

        const scopeUrl = scope ? contentScope.createUrl({ ...contentScope.scope, ...scope }) : contentScope.match.url;
        return scopeUrl + path;
    };
}
