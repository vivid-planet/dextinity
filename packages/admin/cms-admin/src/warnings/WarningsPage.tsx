import { Stack, StackToolbar } from "@dextinity/admin";
import { useIntl } from "react-intl";

import { ContentScopeIndicator } from "../contentScope/ContentScopeIndicator";
import { useContentScopeConfig } from "../contentScope/useContentScopeConfig";
import { useRoutePathBelowContentScope } from "../contentScope/useRoutePathBelowContentScope";
import { WarningsGrid, type WarningsGridProps } from "./WarningsGrid";

export type WarningsPageProps = WarningsGridProps;

export function WarningsPage({ showAllScopes }: WarningsPageProps) {
    const intl = useIntl();
    const location = useRoutePathBelowContentScope();
    useContentScopeConfig({ redirectPathAfterChange: location });

    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "dextinity.warnings.warnings", defaultMessage: "Warnings" })}>
            <StackToolbar scopeIndicator={<ContentScopeIndicator global={showAllScopes} />} />
            <WarningsGrid showAllScopes={showAllScopes} />
        </Stack>
    );
}
