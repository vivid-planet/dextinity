import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { type ContentScope, toGqlSort, useDataGridLabels, useRemoteListPagination, useRemoteListState } from "@dextinity/cms-admin";
import {
    Button,
    Chip,
    ConfirmDialog,
    DataGrid,
    type DataGridColumn,
    EmptyState,
    FilterBar,
    Icon,
    IconButton,
    ListLayout,
    Menu,
    MenuItem,
    MenuSeparator,
    PageHeader,
    ToastViewport,
    useToasts,
} from "@dextinity/ui";
import { type JSX, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";

import type { GQLTargetGroupSortField } from "../graphql.generated";
import { CreateTargetGroupDialog } from "./CreateTargetGroupDialog";
import { deleteTargetGroupMutation, duplicateTargetGroupMutation, targetGroupsListQuery } from "./TargetGroupsListPage.gql";
import type {
    GQLDeleteTargetGroupMutation,
    GQLDeleteTargetGroupMutationVariables,
    GQLDuplicateTargetGroupMutation,
    GQLDuplicateTargetGroupMutationVariables,
    GQLTargetGroupsListQuery,
    GQLTargetGroupsListQueryVariables,
} from "./TargetGroupsListPage.gql.generated";
import { TitleCell } from "./TargetGroupsListPage.sc";
import type { ExportTargetGroupOptions } from "./TargetGroupsPage";
import { useTargetGroupContactsExport } from "./useTargetGroupContactsExport";

type TargetGroupRow = GQLTargetGroupsListQuery["brevoTargetGroups"]["nodes"][number];

const sortableColumns: GQLTargetGroupSortField[] = ["title", "updatedAt"];

interface TargetGroupsListPageProps<AdditionalAttributes extends object> {
    scope: ContentScope;
    scopeLabel: string;
    listUrl: string;
    exportTargetGroupOptions?: ExportTargetGroupOptions<AdditionalAttributes>;
}

export function TargetGroupsListPage<AdditionalAttributes extends object>({
    scope,
    scopeLabel,
    listUrl,
    exportTargetGroupOptions,
}: TargetGroupsListPageProps<AdditionalAttributes>): JSX.Element {
    const intl = useIntl();
    const client = useApolloClient();
    const history = useHistory();
    const { labels: dataGridLabels } = useDataGridLabels();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const listState = useRemoteListState({ sortableColumns, pageSizeStorageKey: "dextinity-brevo-target-groups-page-size" });
    const [createOpen, setCreateOpen] = useState(false);
    const [targetGroupToDelete, setTargetGroupToDelete] = useState<TargetGroupRow>();
    const [deleting, setDeleting] = useState(false);
    const [exportingId, setExportingId] = useState<string>();
    const exportContacts = useTargetGroupContactsExport(scope, exportTargetGroupOptions);

    const { data, previousData, loading, error } = useQuery<GQLTargetGroupsListQuery, GQLTargetGroupsListQueryVariables>(targetGroupsListQuery, {
        variables: {
            scope,
            search: listState.search || undefined,
            sort: toGqlSort<GQLTargetGroupSortField>(listState.sort),
            offset: listState.offset,
            limit: listState.limit,
        },
        context: LocalErrorScopeApolloContext,
        fetchPolicy: "cache-and-network",
    });
    const shownData = data ?? previousData;
    const rows = shownData?.brevoTargetGroups.nodes ?? [];
    const total = shownData?.brevoTargetGroups.totalCount;
    const pagination = useRemoteListPagination(listState, total);

    const lastPage = Math.max(1, Math.ceil((data?.brevoTargetGroups.totalCount ?? 0) / listState.pageSize));
    const { page, setPage } = listState;
    useEffect(() => {
        if (data != null && page > lastPage) {
            setPage(lastPage);
        }
    }, [data, page, lastPage, setPage]);

    if (error) {
        throw error;
    }

    const editUrl = (targetGroupId: string) => `${listUrl}/${encodeURIComponent(targetGroupId)}/edit`;

    const exportTargetGroup = async (targetGroup: TargetGroupRow) => {
        setExportingId(targetGroup.id);
        try {
            await exportContacts(targetGroup);
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({ id: "dextinity.targetGroup.exportFailed", defaultMessage: "The contacts couldn't be exported" }),
            });
        } finally {
            setExportingId(undefined);
        }
    };

    const duplicateTargetGroup = async (targetGroup: TargetGroupRow) => {
        try {
            await client.mutate<GQLDuplicateTargetGroupMutation, GQLDuplicateTargetGroupMutationVariables>({
                mutation: duplicateTargetGroupMutation,
                variables: {
                    scope,
                    input: {
                        title: intl.formatMessage(
                            { id: "dextinity.targetGroup.duplicateTitle", defaultMessage: "{title} (copy)" },
                            { title: targetGroup.title },
                        ),
                    },
                },
                context: LocalErrorScopeApolloContext,
                refetchQueries: ["TargetGroupsList"],
                awaitRefetchQueries: true,
            });
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.targetGroup.duplicated", defaultMessage: "{title} duplicated" },
                    { title: targetGroup.title },
                ),
            });
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({
                    id: "dextinity.targetGroup.duplicateFailed",
                    defaultMessage: "The target group couldn't be duplicated",
                }),
            });
        }
    };

    const deleteTargetGroup = async () => {
        if (!targetGroupToDelete) {
            return;
        }
        setDeleting(true);
        try {
            await client.mutate<GQLDeleteTargetGroupMutation, GQLDeleteTargetGroupMutationVariables>({
                mutation: deleteTargetGroupMutation,
                variables: { id: targetGroupToDelete.id },
                context: LocalErrorScopeApolloContext,
                refetchQueries: ["TargetGroupsList"],
                awaitRefetchQueries: true,
            });
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.targetGroup.deleted", defaultMessage: "{title} deleted" },
                    { title: targetGroupToDelete.title },
                ),
            });
            setTargetGroupToDelete(undefined);
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({
                    id: "dextinity.targetGroup.deleteFailed",
                    defaultMessage: "Deleting failed · the target group still exists",
                }),
            });
        } finally {
            setDeleting(false);
        }
    };

    const columns: DataGridColumn<TargetGroupRow>[] = [
        {
            key: "title",
            header: intl.formatMessage({ id: "dextinity.targetGroup.title", defaultMessage: "Title" }),
            sortable: true,
            render: (targetGroup) => (
                <TitleCell>
                    <span>{targetGroup.title}</span>
                    {targetGroup.isMainList ? (
                        <Chip size="small" color="secondary" variant="outlined">
                            {intl.formatMessage({ id: "dextinity.targetGroup.mainList", defaultMessage: "All contacts" })}
                        </Chip>
                    ) : null}
                </TitleCell>
            ),
        },
        {
            key: "totalSubscribers",
            header: intl.formatMessage({ id: "dextinity.targetGroup.totalSubscribers", defaultMessage: "Total subscribers" }),
            width: 180,
            align: "end",
            render: (targetGroup) => intl.formatNumber(targetGroup.totalSubscribers),
        },
    ];

    const newTargetGroupLabel = intl.formatMessage({ id: "dextinity.targetGroup.newTargetGroup", defaultMessage: "New target group" });
    const title = intl.formatMessage({ id: "dextinity.targetGroups.targetGroups", defaultMessage: "Target groups" });

    return (
        <>
            <ListLayout
                header={
                    <PageHeader
                        eyebrow={scopeLabel}
                        title={title}
                        subtitle={
                            total !== undefined
                                ? intl.formatMessage(
                                      {
                                          id: "dextinity.targetGroup.subtitle",
                                          defaultMessage: "{count, plural, one {# target group} other {# target groups}}",
                                      },
                                      { count: total },
                                  )
                                : undefined
                        }
                        actions={
                            <Button startIcon={<Icon name="plus" />} onClick={() => setCreateOpen(true)}>
                                {newTargetGroupLabel}
                            </Button>
                        }
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={listState.searchInput}
                        onSearchChange={listState.setSearchInput}
                        resultCount={total}
                        labels={{
                            search: intl.formatMessage({ id: "dextinity.targetGroup.search", defaultMessage: "Search target groups" }),
                            searchPlaceholder: intl.formatMessage({ id: "dextinity.targetGroup.searchPlaceholder", defaultMessage: "Search title" }),
                            filters: intl.formatMessage({ id: "dextinity.targetGroup.filters", defaultMessage: "Filters" }),
                            resultCount: (count) =>
                                intl.formatMessage(
                                    { id: "dextinity.targetGroup.resultCount", defaultMessage: "{count, plural, one {# result} other {# results}}" },
                                    { count },
                                ),
                        }}
                    />
                }
            >
                <DataGrid
                    aria-label={title}
                    columns={columns}
                    rows={rows}
                    getRowId={(targetGroup) => targetGroup.id}
                    loading={loading && !shownData}
                    loadingRowCount={Math.min(listState.pageSize, 10)}
                    sort={listState.sort}
                    onSortChange={listState.setSort}
                    onRowClick={(targetGroup) => {
                        if (!targetGroup.isMainList) {
                            history.push(editUrl(targetGroup.id));
                        }
                    }}
                    rowActions={(targetGroup) => (
                        <TargetGroupRowMenu
                            targetGroup={targetGroup}
                            exporting={exportingId === targetGroup.id}
                            onEdit={() => history.push(editUrl(targetGroup.id))}
                            onExport={() => void exportTargetGroup(targetGroup)}
                            onDuplicate={() => void duplicateTargetGroup(targetGroup)}
                            onDelete={() => setTargetGroupToDelete(targetGroup)}
                        />
                    )}
                    pagination={pagination}
                    labels={dataGridLabels}
                    emptyState={
                        listState.isFiltered ? (
                            <EmptyState
                                icon={<Icon name="search" />}
                                title={intl.formatMessage({
                                    id: "dextinity.targetGroup.noMatches",
                                    defaultMessage: "No target groups match the search",
                                })}
                                actions={
                                    <Button variant="outlined" color="secondary" size="small" onClick={listState.resetFilters}>
                                        {intl.formatMessage({ id: "dextinity.targetGroup.resetSearch", defaultMessage: "Reset search" })}
                                    </Button>
                                }
                            />
                        ) : (
                            <EmptyState
                                icon={<Icon name="target-group" />}
                                title={intl.formatMessage({ id: "dextinity.targetGroup.empty", defaultMessage: "No target groups yet" })}
                                description={intl.formatMessage({
                                    id: "dextinity.targetGroup.emptyDescription",
                                    defaultMessage: "A target group is the audience of a campaign: contacts by their attributes or picked by hand.",
                                })}
                                actions={
                                    <Button size="small" startIcon={<Icon name="plus" />} onClick={() => setCreateOpen(true)}>
                                        {newTargetGroupLabel}
                                    </Button>
                                }
                            />
                        )
                    }
                />
            </ListLayout>
            <CreateTargetGroupDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                scope={scope}
                onCreated={(targetGroupId) => history.push(editUrl(targetGroupId))}
            />
            <ConfirmDialog
                open={targetGroupToDelete != null}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setTargetGroupToDelete(undefined);
                    }
                }}
                tone="danger"
                title={intl.formatMessage(
                    { id: "dextinity.targetGroup.deleteDialog.title", defaultMessage: "Delete {title}?" },
                    { title: targetGroupToDelete?.title ?? "" },
                )}
                description={intl.formatMessage({
                    id: "dextinity.targetGroup.deleteDialog.description",
                    defaultMessage: "The contacts stay, but campaigns can no longer be sent to this target group. This can't be undone.",
                })}
                confirmLabel={intl.formatMessage({ id: "dextinity.targetGroup.deleteDialog.confirm", defaultMessage: "Delete" })}
                confirmIcon={<Icon name="trash" />}
                onConfirm={() => void deleteTargetGroup()}
                loading={deleting}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.targetGroup.deleteDialog.cancel", defaultMessage: "Cancel" }) }}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.targetGroup.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}

