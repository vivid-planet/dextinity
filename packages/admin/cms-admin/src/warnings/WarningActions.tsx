import { useApolloClient } from "@apollo/client/react";
import { messages, Tooltip } from "@dextinity/admin";
import { ArrowRight, OpenNewTab } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router";

import { type ContentScope, useContentScope } from "../contentScope/Provider";
import { useEntity } from "../entities/entitiesConfig";

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
    const navigate = useNavigate();
    const apolloClient = useApolloClient();
    const contentScope = useContentScope();
    const { createUrl } = useContentScope();

    const entity = useEntity(sourceInfo.rootEntityName);

    if (!entity) {
        return null;
    } // to some warnings it cannot be linked to. When missing a dependency or for example a failing job cannot be resolved in the admin and therefore cannot have a link

    const loadUrl = async () => {
        const path = await entity.resolvePath({
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

                        navigate(url);
                    }}
                >
                    <ArrowRight />
                </IconButton>
            </Tooltip>
        </div>
    );
}
