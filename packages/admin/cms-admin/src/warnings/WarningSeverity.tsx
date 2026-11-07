import { StatusIndicator, type StatusIndicatorStatus } from "@dextinity/ui";
import { defineMessages, useIntl } from "react-intl";

import type { GQLWarningSeverity } from "../graphql.generated";

export const warningSeverityStatus: Record<GQLWarningSeverity, StatusIndicatorStatus> = {
    high: "critical",
    medium: "warning",
    low: "info",
};

export const warningSeverityLabels = defineMessages({
    high: { id: "dextinity.warnings.warningSeverity.high", defaultMessage: "High" },
    medium: { id: "dextinity.warnings.warningSeverity.medium", defaultMessage: "Medium" },
    low: { id: "dextinity.warnings.warningSeverity.low", defaultMessage: "Low" },
});

export function WarningSeverity({ severity }: { severity: GQLWarningSeverity }) {
    const intl = useIntl();
    return <StatusIndicator status={warningSeverityStatus[severity]}>{intl.formatMessage(warningSeverityLabels[severity])}</StatusIndicator>;
}
