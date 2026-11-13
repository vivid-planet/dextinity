import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import {
    Button,
    Chip,
    ConfirmDialog,
    DataGrid,
    type DataGridColumn,
    EmptyState,
    FilterBar,
    FilterChip,
    Icon,
    IconButton,
    ListDetailLayout,
    Menu,
    MenuItem,
    MenuRadioGroup,
    MenuRadioItem,
    MenuSeparator,
    PageHeader,
    Switch,
    ToastViewport,
    useToasts,
} from "@dextinity/ui";
import { type JSX, useCallback, useEffect, useState } from "react";
import { FormattedDate, useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";

import type { BlockInterface } from "../blocks/types";
import { useContentScope } from "../contentScope/Provider";
import { getContentScopeLabel } from "../contentScope/utils/getContentScopeLabel";
import { remoteListFilterParam } from "../dataGrid/remoteList/remoteListFilterParams";
import { toGqlSort } from "../dataGrid/remoteList/toGqlSort";
import { useDataGridLabels } from "../dataGrid/remoteList/useDataGridLabels";
import { useRemoteListPagination } from "../dataGrid/remoteList/useRemoteListPagination";
import { useRemoteListState } from "../dataGrid/remoteList/useRemoteListState";
import type { GQLRedirectFilter, GQLRedirectGenerationType, GQLRedirectSortField, GQLRedirectType } from "../graphql.generated";
import { RedirectEditPanel, type RedirectUnsavedChanges } from "./RedirectEditPanel";
import { useRedirectsConfig } from "./redirectsConfig";
import { deleteRedirectMutation, deleteRedirectsMutation, paginatedRedirectsQuery, updateRedirectActivenessMutation } from "./RedirectsListPage.gql";
import type {
    GQLDeleteRedirectMutation,
    GQLDeleteRedirectMutationVariables,
    GQLDeleteRedirectsMutation,
    GQLDeleteRedirectsMutationVariables,
    GQLPaginatedRedirectsQuery,
    GQLPaginatedRedirectsQueryVariables,
    GQLRedirectsListItemFragment,
    GQLUpdateRedirectActivenessMutation,
    GQLUpdateRedirectActivenessMutationVariables,
} from "./RedirectsListPage.gql.generated";
import { ActiveCell, Comment, Muted, Source } from "./RedirectsListPage.sc";
import { RedirectTargetPreview } from "./RedirectTargetPreview";
import { useGenerationTypeLabel } from "./useGenerationTypeLabel";
import { useRedirectTypeLabel } from "./useRedirectTypeLabel";

type RedirectRow = GQLRedirectsListItemFragment;
type StatusFilter = "active" | "inactive";

const filters = {
    status: remoteListFilterParam.oneOf<StatusFilter>(["active", "inactive"]),
    generationType: remoteListFilterParam.oneOf<GQLRedirectGenerationType>(["manual", "automatic"]),
    redirectType: remoteListFilterParam.oneOf<GQLRedirectType>(["temporary", "permanent"]),
};
const sortableColumns: GQLRedirectSortField[] = ["source", "createdAt", "updatedAt"];
const selectedParam = "selected";
const newRedirectId = "new";
const columnsHiddenNextToPanel = ["comment", "generationType", "redirectType", "activatedAt"];

interface RedirectsListPageProps {
    linkBlock: BlockInterface;
    scope: Record<string, unknown>;
}

/**
 * The redirects of the scope in a list with search and filters; a click on a redirect edits it in the side panel. The open redirect
 * is kept in the URL as `?selected=<id>` (`?selected=new` for a new one).
 */
export function RedirectsListPage({ linkBlock, scope }: RedirectsListPageProps): JSX.Element {
    const intl = useIntl();
    const client = useApolloClient();
    const history = useHistory();
    const location = useLocation();
    const contentScope = useContentScope();
    const getGenerationTypeLabel = useGenerationTypeLabel();
    const getRedirectTypeLabel = useRedirectTypeLabel();
    const { enableRedirectType } = useRedirectsConfig();
    const { labels: dataGridLabels, bulkActionLabels } = useDataGridLabels();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const listState = useRemoteListState({ filters, sortableColumns, pageSizeStorageKey: "dextinity-redirects-page-size" });
    const { status, generationType } = listState.filters;
    const redirectType = enableRedirectType ? listState.filters.redirectType : null;
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [redirectsToDelete, setRedirectsToDelete] = useState<string[]>([]);
    const [deleting, setDeleting] = useState(false);
    const [generationTypeMenuOpen, setGenerationTypeMenuOpen] = useState(false);
    const [redirectTypeMenuOpen, setRedirectTypeMenuOpen] = useState(false);
    const [panelUnsavedChanges, setPanelUnsavedChanges] = useState<RedirectUnsavedChanges>();
    const [pendingSelection, setPendingSelection] = useState<{ redirectId: string | null }>();

    const openRedirectId = new URLSearchParams(location.search).get(selectedParam);

    const selectRedirect = useCallback(
        (redirectId: string | null) => {
            const params = new URLSearchParams(location.search);
            if (redirectId) {
                params.set(selectedParam, redirectId);
            } else {
                params.delete(selectedParam);
            }
            const search = params.toString();
            history.replace({ pathname: location.pathname, search: search ? `?${search}` : "", hash: location.hash });
        },
        [history, location.search, location.pathname, location.hash],
    );

    const changeSelection = (redirectId: string | null) => {
        if (redirectId === openRedirectId) {
            return;
        }
        if (panelUnsavedChanges) {
            setPendingSelection({ redirectId });
        } else {
            selectRedirect(redirectId);
        }
    };

    const countFilterConditions: GQLRedirectFilter[] = [
        ...(generationType ? [{ generationType: { equal: generationType } }] : []),
        // The redirect type only applies to path redirects
        ...(redirectType ? [{ sourceType: { equal: "path" as const } }, { redirectType: { equal: redirectType } }] : []),
    ];
    const countFilter: GQLRedirectFilter = countFilterConditions.length > 0 ? { and: countFilterConditions } : {};
    const activeFilter: GQLRedirectFilter = { and: [countFilter, { active: { equal: true } }] };
    const inactiveFilter: GQLRedirectFilter = { and: [countFilter, { active: { equal: false } }] };
    const filter = status === "active" ? activeFilter : status === "inactive" ? inactiveFilter : countFilter;

    const { data, previousData, loading, error } = useQuery<GQLPaginatedRedirectsQuery, GQLPaginatedRedirectsQueryVariables>(
        paginatedRedirectsQuery,
        {
            variables: {
                scope,
                filter,
                countFilter,
                activeFilter,
                inactiveFilter,
                search: listState.search || undefined,
                sort: toGqlSort<GQLRedirectSortField>(listState.sort),
                offset: listState.offset,
                limit: listState.limit,
            },
            context: LocalErrorScopeApolloContext,
            fetchPolicy: "cache-and-network",
        },
    );
    const shownData = data ?? previousData;
    const rows = shownData?.paginatedRedirects.nodes ?? [];
    const total = shownData?.paginatedRedirects.totalCount;
    const pagination = useRemoteListPagination(listState, total);

    const lastPage = Math.max(1, Math.ceil((data?.paginatedRedirects.totalCount ?? 0) / listState.pageSize));
    const { page, setPage } = listState;
    useEffect(() => {
        if (data != null && page > lastPage) {
            setPage(lastPage);
        }
    }, [data, page, lastPage, setPage]);

    if (error) {
        throw error;
    }

    const changeActiveness = async (redirectIds: string[], active: boolean) => {
        try {
            for (const id of redirectIds) {
                await client.mutate<GQLUpdateRedirectActivenessMutation, GQLUpdateRedirectActivenessMutationVariables>({
                    mutation: updateRedirectActivenessMutation,
                    variables: { id, input: { active } },
                    optimisticResponse: {
                        updateRedirectActiveness: {
                            __typename: "Redirect",
                            id,
                            active,
                            activatedAt: active ? new Date().toISOString() : null,
                            updatedAt: new Date().toISOString(),
                        },
                    },
                    context: LocalErrorScopeApolloContext,
                });
            }
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({ id: "dextinity.redirects.activenessFailed", defaultMessage: "The activation couldn't be changed" }),
            });
        } finally {
            await client.refetchQueries({ include: ["PaginatedRedirects"] });
        }
    };

    const deleteRedirects = async () => {
        setDeleting(true);
        try {
            if (redirectsToDelete.length === 1) {
                await client.mutate<GQLDeleteRedirectMutation, GQLDeleteRedirectMutationVariables>({
                    mutation: deleteRedirectMutation,
                    variables: { id: redirectsToDelete[0] },
                    context: LocalErrorScopeApolloContext,
                });
            } else {
                await client.mutate<GQLDeleteRedirectsMutation, GQLDeleteRedirectsMutationVariables>({
                    mutation: deleteRedirectsMutation,
                    variables: { ids: redirectsToDelete },
                    context: LocalErrorScopeApolloContext,
                });
            }
            await client.refetchQueries({ include: ["PaginatedRedirects"] });
            setSelectedIds((ids) => ids.filter((id) => !redirectsToDelete.includes(id)));
            if (openRedirectId && redirectsToDelete.includes(openRedirectId)) {
                panelUnsavedChanges?.discard();
                selectRedirect(null);
            }
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.redirects.deleted", defaultMessage: "{count, plural, one {Redirect} other {# redirects}} deleted" },
                    { count: redirectsToDelete.length },
                ),
            });
            setRedirectsToDelete([]);
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({
                    id: "dextinity.redirects.deleteFailed",
                    defaultMessage: "Deleting failed · the redirects still exist",
                }),
            });
        } finally {
            setDeleting(false);
        }
    };

    const columns: DataGridColumn<RedirectRow>[] = [
        {
            key: "source",
            header: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.source", defaultMessage: "Source" }),
            sortable: true,
            render: (redirect) => (
                <Source>
                    {redirect.sourceType === "domain" ? <Icon name="globe" size="small" /> : null}
                    <span>{redirect.source}</span>
                </Source>
            ),
        },
        {
            key: "target",
            header: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.target", defaultMessage: "Target" }),
            render: (redirect) => <RedirectTargetPreview linkBlock={linkBlock} target={redirect.target} />,
        },
        {
            key: "comment",
            header: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.comment", defaultMessage: "Comment" }),
            priority: "low",
            render: (redirect) => <Comment>{redirect.comment}</Comment>,
        },
        {
            key: "generationType",
            header: intl.formatMessage({ id: "dextinity.redirects.generationType", defaultMessage: "Origin" }),
            width: 120,
            priority: "low",
            render: (redirect) => (
                <Chip
                    size="small"
                    color={redirect.generationType === "automatic" ? "info" : "secondary"}
                    variant={redirect.generationType === "automatic" ? "contained" : "outlined"}
                >
                    {getGenerationTypeLabel(redirect.generationType)}
                </Chip>
            ),
        },
        ...(enableRedirectType
            ? [
                  {
                      key: "redirectType",
                      header: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.redirectType", defaultMessage: "Redirect type" }),
                      width: 130,
                      priority: "low",
                      render: (redirect) => (redirect.sourceType === "path" ? <Muted>{getRedirectTypeLabel(redirect.redirectType)}</Muted> : null),
                  } satisfies DataGridColumn<RedirectRow>,
              ]
            : []),
        {
            key: "active",
            header: intl.formatMessage({ id: "dextinity.redirects.active", defaultMessage: "Active" }),
            width: 90,
            render: (redirect) => (
                <ActiveCell onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                    <Switch
                        size="small"
                        checked={redirect.active}
                        onChange={(active) => void changeActiveness([redirect.id], active)}
                        aria-label={intl.formatMessage(
                            { id: "dextinity.redirects.activeSwitch", defaultMessage: "Active: {source}" },
                            { source: redirect.source },
                        )}
                    />
                </ActiveCell>
            ),
        },
        {
            key: "activatedAt",
            header: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.activatedAt", defaultMessage: "Activation Date" }),
            width: 150,
            priority: "low",
            render: (redirect) =>
                redirect.activatedAt ? (
                    <Muted>
                        <FormattedDate value={redirect.activatedAt} dateStyle="medium" />
                    </Muted>
                ) : (
                    <Muted>–</Muted>
                ),
        },
    ];

    const isPanelOpen = openRedirectId != null;
    const visibleColumns = isPanelOpen ? columns.filter((column) => !columnsHiddenNextToPanel.includes(column.key)) : columns;
    const openRedirect = rows.find((redirect) => redirect.id === openRedirectId);
    const scopeLabel = getContentScopeLabel({ scope: scope as Record<string, string>, values: contentScope.values });
    const isGlobalScope = Object.keys(scope).length === 0;

    const statusFilters: { value: StatusFilter | null; label: string; count: number | undefined }[] = [
        {
            value: null,
            label: intl.formatMessage({ id: "dextinity.redirects.filter.all", defaultMessage: "All" }),
            count: shownData?.allRedirects.totalCount,
        },
        {
            value: "active",
            label: intl.formatMessage({ id: "dextinity.redirects.filter.active", defaultMessage: "Active" }),
            count: shownData?.activeRedirects.totalCount,
        },
        {
            value: "inactive",
            label: intl.formatMessage({ id: "dextinity.redirects.filter.inactive", defaultMessage: "Inactive" }),
            count: shownData?.inactiveRedirects.totalCount,
        },
    ];

    const generationTypeFilterLabel = intl.formatMessage({ id: "dextinity.redirects.generationType", defaultMessage: "Origin" });
    const redirectTypeFilterLabel = intl.formatMessage({ id: "dextinity.pages.redirects.redirect.redirectType", defaultMessage: "Redirect type" });

    return (
        <>
            <ListDetailLayout
                open={isPanelOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        // The unsaved changes dialog would otherwise receive the Escape that closes the panel and close right away
                        window.setTimeout(() => changeSelection(null));
                    }
                }}
                sidePanelLabel={
                    openRedirectId === newRedirectId
                        ? intl.formatMessage({ id: "dextinity.redirects.panel.newTitle", defaultMessage: "New redirect" })
                        : openRedirect
                          ? intl.formatMessage(
                                { id: "dextinity.redirects.panel.labelWithSource", defaultMessage: "Edit redirect {source}" },
                                { source: openRedirect.source },
                            )
                          : intl.formatMessage({ id: "dextinity.redirects.panel.editTitle", defaultMessage: "Edit redirect" })
                }
                header={
                    <PageHeader
                        eyebrow={
                            isGlobalScope ? intl.formatMessage({ id: "dextinity.redirects.globalScope", defaultMessage: "All scopes" }) : scopeLabel
                        }
                        title={intl.formatMessage({ id: "dextinity.pages.redirects", defaultMessage: "Redirects" })}
                        subtitle={
                            shownData
                                ? intl.formatMessage(
                                      {
                                          id: "dextinity.redirects.subtitle",
                                          defaultMessage: "{count, plural, one {# redirect} other {# redirects}} in total",
                                      },
                                      { count: shownData.totalRedirects.totalCount },
                                  )
                                : undefined
                        }
                        actions={
                            <Button startIcon={<Icon name="plus" />} onClick={() => changeSelection(newRedirectId)}>
                                {intl.formatMessage({ id: "dextinity.pages.redirects.add", defaultMessage: "New redirect" })}
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
                            search: intl.formatMessage({ id: "dextinity.redirects.filter.search", defaultMessage: "Search redirects" }),
                            searchPlaceholder: intl.formatMessage({
                                id: "dextinity.redirects.filter.searchPlaceholder",
                                defaultMessage: "Search source or target",
                            }),
                            filters: intl.formatMessage({ id: "dextinity.redirects.filter.filters", defaultMessage: "Filters" }),
                            resultCount: (count) =>
                                intl.formatMessage(
                                    {
                                        id: "dextinity.redirects.filter.resultCount",
                                        defaultMessage: "{count, plural, one {# result} other {# results}}",
                                    },
                                    { count },
                                ),
                        }}
                    >
                        {statusFilters.map((statusFilter) => (
                            <FilterChip
                                key={statusFilter.value ?? "all"}
                                selected={status === statusFilter.value}
                                onClick={() => listState.setFilter("status", statusFilter.value)}
                                count={statusFilter.count}
                                status={statusFilter.value === null ? undefined : statusFilter.value === "active" ? "published" : "unpublished"}
                            >
                                {statusFilter.label}
                            </FilterChip>
                        ))}
                        <Menu
                            open={generationTypeMenuOpen}
                            onOpenChange={setGenerationTypeMenuOpen}
                            trigger={
                                <FilterChip selected={generationType !== null} hasMenu onClick={() => undefined}>
                                    {generationTypeFilterLabel}
                                </FilterChip>
                            }
                        >
                            <MenuRadioGroup
                                value={generationType ?? ""}
                                onChange={(nextGenerationType) => {
                                    listState.setFilter(
                                        "generationType",
                                        nextGenerationType === "" ? null : (nextGenerationType as GQLRedirectGenerationType),
                                    );
                                    setGenerationTypeMenuOpen(false);
                                }}
                            >
                                <MenuRadioItem
                                    value=""
                                    label={intl.formatMessage({ id: "dextinity.redirects.filter.allOrigins", defaultMessage: "All origins" })}
                                />
                                <MenuRadioItem value="manual" label={getGenerationTypeLabel("manual")} />
                                <MenuRadioItem value="automatic" label={getGenerationTypeLabel("automatic")} />
                            </MenuRadioGroup>
                        </Menu>
                        {generationType !== null ? (
                            <Chip
                                color="secondary"
                                onClear={() => listState.setFilter("generationType", null)}
                                clearLabel={intl.formatMessage(
                                    { id: "dextinity.redirects.filter.removeGenerationType", defaultMessage: "Remove filter Origin: {origin}" },
                                    { origin: getGenerationTypeLabel(generationType) },
                                )}
                            >
                                {intl.formatMessage(
                                    { id: "dextinity.redirects.filter.generationTypeChip", defaultMessage: "Origin: {origin}" },
                                    { origin: getGenerationTypeLabel(generationType) },
                                )}
                            </Chip>
                        ) : null}
                        {enableRedirectType ? (
                            <Menu
                                open={redirectTypeMenuOpen}
                                onOpenChange={setRedirectTypeMenuOpen}
                                trigger={
                                    <FilterChip selected={redirectType !== null} hasMenu onClick={() => undefined}>
                                        {redirectTypeFilterLabel}
                                    </FilterChip>
                                }
                            >
                                <MenuRadioGroup
                                    value={redirectType ?? ""}
                                    onChange={(nextRedirectType) => {
                                        listState.setFilter("redirectType", nextRedirectType === "" ? null : (nextRedirectType as GQLRedirectType));
                                        setRedirectTypeMenuOpen(false);
                                    }}
                                >
                                    <MenuRadioItem
                                        value=""
                                        label={intl.formatMessage({
                                            id: "dextinity.redirects.filter.allRedirectTypes",
                                            defaultMessage: "All redirect types",
                                        })}
                                    />
                                    <MenuRadioItem value="temporary" label={getRedirectTypeLabel("temporary")} />
                                    <MenuRadioItem value="permanent" label={getRedirectTypeLabel("permanent")} />
                                </MenuRadioGroup>
                            </Menu>
                        ) : null}
                        {redirectType !== null ? (
                            <Chip
                                color="secondary"
                                onClear={() => listState.setFilter("redirectType", null)}
                                clearLabel={intl.formatMessage(
                                    {
                                        id: "dextinity.redirects.filter.removeRedirectType",
                                        defaultMessage: "Remove filter Redirect type: {redirectType}",
                                    },
                                    { redirectType: getRedirectTypeLabel(redirectType) },
                                )}
                            >
                                {intl.formatMessage(
                                    { id: "dextinity.redirects.filter.redirectTypeChip", defaultMessage: "Redirect type: {redirectType}" },
                                    { redirectType: getRedirectTypeLabel(redirectType) },
                                )}
                            </Chip>
                        ) : null}
                    </FilterBar>
                }
                sidePanel={
                    openRedirectId != null ? (
                        <RedirectEditPanel
                            key={openRedirectId}
                            redirectId={openRedirectId === newRedirectId ? undefined : openRedirectId}
                            linkBlock={linkBlock}
                            scope={scope}
                            onClose={() => changeSelection(null)}
                            onCreated={selectRedirect}
                            onUnsavedChangesChange={setPanelUnsavedChanges}
                        />
                    ) : null
                }
            >
                <DataGrid
                    aria-label={intl.formatMessage({ id: "dextinity.pages.redirects", defaultMessage: "Redirects" })}
                    columns={visibleColumns}
                    rows={rows}
                    getRowId={(redirect) => redirect.id}
                    loading={loading && !shownData}
                    loadingRowCount={Math.min(listState.pageSize, 10)}
                    sort={listState.sort}
                    onSortChange={listState.setSort}
                    onRowClick={(redirect) => changeSelection(redirect.id)}
                    activeRowId={openRedirectId ?? undefined}
                    selectable
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    bulkActions={[
                        {
                            label: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.activate", defaultMessage: "Activate" }),
                            icon: <Icon name="eye" />,
                            onClick: () => void changeActiveness(selectedIds, true),
                        },
                        {
                            label: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.deactivate", defaultMessage: "Deactivate" }),
                            icon: <Icon name="eye-off" />,
                            onClick: () => void changeActiveness(selectedIds, false),
                        },
                        {
                            label: intl.formatMessage({ id: "dextinity.pages.redirects.deleteSelected", defaultMessage: "Delete" }),
                            icon: <Icon name="trash" />,
                            onClick: () => setRedirectsToDelete(selectedIds),
                        },
                    ]}
                    bulkActionLabels={bulkActionLabels}
                    rowActions={(redirect) => (
                        <RedirectRowMenu
                            redirect={redirect}
                            onEdit={() => changeSelection(redirect.id)}
                            onChangeActiveness={(active) => void changeActiveness([redirect.id], active)}
                            onDelete={() => setRedirectsToDelete([redirect.id])}
                        />
                    )}
                    pagination={pagination}
                    labels={dataGridLabels}
                    emptyState={
                        listState.isFiltered ? (
                            <EmptyState
                                icon={<Icon name="search" />}
                                title={intl.formatMessage({ id: "dextinity.redirects.noMatches", defaultMessage: "No redirects match the filters" })}
                                description={intl.formatMessage({
                                    id: "dextinity.redirects.noMatchesDescription",
                                    defaultMessage: "Check the spelling or reset the filters.",
                                })}
                                actions={
                                    <Button variant="outlined" color="secondary" size="small" onClick={listState.resetFilters}>
                                        {intl.formatMessage({ id: "dextinity.redirects.resetFilters", defaultMessage: "Reset filters" })}
                                    </Button>
                                }
                            />
                        ) : (
                            <EmptyState
                                icon={<Icon name="file" />}
                                title={intl.formatMessage({ id: "dextinity.redirects.empty", defaultMessage: "No redirects yet" })}
                                description={intl.formatMessage({
                                    id: "dextinity.redirects.emptyDescription",
                                    defaultMessage: "Redirects forward visitors from an old address to a page or another website.",
                                })}
                                actions={
                                    <Button size="small" startIcon={<Icon name="plus" />} onClick={() => changeSelection(newRedirectId)}>
                                        {intl.formatMessage({ id: "dextinity.pages.redirects.add", defaultMessage: "New redirect" })}
                                    </Button>
                                }
                            />
                        )
                    }
                />
            </ListDetailLayout>
            <ConfirmDialog
                open={redirectsToDelete.length > 0}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setRedirectsToDelete([]);
                    }
                }}
                tone="danger"
                title={intl.formatMessage(
                    {
                        id: "dextinity.redirects.deleteDialog.title",
                        defaultMessage: "Delete {count, plural, one {the redirect} other {# redirects}}?",
                    },
                    { count: redirectsToDelete.length },
                )}
                description={intl.formatMessage({
                    id: "dextinity.redirects.deleteDialog.description",
                    defaultMessage: "This can't be undone. To stop forwarding and keep a redirect, deactivate it instead.",
                })}
                confirmLabel={intl.formatMessage({ id: "dextinity.redirects.deleteDialog.confirm", defaultMessage: "Delete" })}
                confirmIcon={<Icon name="trash" />}
                onConfirm={() => void deleteRedirects()}
                loading={deleting}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.redirects.deleteDialog.cancel", defaultMessage: "Cancel" }) }}
            />
            <ConfirmDialog
                open={pendingSelection != null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingSelection(undefined);
                    }
                }}
                title={intl.formatMessage({ id: "dextinity.redirects.unsavedChanges.title", defaultMessage: "Unsaved changes" })}
                description={intl.formatMessage({
                    id: "dextinity.redirects.unsavedChanges.description",
                    defaultMessage: "Save the changes to this redirect before you continue?",
                })}
                secondaryLabel={intl.formatMessage({ id: "dextinity.redirects.unsavedChanges.discard", defaultMessage: "Discard" })}
                onSecondary={() => {
                    panelUnsavedChanges?.discard();
                    if (pendingSelection) {
                        selectRedirect(pendingSelection.redirectId);
                    }
                    setPendingSelection(undefined);
                }}
                confirmLabel={intl.formatMessage({ id: "dextinity.redirects.unsavedChanges.save", defaultMessage: "Save and continue" })}
                onConfirm={async () => {
                    const nextSelection = pendingSelection;
                    setPendingSelection(undefined);
                    const isSaved = (await panelUnsavedChanges?.save()) ?? true;
                    if (isSaved && nextSelection) {
                        selectRedirect(nextSelection.redirectId);
                    }
                }}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.redirects.unsavedChanges.cancel", defaultMessage: "Cancel" }) }}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.redirects.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}

