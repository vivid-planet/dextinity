import { useApolloClient } from "@apollo/client";
import { useCallback } from "react";

import { type ContentScope, useContentScope } from "../contentScope/Provider";
import { useDependenciesConfig } from "./dependenciesConfig";
import { resolveDependencyScope } from "./resolveDependencyScope";
import type { DependencyInterface } from "./types";

export interface DependencyTarget {
    graphqlObjectType: string;
    id: string;
    rootColumnName?: string;
    jsonPath?: string;
    /**
     * Scope of the linked entity. Entities can be used across scopes (e.g. a DAM file shared between sites), which is
     * why the link must not be built with the currently active scope.
     */
    scope?: ContentScope;
}

export type DependencyUrl =
    | { status: "available"; loadUrl: () => Promise<string> }
    | { status: "unknownType"; loadUrl?: undefined }
    | { status: "scopeNotAllowed"; loadUrl?: undefined };

/**
 * Resolves where a dependency can be opened. The URL is loaded on demand, since resolving it may need a request.
 */
export function useDependencyUrlResolver(): (target: DependencyTarget) => DependencyUrl {
    const { entityDependencyMap } = useDependenciesConfig();
    const apolloClient = useApolloClient();
    const contentScope = useContentScope();

    return useCallback(
        ({ graphqlObjectType, id, rootColumnName, jsonPath, scope }) => {
            const dependencyObject = entityDependencyMap[graphqlObjectType] as DependencyInterface | undefined;
            if (dependencyObject === undefined) {
                if (process.env.NODE_ENV === "development") {
                    console.warn(
                        `Cannot load URL because no implementation of DependencyInterface for ${graphqlObjectType} was provided via the DependenciesConfig`,
                    );
                }
                return { status: "unknownType" };
            }

            const scopeToOpen = scope && resolveDependencyScope({ scope, activeScope: contentScope.scope, availableScopes: contentScope.values });
            if (scope !== undefined && scopeToOpen === undefined) {
                return { status: "scopeNotAllowed" };
            }

            return {
                status: "available",
                loadUrl: async () => {
                    const path = await dependencyObject.resolvePath({ rootColumnName, jsonPath, apolloClient, id });
                    const scopeUrl = scopeToOpen ? contentScope.createUrl(scopeToOpen) : contentScope.match.url;
                    return scopeUrl + path;
                },
            };
        },
        [entityDependencyMap, apolloClient, contentScope],
    );
}