interface TargetGroupRowMenuProps {
    targetGroup: TargetGroupRow;
    exporting: boolean;
    onEdit: () => void;
    onExport: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}

function TargetGroupRowMenu({ targetGroup, exporting, onEdit, onExport, onDuplicate, onDelete }: TargetGroupRowMenuProps) {
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    const mainListReason = intl.formatMessage({
        id: "dextinity.targetGroup.mainListReason",
        defaultMessage: "The list of all contacts is managed by Brevo",
    });
    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <IconButton
                    aria-label={intl.formatMessage(
                        { id: "dextinity.targetGroup.rowActions", defaultMessage: "Actions for {title}" },
                        { title: targetGroup.title },
                    )}
                    size="small"
                    variant="text"
                    color="secondary"
                    loading={exporting}
                >
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.targetGroup.actions.edit", defaultMessage: "Edit" })}
                icon={<Icon name="edit" />}
                onClick={onEdit}
                disabled={targetGroup.isMainList}
                disabledReason={targetGroup.isMainList ? mainListReason : undefined}
            />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.targetGroup.actions.export", defaultMessage: "Export contacts as CSV" })}
                icon={<Icon name="download" />}
                onClick={onExport}
            />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.targetGroup.actions.duplicate", defaultMessage: "Duplicate" })}
                icon={<Icon name="duplicate" />}
                onClick={onDuplicate}
                disabled={targetGroup.isMainList}
                disabledReason={targetGroup.isMainList ? mainListReason : undefined}
            />
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.targetGroup.actions.delete", defaultMessage: "Delete" })}
                icon={<Icon name="trash" />}
                color="error"
                onClick={onDelete}
                disabled={targetGroup.isMainList}
                disabledReason={targetGroup.isMainList ? mainListReason : undefined}
            />
        </Menu>
    );
}
