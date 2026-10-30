import { Stack, StackToolbar } from "@dextinity/admin";
import { useIntl } from "react-intl";

import { ContentScopeIndicator } from "../../../contentScope/ContentScopeIndicator";
import { GlobalActionLogGrid } from "../globalActionLogGrid/GlobalActionLogGrid";

export function GlobalActionLogPage() {
    const intl = useIntl();
    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "dextinity.globalActionLog.title", defaultMessage: "Action Log" })}>
            <StackToolbar scopeIndicator={<ContentScopeIndicator global />} />
            <GlobalActionLogGrid />
        </Stack>
    );
}
