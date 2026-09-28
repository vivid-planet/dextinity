import { useQuery } from "@apollo/client";
import { Dialog } from "@dextinity/admin";
import { useIntl } from "react-intl";

import { type ContentScope, useContentScope } from "../../../contentScope/Provider";
import { ActionLogCompare } from "../../components/actionLogCompare/ActionLogCompare";
import { ActionLogShowVersion } from "../../components/actionLogShowVersion/ActionLogShowVersion";
import { actionLogsQuery } from "../actionLogsQuery";
import type { GQLActionLogRowFragment, GQLActionLogsQuery, GQLActionLogsQueryVariables } from "../actionLogsQuery.generated";

export type ActionLogShowVersionDialogProps = {
    /**
     * Class name of the logged entity, for instance `"News"`.
     */
    entity: string;
    row: GQLActionLogRowFragment | null;
    open: boolean;
    onClose: () => void;
};

export function ActionLogShowVersionDialog({ entity, row, open, onClose }: ActionLogShowVersionDialogProps) {
    const intl = useIntl();
    const { scope } = useContentScope();

    const { data, loading } = useQuery<GQLActionLogsQuery, GQLActionLogsQueryVariables>(actionLogsQuery, {
        variables: {
            entity,
            scope: scope as ContentScope,
            offset: 0,
            limit: 1,
            filter: {
                entityId: { equal: row?.entityId },
                version: { lowerThan: row?.version },
            },
            sort: [{ field: "version", direction: "DESC" }],
        },
        skip: !open || row === null || row.version <= 1,
    });

    const previous = data?.actionLogs?.nodes[0] ?? undefined;
    const hasDiff = row != null && previous != null;

    return (
        <Dialog
            fullWidth
            maxWidth={hasDiff ? "xl" : "md"}
            onClose={onClose}
            open={open}
            title={intl.formatMessage({
                id: "dextinity.actionLog.entity.versionDialog.title",
                defaultMessage: "Action Log",
            })}
        >
            {row && hasDiff && <ActionLogCompare afterVersion={row} beforeVersion={previous} error={false} loading={loading} id={row.id} />}
            {row && !hasDiff && <ActionLogShowVersion actionLog={row} error={false} loading={loading} id={row.id} />}
        </Dialog>
    );
}
