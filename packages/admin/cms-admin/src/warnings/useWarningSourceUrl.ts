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

/**
 * Returns a function that gives the loader of the admin URL of a warning's source, or `undefined` when the admin can't open the source,
 * e.g. for a warning of a failing job.
 */
export function useWarningSourceUrlResolver() {
    const { entityDependencyMap } = useDependenciesConfig();
    const apolloClient = useApolloClient();
    const contentScope = useContentScope();

    return (sourceInfo: WarningSourceInfo, scope?: ContentScope): (() => Promise<string>) | undefined => {
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
    };
}

export function useWarningSourceUrl(sourceInfo: WarningSourceInfo, scope?: ContentScope) {
    return useWarningSourceUrlResolver()(sourceInfo, scope);
}
