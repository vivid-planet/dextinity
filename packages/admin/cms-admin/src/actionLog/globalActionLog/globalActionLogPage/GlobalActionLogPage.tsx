import { Stack, StackToolbar } from "@comet/admin";
import { useIntl } from "react-intl";

import { ContentScopeIndicator } from "../../../contentScope/ContentScopeIndicator";
import { GlobalActionLogGrid } from "../globalActionLogGrid/GlobalActionLogGrid";

export function GlobalActionLogPage() {
    const intl = useIntl();
    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "comet.globalActionLog.title", defaultMessage: "Action Log" })}>
            <StackToolbar scopeIndicator={<ContentScopeIndicator global />} />
            <GlobalActionLogGrid />
        </Stack>
    );
}
