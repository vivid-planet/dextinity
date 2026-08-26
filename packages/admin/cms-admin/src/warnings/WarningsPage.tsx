import { Stack, StackToolbar } from "@dextinity/admin";
import { useIntl } from "react-intl";

import { ContentScopeIndicator } from "../contentScope/ContentScopeIndicator";
import { WarningsGrid } from "./WarningsGrid";

export function WarningsPage() {
    const intl = useIntl();
    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "dextinity.warnings.warnings", defaultMessage: "Warnings" })}>
            <StackToolbar scopeIndicator={<ContentScopeIndicator global />} />
            <WarningsGrid />
        </Stack>
    );
}
