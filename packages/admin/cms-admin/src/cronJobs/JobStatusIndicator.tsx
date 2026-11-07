import { StatusIndicator, type StatusIndicatorStatus } from "@dextinity/ui";
import { defineMessages, useIntl } from "react-intl";

import type { GQLKubernetesJobStatus } from "../graphql.generated";

const jobStatusIndicator: Record<GQLKubernetesJobStatus, StatusIndicatorStatus> = {
    pending: "info",
    active: "running",
    succeeded: "published",
    failed: "critical",
};

const jobStatusLabels = defineMessages({
    pending: { id: "dextinity.jobStatus.pending", defaultMessage: "Pending" },
    active: { id: "dextinity.jobStatus.active", defaultMessage: "Running" },
    succeeded: { id: "dextinity.jobStatus.succeeded", defaultMessage: "Succeeded" },
    failed: { id: "dextinity.jobStatus.failed", defaultMessage: "Failed" },
});

export function JobStatusIndicator({ status }: { status: GQLKubernetesJobStatus }) {
    const intl = useIntl();
    return <StatusIndicator status={jobStatusIndicator[status]}>{intl.formatMessage(jobStatusLabels[status])}</StatusIndicator>;
}
