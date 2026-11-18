import { Toolbar, ToolbarBackButton, ToolbarTitleItem } from "@dextinity/admin";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { ActionLogsGrid } from "../../actionLog/actionLog/actionLogsGrid/ActionLogsGrid";
import { useDamScope } from "../config/useDamScope";

type DamActionLogProps = {
    contentScopeIndicator?: ReactNode;
};

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
            <ActionLogsGrid entity="DamFolder" scope={damScope} />
        </>
    );
}
