import { Dialog } from "@dextinity/admin";
import { useIntl } from "react-intl";

import { ActionLogCompare } from "../../components/actionLogCompare/ActionLogCompare";
import { ActionLogShowVersion } from "../../components/actionLogShowVersion/ActionLogShowVersion";
import type { GQLActionLogRowFragment } from "../actionLogsQuery.generated";

export type ActionLogShowVersionDialogProps = {
    row: GQLActionLogRowFragment | null;
    open: boolean;
    onClose: () => void;
};

export function ActionLogShowVersionDialog({ row, open, onClose }: ActionLogShowVersionDialogProps) {
    const intl = useIntl();
    const previous = row?.previousVersion ?? undefined;

    return (
        <Dialog
            fullWidth
            maxWidth={previous ? "xl" : "md"}
            onClose={onClose}
            open={open}
            title={intl.formatMessage({
                id: "dextinity.actionLog.entity.versionDialog.title",
                defaultMessage: "Action Log",
            })}
        >
            {row && previous && <ActionLogCompare afterVersion={row} beforeVersion={previous} loading={false} id={row.id} />}
            {row && !previous && <ActionLogShowVersion actionLog={row} loading={false} id={row.id} />}
        </Dialog>
    );
}
