import { RouterTab, RouterTabs, Toolbar, ToolbarBackButton, ToolbarTitleItem } from "@dextinity/admin";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { ActionLogsGrid } from "../../actionLog/actionLog/actionLogsGrid/ActionLogsGrid";
import { useDamScope } from "../config/useDamScope";

type DamActionLogProps = {
    contentScopeIndicator?: ReactNode;
};

function getMediaAlternativeDisplayName(snapshot: Record<string, unknown>): string | undefined {
    const { type, language } = snapshot;
    return typeof type === "string" && typeof language === "string" ? `${type} (${language})` : undefined;
}

export function DamActionLog({ contentScopeIndicator }: DamActionLogProps) {
    const damScope = useDamScope();

    return (
        <>
            <Toolbar scopeIndicator={contentScopeIndicator}>
                <ToolbarBackButton />
                <ToolbarTitleItem>
                    <FormattedMessage id="dextinity.dam.actionLog.title" defaultMessage="Action Log" />
                </ToolbarTitleItem>
            </Toolbar>
            <RouterTabs>
                <RouterTab path="" label={<FormattedMessage id="dextinity.dam.actionLog.files" defaultMessage="Files" />}>
                    <ActionLogsGrid entity="DamFile" scope={damScope} />
                </RouterTab>
                <RouterTab path="/folders" label={<FormattedMessage id="dextinity.dam.actionLog.folders" defaultMessage="Folders" />}>
                    <ActionLogsGrid entity="DamFolder" scope={damScope} />
                </RouterTab>
                <RouterTab
                    path="/media-alternatives"
                    label={<FormattedMessage id="dextinity.dam.actionLog.mediaAlternatives" defaultMessage="Media alternatives" />}
                >
                    <ActionLogsGrid entity="DamMediaAlternative" scope={damScope} getDisplayName={getMediaAlternativeDisplayName} />
                </RouterTab>
            </RouterTabs>
        </>
    );
}
