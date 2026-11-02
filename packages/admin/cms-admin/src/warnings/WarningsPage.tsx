import { Stack, StackToolbar, useCurrentRouteMatch } from "@dextinity/admin";
import { useIntl } from "react-intl";

import { ContentScopeIndicator } from "../contentScope/ContentScopeIndicator";
import { useContentScope } from "../contentScope/Provider";
import { useContentScopeConfig } from "../contentScope/useContentScopeConfig";
import { WarningsGrid, type WarningsGridProps } from "./WarningsGrid";

export type WarningsPageProps = WarningsGridProps;

export function WarningsPage({ showAllScopes }: WarningsPageProps) {
    const intl = useIntl();
    const { match } = useContentScope();
    const routeMatch = useCurrentRouteMatch();
    const location = routeMatch.url.replace(match.url, "");
    useContentScopeConfig({ redirectPathAfterChange: location });

    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "dextinity.warnings.warnings", defaultMessage: "Warnings" })}>
            <StackToolbar scopeIndicator={<ContentScopeIndicator global={showAllScopes} />} />
            <WarningsGrid showAllScopes={showAllScopes} />
        </Stack>
    );
}
