import { useQuery } from "@apollo/client";
import { Dialog, InlineAlert } from "@comet/admin";
import { FormattedMessage, useIntl } from "react-intl";

import { ActionLogCompare } from "../../components/actionLogCompare/ActionLogCompare";
import { ActionLogShowVersion } from "../../components/actionLogShowVersion/ActionLogShowVersion";
import { globalActionLogShowVersionQuery } from "./GlobalActionLogShowVersionDialog.gql";
import type {
    GQLGlobalActionLogShowVersionQuery,
    GQLGlobalActionLogShowVersionQueryVariables,
} from "./GlobalActionLogShowVersionDialog.gql.generated";

type GlobalActionLogShowVersionDialogProps = {
    actionLogId: string | null;
    open: boolean;
    onClose: () => void;
};

export function GlobalActionLogShowVersionDialog({ actionLogId, open, onClose }: GlobalActionLogShowVersionDialogProps) {
    const intl = useIntl();

    const { data, loading, error } = useQuery<GQLGlobalActionLogShowVersionQuery, GQLGlobalActionLogShowVersionQueryVariables>(
        globalActionLogShowVersionQuery,
        {
            variables: { id: actionLogId ?? "" },
            skip: !open || actionLogId === null,
        },
    );

    const current = data?.actionLog;
    const previous = current?.previousVersion ?? undefined;
    const hasDiff = current != null && previous != null;

    return (
        <Dialog
            fullWidth
            maxWidth={hasDiff ? "xl" : "md"}
            onClose={onClose}
            open={open}
            title={intl.formatMessage({
                id: "comet.globalActionLog.versionDialog.title",
                defaultMessage: "Action Log",
            })}
        >
            {error && (
                <InlineAlert title={<FormattedMessage id="comet.globalActionLog.versionDialog.error" defaultMessage="Error loading version" />} />
            )}
            {!error && actionLogId !== null && hasDiff && (
                <ActionLogCompare afterVersion={current} beforeVersion={previous} error={Boolean(error)} id={actionLogId} loading={loading} />
            )}
            {!error && actionLogId !== null && !hasDiff && (
                <ActionLogShowVersion actionLog={current ?? undefined} error={Boolean(error)} id={actionLogId} loading={loading} />
            )}
        </Dialog>
    );
}
