import { useApolloClient } from "@apollo/client";
import { messages, Tooltip } from "@dextinity/admin";
import { ArrowRight, OpenNewTab } from "@dextinity/admin-icons";
import { Box, IconButton } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";

import { type ContentScope, useContentScope } from "../contentScope/Provider";
import { useDependenciesConfig } from "./dependenciesConfig";
import { resolveDependencyScope } from "./resolveDependencyScope";
import type { DependencyInterface } from "./types";

interface DependencyActionsProps {
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

export const DependencyActions = ({ graphqlObjectType, id, rootColumnName, jsonPath, scope }: DependencyActionsProps) => {
    const { entityDependencyMap } = useDependenciesConfig();
    const apolloClient = useApolloClient();
    const history = useHistory();
    const contentScope = useContentScope();

    const dependencyObject = entityDependencyMap[graphqlObjectType] as DependencyInterface | undefined;

    if (dependencyObject === undefined) {
        if (process.env.NODE_ENV === "development") {
            console.warn(
                `Cannot load URL because no implementation of DependencyInterface for ${graphqlObjectType} was provided via the DependenciesConfig`,
            );
        }
        return <FormattedMessage id="dextinity.dependencies.dataGrid.cannotLoadUrl" defaultMessage="Cannot determine URL" />;
    }

    const scopeToOpen = scope && resolveDependencyScope({ scope, activeScope: contentScope.scope, availableScopes: contentScope.values });

    if (scope !== undefined && scopeToOpen === undefined) {
        return (
            <Tooltip
                title={
                    <FormattedMessage
                        id="dextinity.dependencies.dataGrid.scopeNotAllowed"
                        defaultMessage="You don't have access to the scope of this item."
                    />
                }
            >
                <Box display="flex">
                    <IconButton disabled>
                        <OpenNewTab />
                    </IconButton>
                    <IconButton disabled>
                        <ArrowRight />
                    </IconButton>
                </Box>
            </Tooltip>
        );
    }

    const loadUrl = async () => {
        const path = await dependencyObject.resolvePath({
            rootColumnName,
            jsonPath,
            apolloClient,
            id,
        });

        const scopeUrl = scopeToOpen ? contentScope.createUrl(scopeToOpen) : contentScope.match.url;

        return scopeUrl + path;
    };

    return (
        <Box display="flex">
            <Tooltip title={<FormattedMessage {...messages.openInNewTab} />}>
                <IconButton
                    onClick={async () => {
                        const url = await loadUrl();
                        window.open(url, "_blank");
                    }}
                >
                    <OpenNewTab />
                </IconButton>
            </Tooltip>
            <Tooltip title={<FormattedMessage {...messages.openInThisTab} />}>
                <IconButton
                    onClick={async () => {
                        const url = await loadUrl();

                        history.push(url);
                    }}
                >
                    <ArrowRight />
                </IconButton>
            </Tooltip>
        </Box>
    );
};
