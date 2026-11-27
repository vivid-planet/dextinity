import { useApolloClient } from "@apollo/client/react";
import { messages, Tooltip } from "@dextinity/admin";
import { ArrowRight, OpenNewTab } from "@dextinity/admin-icons";
import { Box, IconButton } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router";

import { type ContentScope, useContentScope } from "../contentScope/Provider";
import { useEntity } from "../entities/entitiesConfig";
import { resolveDependencyScope } from "./resolveDependencyScope";

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
    const entity = useEntity(graphqlObjectType);
    const apolloClient = useApolloClient();
    const navigate = useNavigate();
    const contentScope = useContentScope();

    if (entity === undefined) {
        if (process.env.NODE_ENV === "development") {
            console.warn(`Cannot load URL because no entity ${graphqlObjectType} was registered in DextinityConfig.entities`);
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
                <Box
                    sx={{
                        display: "flex",
                    }}
                >
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
        const path = await entity.resolvePath({
            rootColumnName,
            jsonPath,
            apolloClient,
            id,
        });

        const scopeUrl = scopeToOpen ? contentScope.createUrl(scopeToOpen) : contentScope.match.url;

        return scopeUrl + path;
    };

    return (
        <Box
            sx={{
                display: "flex",
            }}
        >
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

                        navigate(url);
                    }}
                >
                    <ArrowRight />
                </IconButton>
            </Tooltip>
        </Box>
    );
};
