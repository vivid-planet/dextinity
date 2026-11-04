import { useApolloClient } from "@apollo/client";
import { messages, Tooltip } from "@dextinity/admin";
import { ArrowRight, OpenNewTab } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";

import { type ContentScope, useContentScope } from "../contentScope/Provider";
import { useDependenciesConfig } from "../dependencies/dependenciesConfig";
import type { DependencyInterface } from "../dependencies/types";

interface Props {
    sourceInfo: {
        rootEntityName: string;
        targetId: string;
        jsonPath: string | null;
        rootColumnName: string | null;
    };
    scope?: ContentScope;
}

export function WarningActions({ sourceInfo, scope }: Props) {
    const history = useHistory();
    const { entityDependencyMap } = useDependenciesConfig();
    const apolloClient = useApolloClient();
    const contentScope = useContentScope();
    const { createUrl } = useContentScope();

    const dependencyObject = entityDependencyMap[sourceInfo.rootEntityName] as DependencyInterface | undefined;

    if (!dependencyObject) {
        return null;
    } // to some warnings it cannot be linked to. When missing a dependency or for example a failing job cannot be resolved in the admin and therefore cannot have a link

    if (dependencyObject === undefined) {
        if (process.env.NODE_ENV === "development") {
            console.warn(
                `Cannot load URL because no implementation of DependencyInterface for ${sourceInfo.rootEntityName} was provided via the DependenciesConfig`,
            );
        }
        return <FormattedMessage id="dextinity.dependencies.dataGrid.cannotLoadUrl" defaultMessage="Cannot determine URL" />;
    }

    const loadUrl = async () => {
        const path = await dependencyObject.resolvePath({
            rootColumnName: sourceInfo.rootColumnName ?? undefined,
            jsonPath: sourceInfo.jsonPath ?? undefined,
            apolloClient,
            id: sourceInfo.targetId,
        });

        const scopeUrl = scope ? createUrl({ ...contentScope.scope, ...scope }) : contentScope.match.url;
        return scopeUrl + path;
    };

    return (
        <div style={{ display: "flex" }}>
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
        </div>
    );
}