interface RedirectRowMenuProps {
    redirect: RedirectRow;
    onEdit: () => void;
    onChangeActiveness: (active: boolean) => void;
    onDelete: () => void;
}

function RedirectRowMenu({ redirect, onEdit, onChangeActiveness, onDelete }: RedirectRowMenuProps) {
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <IconButton
                    aria-label={intl.formatMessage(
                        { id: "dextinity.redirects.rowActions", defaultMessage: "Actions for {source}" },
                        { source: redirect.source },
                    )}
                    size="small"
                    variant="text"
                    color="secondary"
                >
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.redirects.edit", defaultMessage: "Edit" })}
                icon={<Icon name="edit" />}
                onClick={onEdit}
            />
            {redirect.active ? (
                <MenuItem
                    label={intl.formatMessage({ id: "dextinity.pages.redirects.redirect.deactivate", defaultMessage: "Deactivate" })}
                    icon={<Icon name="eye-off" />}
                    onClick={() => onChangeActiveness(false)}
                />
            ) : (
                <MenuItem
                    label={intl.formatMessage({ id: "dextinity.pages.redirects.redirect.activate", defaultMessage: "Activate" })}
                    icon={<Icon name="eye" />}
                    onClick={() => onChangeActiveness(true)}
                />
            )}
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.pages.redirects.deleteSelected", defaultMessage: "Delete" })}
                icon={<Icon name="trash" />}
                color="error"
                onClick={onDelete}
            />
        </Menu>
    );
}
