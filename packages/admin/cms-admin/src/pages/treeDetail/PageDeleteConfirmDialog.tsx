import { Button, Dialog, Icon, KeyValueList, type KeyValueListItem, StatusIndicator } from "@dextinity/ui";
import { useIntl } from "react-intl";

import type { GQLPageTreeNodeVisibility } from "../../graphql.generated";
import type { GQLPageTreePageFragment } from "../pageTree/usePageTree";
import { usePageTreeStatusLabels, visibilityStatus } from "./pageTreeStatus";

const visibilities: GQLPageTreeNodeVisibility[] = ["Published", "Unpublished", "Archived"];

interface PageDeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** The pages that are deleted, including the subpages. */
    pages: GQLPageTreePageFragment[];
    /** The page the deletion started from, named in the title when it is the only one selected. */
    page?: GQLPageTreePageFragment;
    onConfirm: () => void;
    loading?: boolean;
}

/**
 * Asks before deleting pages for good, with how many of each status go with them. Deleting can't be undone, unlike archiving.
 */
export function PageDeleteConfirmDialog({ open, onOpenChange, pages, page, onConfirm, loading }: PageDeleteConfirmDialogProps) {
    const intl = useIntl();
    const statusLabels = usePageTreeStatusLabels();
    const subpageCount = page != null ? pages.length - 1 : 0;

    const counts: KeyValueListItem[] = visibilities.flatMap((visibility) => {
        const count = pages.filter((deletedPage) => deletedPage.visibility === visibility).length;
        if (count === 0) {
            return [];
        }
        const status = visibilityStatus[visibility];
        return [
            {
                key: statusLabels[status as keyof typeof statusLabels],
                value: (
                    <StatusIndicator status={status} labels={statusLabels}>
                        {intl.formatMessage(
                            { id: "dextinity.pageTreeDetail.delete.count", defaultMessage: "{count, plural, one {# page} other {# pages}}" },
                            { count },
                        )}
                    </StatusIndicator>
                ),
            },
        ];
    });

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            role="alertdialog"
            size="small"
            hideCloseButton
            dismissible={!loading}
            title={
                page != null
                    ? intl.formatMessage(
                          {
                              id: "dextinity.pageTreeDetail.delete.titleWithSubpages",
                              defaultMessage: "Delete “{name}”{subpages, plural, =0 {} one { and # subpage} other { and # subpages}}?",
                          },
                          { name: page.name, subpages: subpageCount },
                      )
                    : intl.formatMessage(
                          { id: "dextinity.pageTreeDetail.delete.title", defaultMessage: "Delete {count, plural, one {# page} other {# pages}}?" },
                          { count: pages.length },
                      )
            }
            description={intl.formatMessage({
                id: "dextinity.pageTreeDetail.delete.description",
                defaultMessage: "Deleted pages can't be restored, and links to them stop working. Archive them to keep them.",
            })}
            footer={
                <>
                    <Button variant="text" color="secondary" disabled={loading} onClick={() => onOpenChange(false)}>
                        {intl.formatMessage({ id: "dextinity.pageTreeDetail.delete.cancel", defaultMessage: "Cancel" })}
                    </Button>
                    <Button variant="outlined" color="error" startIcon={<Icon name="delete" />} loading={loading} onClick={onConfirm}>
                        {intl.formatMessage({ id: "dextinity.pageTreeDetail.delete.confirm", defaultMessage: "Delete" })}
                    </Button>
                </>
            }
        >
            <KeyValueList items={counts} />
        </Dialog>
    );
}
