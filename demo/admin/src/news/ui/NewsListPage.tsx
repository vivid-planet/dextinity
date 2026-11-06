import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import {
    remoteListFilterParam,
    toGqlSort,
    useContentScope,
    useRemoteListCsvExport,
    useRemoteListPagination,
    useRemoteListState,
} from "@dextinity/cms-admin";
import {
    Button,
    Chip,
    ConfirmDialog,
    DataGrid,
    type DataGridColumn,
    type DataGridSort,
    EmptyState,
    FilterBar,
    FilterChip,
    Icon,
    IconButton,
    ListLayout,
    Menu,
    MenuItem,
    MenuRadioGroup,
    MenuRadioItem,
    MenuSeparator,
    PageHeader,
    StatusIndicator,
    ToastViewport,
    useToasts,
    useUndoToast,
} from "@dextinity/ui";
import type { GQLNewsCategory, GQLNewsFilter, GQLNewsSortField, GQLNewsStatus } from "@src/graphql.generated";
import { useEffect, useState } from "react";
import { FormattedDate, useIntl } from "react-intl";
import { useHistory } from "react-router-dom";

import { getNewsCategoryLabel, getNewsStatusIndicator, getNewsStatusLabel, newsCategories } from "./newsLabels";
import { deleteNewsMutation, newsListQuery, updateNewsStatusMutation } from "./NewsListPage.gql";
import type {
    GQLNewsUiDeleteMutation,
    GQLNewsUiDeleteMutationVariables,
    GQLNewsUiListQuery,
    GQLNewsUiListQueryVariables,
    GQLNewsUiUpdateStatusMutation,
    GQLNewsUiUpdateStatusMutationVariables,
} from "./NewsListPage.gql.generated";
import styles from "./NewsListPage.module.css";
import { useRouterLinkClick } from "./useRouterLinkClick";

type NewsRow = GQLNewsUiListQuery["newsList"]["nodes"][number];

type NewsStatusFilter = GQLNewsStatus | "all";

const newsListFilters = {
    status: remoteListFilterParam.oneOf<GQLNewsStatus>(["active", "deleted"]),
    category: remoteListFilterParam.oneOf<GQLNewsCategory>(newsCategories),
};

const sortableNewsColumns: GQLNewsSortField[] = ["title", "date", "category", "status", "updatedAt"];

const defaultNewsSort: DataGridSort = { key: "date", direction: "desc" };

interface NewsListPageProps {
    baseUrl: string;
}

export function NewsListPage({ baseUrl }: NewsListPageProps) {
    const intl = useIntl();
    const history = useHistory();
    const navigateWithRouter = useRouterLinkClick();
    const client = useApolloClient();
    const { scope } = useContentScope();
    const listState = useRemoteListState({
        filters: newsListFilters,
        sortableColumns: sortableNewsColumns,
        defaultSort: defaultNewsSort,
        pageSizeStorageKey: "demo-admin-news-ui-page-size",
    });
    const {
        search,
        filters: { status: statusFilter, category },
        sort,
        page,
        pageSize,
    } = listState;
    const status: NewsStatusFilter = statusFilter ?? "all";
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState<NewsRow[]>([]);
    const [deleting, setDeleting] = useState(false);
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const { perform } = useUndoToast({
        addToast,
        labels: { undo: intl.formatMessage({ id: "uiDemo.news.list.undo", defaultMessage: "Undo" }) },
    });

    useEffect(() => {
        setSelectedIds([]);
    }, [search, status, category, sort, page, pageSize]);

    const countFilter: GQLNewsFilter = category ? { category: { equal: category } } : {};
    const filter: GQLNewsFilter = status === "all" ? countFilter : { and: [countFilter, { status: { equal: status } }] };

    const variables: GQLNewsUiListQueryVariables = {
        scope,
        offset: listState.offset,
        limit: listState.limit,
        sort: toGqlSort<GQLNewsSortField>(sort),
        search: search || undefined,
        filter,
        countFilter,
    };
    const { data, previousData, loading, error, refetch } = useQuery<GQLNewsUiListQuery, GQLNewsUiListQueryVariables>(newsListQuery, {
        fetchPolicy: "cache-and-network",
        variables,
    });

    if (error) {
        throw error;
    }

    const shownData = data ?? previousData;
    const rows = shownData?.newsList.nodes ?? [];
    const total = shownData?.newsList.totalCount ?? 0;
    const isFiltered = listState.isFiltered;
    const pagination = useRemoteListPagination(listState, total);

    const newsUrl = (id: string) => `${baseUrl}/${id}/edit`;

    const updateStatuses = async (news: Array<Pick<NewsRow, "id" | "status">>) => {
        const results = await Promise.allSettled(
            news.map((entry) =>
                client.mutate<GQLNewsUiUpdateStatusMutation, GQLNewsUiUpdateStatusMutationVariables>({
                    mutation: updateNewsStatusMutation,
                    variables: { id: entry.id, status: entry.status },
                    context: LocalErrorScopeApolloContext,
                }),
            ),
        );
        const failedCount = results.filter((result) => result.status === "rejected").length;
        if (failedCount > 0) {
            addToast({
                tone: "error",
                message: intl.formatMessage(
                    {
                        id: "uiDemo.news.list.statusFailed",
                        defaultMessage: "Changing the status failed for {failedCount, plural, one {# news} other {# news}}",
                    },
                    { failedCount },
                ),
            });
        }
        await refetch();
    };

    const changeStatus = (news: NewsRow[], nextStatus: GQLNewsStatus) => {
        const affected = news.filter((entry) => entry.status !== nextStatus);
        if (affected.length === 0) {
            return;
        }
        const previous = affected.map((entry) => ({ id: entry.id, status: entry.status }));
        const name = affected.length === 1 ? affected[0].title : undefined;
        perform({
            run: () => {
                setSelectedIds([]);
                void updateStatuses(affected.map((entry) => ({ id: entry.id, status: nextStatus })));
            },
            undo: () => {
                void updateStatuses(previous);
            },
            icon: <Icon name={nextStatus === "deleted" ? "archive" : "reload"} />,
            message:
                nextStatus === "deleted"
                    ? intl.formatMessage(
                          {
                              id: "uiDemo.news.list.markedDeleted",
                              defaultMessage:
                                  "{count, plural, one {{name, select, undefined {# news} other {“{name}”}}} other {# news}} marked as deleted",
                          },
                          { count: affected.length, name: name ?? "undefined" },
                      )
                    : intl.formatMessage(
                          {
                              id: "uiDemo.news.list.restored",
                              defaultMessage: "{count, plural, one {{name, select, undefined {# news} other {“{name}”}}} other {# news}} restored",
                          },
                          { count: affected.length, name: name ?? "undefined" },
                      ),
            undoneMessage: intl.formatMessage({ id: "uiDemo.news.list.statusUndone", defaultMessage: "Status change undone" }),
        });
    };

    const deletePermanently = async () => {
        setDeleting(true);
        const results = await Promise.allSettled(
            newsToDelete.map((entry) =>
                client.mutate<GQLNewsUiDeleteMutation, GQLNewsUiDeleteMutationVariables>({
                    mutation: deleteNewsMutation,
                    variables: { id: entry.id },
                    context: LocalErrorScopeApolloContext,
                }),
            ),
        );
        const deletedIds = newsToDelete.filter((_entry, index) => results[index].status === "fulfilled").map((entry) => entry.id);
        const failedCount = newsToDelete.length - deletedIds.length;
        if (failedCount === 0) {
            addToast({
                icon: <Icon name="delete" />,
                message: intl.formatMessage(
                    { id: "uiDemo.news.list.deleted", defaultMessage: "{count, plural, one {# news} other {# news}} deleted permanently" },
                    { count: deletedIds.length },
                ),
            });
        } else {
            addToast({
                tone: "error",
                message: intl.formatMessage(
                    {
                        id: "uiDemo.news.list.deleteFailed",
                        defaultMessage: "{failedCount} of {count} news could not be deleted",
                    },
                    { failedCount, count: newsToDelete.length },
                ),
            });
        }
        setSelectedIds((ids) => ids.filter((id) => !deletedIds.includes(id)));
        setNewsToDelete([]);
        setDeleting(false);
        await refetch();
    };

    const selectedRows = rows.filter((row) => selectedIds.includes(row.id));

    const columns: DataGridColumn<NewsRow>[] = [
        {
            key: "title",
            header: intl.formatMessage({ id: "uiDemo.news.title", defaultMessage: "Title" }),
            sortable: true,
            render: (news) => (
                <span className={styles.titleCell}>
                    <span className={styles.title}>{news.title}</span>
                    <span className={styles.muted}>{`/${news.slug}`}</span>
                </span>
            ),
        },
        {
            key: "category",
            header: intl.formatMessage({ id: "uiDemo.news.category", defaultMessage: "Category" }),
            sortable: true,
            width: 140,
            priority: "low",
            render: (news) => <span className={styles.muted}>{getNewsCategoryLabel(intl, news.category)}</span>,
            exportValue: (news) => getNewsCategoryLabel(intl, news.category),
        },
        {
            key: "date",
            header: intl.formatMessage({ id: "uiDemo.news.date", defaultMessage: "Date" }),
            sortable: true,
            width: 140,
            render: (news) => <FormattedDate value={news.date} dateStyle="medium" />,
        },
        {
            key: "updatedAt",
            header: intl.formatMessage({ id: "uiDemo.news.updatedAt", defaultMessage: "Updated" }),
            sortable: true,
            width: 170,
            priority: "low",
            render: (news) => (
                <span className={styles.muted}>
                    <FormattedDate value={news.updatedAt} dateStyle="medium" timeStyle="short" />
                </span>
            ),
        },
        {
            key: "status",
            header: intl.formatMessage({ id: "uiDemo.news.status", defaultMessage: "Status" }),
            sortable: true,
            width: 130,
            render: (news) => <StatusIndicator status={getNewsStatusIndicator(news.status)}>{getNewsStatusLabel(intl, news.status)}</StatusIndicator>,
            exportValue: (news) => getNewsStatusLabel(intl, news.status),
        },
    ];

    const statusFilters: { value: NewsStatusFilter; label: string; count: number | undefined }[] = [
        {
            value: "all",
            label: intl.formatMessage({ id: "uiDemo.news.list.filter.all", defaultMessage: "All" }),
            count: shownData?.allNews.totalCount,
        },
        { value: "active", label: getNewsStatusLabel(intl, "active"), count: shownData?.activeNews.totalCount },
        { value: "deleted", label: getNewsStatusLabel(intl, "deleted"), count: shownData?.deletedNews.totalCount },
    ];

    const { exportCsv, exporting } = useRemoteListCsvExport<NewsRow>({
        fetchPage: async ({ offset, limit }) => {
            const { data: exportData } = await client.query<GQLNewsUiListQuery, GQLNewsUiListQueryVariables>({
                query: newsListQuery,
                variables: { ...variables, offset, limit },
                fetchPolicy: "network-only",
            });
            return exportData.newsList;
        },
        columns,
        fileName: "news.csv",
    });

    const newNewsButton = (
        <Button startIcon={<Icon name="plus" />} href={`${baseUrl}/add`} onClick={navigateWithRouter}>
            {intl.formatMessage({ id: "uiDemo.news.list.new", defaultMessage: "New news" })}
        </Button>
    );

    return (
        <>
            <ListLayout
                header={
                    <PageHeader
                        eyebrow={intl.formatMessage({ id: "uiDemo.news.list.eyebrow", defaultMessage: "Structured content" })}
                        title={intl.formatMessage({ id: "uiDemo.news.list.title", defaultMessage: "News" })}
                        subtitle={
                            shownData
                                ? intl.formatMessage(
                                      { id: "uiDemo.news.list.subtitle", defaultMessage: "{count, plural, one {# news} other {# news}} in total" },
                                      { count: shownData.totalNews.totalCount },
                                  )
                                : undefined
                        }
                        actions={newNewsButton}
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={listState.searchInput}
                        onSearchChange={listState.setSearchInput}
                        resultCount={shownData ? total : undefined}
                        actions={
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                startIcon={<Icon name="csv" />}
                                loading={exporting}
                                disabled={total === 0}
                                onClick={() => void exportCsv()}
                            >
                                {intl.formatMessage({ id: "uiDemo.news.list.exportCsv", defaultMessage: "Export CSV" })}
                            </Button>
                        }
                        labels={{
                            search: intl.formatMessage({ id: "uiDemo.news.list.search", defaultMessage: "Search news" }),
                            searchPlaceholder: intl.formatMessage({
                                id: "uiDemo.news.list.searchPlaceholder",
                                defaultMessage: "Search title or slug",
                            }),
                            filters: intl.formatMessage({ id: "uiDemo.news.list.filters", defaultMessage: "Filters" }),
                            resultCount: (count) =>
                                intl.formatMessage(
                                    { id: "uiDemo.news.list.resultCount", defaultMessage: "{count, plural, one {# result} other {# results}}" },
                                    { count },
                                ),
                        }}
                    >
                        {statusFilters.map((filterOption) => (
                            <FilterChip
                                key={filterOption.value}
                                selected={status === filterOption.value}
                                onClick={() => listState.setFilter("status", filterOption.value === "all" ? null : filterOption.value)}
                                count={filterOption.count}
                                status={filterOption.value === "all" ? undefined : getNewsStatusIndicator(filterOption.value)}
                            >
                                {filterOption.label}
                            </FilterChip>
                        ))}
                        <Menu
                            open={categoryMenuOpen}
                            onOpenChange={setCategoryMenuOpen}
                            trigger={
                                <FilterChip selected={category !== null} hasMenu onClick={() => undefined}>
                                    {intl.formatMessage({ id: "uiDemo.news.category", defaultMessage: "Category" })}
                                </FilterChip>
                            }
                        >
                            <MenuRadioGroup
                                value={category ?? ""}
                                onChange={(nextCategory) => {
                                    listState.setFilter("category", nextCategory === "" ? null : (nextCategory as GQLNewsCategory));
                                    setCategoryMenuOpen(false);
                                }}
                            >
                                <MenuRadioItem
                                    value=""
                                    label={intl.formatMessage({ id: "uiDemo.news.list.filter.allCategories", defaultMessage: "All categories" })}
                                />
                                {newsCategories.map((option) => (
                                    <MenuRadioItem key={option} value={option} label={getNewsCategoryLabel(intl, option)} />
                                ))}
                            </MenuRadioGroup>
                        </Menu>
                        {category !== null && (
                            <Chip
                                color="secondary"
                                onClear={() => listState.setFilter("category", null)}
                                clearLabel={intl.formatMessage(
                                    { id: "uiDemo.news.list.filter.removeCategory", defaultMessage: "Remove filter Category: {category}" },
                                    { category: getNewsCategoryLabel(intl, category) },
                                )}
                            >
                                {intl.formatMessage(
                                    { id: "uiDemo.news.list.filter.categoryChip", defaultMessage: "Category: {category}" },
                                    { category: getNewsCategoryLabel(intl, category) },
                                )}
                            </Chip>
                        )}
                    </FilterBar>
                }
            >
                <DataGrid
                    aria-label={intl.formatMessage({ id: "uiDemo.news.list.title", defaultMessage: "News" })}
                    columns={columns}
                    rows={rows}
                    getRowId={(news) => news.id}
                    loading={loading && !shownData}
                    selectable
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    sort={sort}
                    onSortChange={listState.setSort}
                    onRowClick={(news) => history.push(newsUrl(news.id))}
                    rowActions={(news) => (
                        <NewsRowMenu
                            news={news}
                            onEdit={() => history.push(newsUrl(news.id))}
                            onChangeStatus={(nextStatus) => changeStatus([news], nextStatus)}
                            onDelete={() => setNewsToDelete([news])}
                        />
                    )}
                    bulkActions={[
                        {
                            label: intl.formatMessage({ id: "uiDemo.news.list.bulk.restore", defaultMessage: "Restore" }),
                            icon: <Icon name="reload" />,
                            disabled: selectedRows.every((news) => news.status === "active"),
                            onClick: () => changeStatus(selectedRows, "active"),
                        },
                        {
                            label: intl.formatMessage({ id: "uiDemo.news.list.bulk.markDeleted", defaultMessage: "Mark as deleted" }),
                            icon: <Icon name="archive" />,
                            disabled: selectedRows.every((news) => news.status === "deleted"),
                            onClick: () => changeStatus(selectedRows, "deleted"),
                        },
                        {
                            label: intl.formatMessage({ id: "uiDemo.news.list.bulk.delete", defaultMessage: "Delete permanently" }),
                            icon: <Icon name="delete" />,
                            color: "error",
                            onClick: () => setNewsToDelete(selectedRows),
                        },
                    ]}
                    bulkActionLabels={{
                        count: (count) => intl.formatMessage({ id: "uiDemo.news.list.bulk.count", defaultMessage: "{count} selected" }, { count }),
                        clear: intl.formatMessage({ id: "uiDemo.news.list.bulk.clear", defaultMessage: "Clear selection" }),
                        toolbar: intl.formatMessage({ id: "uiDemo.news.list.bulk.toolbar", defaultMessage: "Bulk actions" }),
                    }}
                    pagination={pagination}
                    labels={{
                        selectAll: intl.formatMessage({ id: "uiDemo.news.list.selectAll", defaultMessage: "Select all" }),
                        selectRow: intl.formatMessage({ id: "uiDemo.news.list.selectRow", defaultMessage: "Select" }),
                        actions: intl.formatMessage({ id: "uiDemo.news.list.actions", defaultMessage: "Actions" }),
                    }}
                    emptyState={
                        isFiltered ? (
                            <EmptyState
                                icon={<Icon name="search" />}
                                title={intl.formatMessage({ id: "uiDemo.news.list.noMatches", defaultMessage: "No news match the filters" })}
                                description={intl.formatMessage({
                                    id: "uiDemo.news.list.noMatchesDescription",
                                    defaultMessage: "Check the spelling or reset the filters.",
                                })}
                                actions={
                                    <Button variant="outlined" color="secondary" size="small" onClick={listState.resetFilters}>
                                        {intl.formatMessage({ id: "uiDemo.news.list.resetFilters", defaultMessage: "Reset filters" })}
                                    </Button>
                                }
                            />
                        ) : (
                            <EmptyState
                                icon={<Icon name="inbox" />}
                                title={intl.formatMessage({ id: "uiDemo.news.list.empty", defaultMessage: "No news yet" })}
                                description={intl.formatMessage({
                                    id: "uiDemo.news.list.emptyDescription",
                                    defaultMessage: "News written here appear in the news list on the site.",
                                })}
                                actions={newNewsButton}
                            />
                        )
                    }
                />
            </ListLayout>
            <ConfirmDialog
                open={newsToDelete.length > 0}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setNewsToDelete([]);
                    }
                }}
                tone="danger"
                title={intl.formatMessage(
                    {
                        id: "uiDemo.news.list.deleteDialog.title",
                        defaultMessage: "Delete {count, plural, one {{name}} other {# news}} permanently?",
                    },
                    { count: newsToDelete.length, name: newsToDelete[0]?.title },
                )}
                description={intl.formatMessage({
                    id: "uiDemo.news.list.deleteDialog.description",
                    defaultMessage: "This can't be undone. To hide news from the site and keep them, mark them as deleted instead.",
                })}
                confirmLabel={intl.formatMessage({ id: "uiDemo.news.list.deleteDialog.confirm", defaultMessage: "Delete permanently" })}
                confirmIcon={<Icon name="delete" />}
                onConfirm={() => void deletePermanently()}
                loading={deleting}
                labels={{ cancel: intl.formatMessage({ id: "uiDemo.news.list.deleteDialog.cancel", defaultMessage: "Cancel" }) }}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "uiDemo.news.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}

interface NewsRowMenuProps {
    news: NewsRow;
    onEdit: () => void;
    onChangeStatus: (status: GQLNewsStatus) => void;
    onDelete: () => void;
}

function NewsRowMenu({ news, onEdit, onChangeStatus, onDelete }: NewsRowMenuProps) {
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
                        { id: "uiDemo.news.list.rowActions", defaultMessage: "Actions for {title}" },
                        { title: news.title },
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
                label={intl.formatMessage({ id: "uiDemo.news.list.edit", defaultMessage: "Edit" })}
                icon={<Icon name="edit" />}
                onClick={onEdit}
            />
            {news.status === "active" ? (
                <MenuItem
                    label={intl.formatMessage({ id: "uiDemo.news.list.bulk.markDeleted", defaultMessage: "Mark as deleted" })}
                    icon={<Icon name="archive" />}
                    onClick={() => onChangeStatus("deleted")}
                />
            ) : (
                <MenuItem
                    label={intl.formatMessage({ id: "uiDemo.news.list.bulk.restore", defaultMessage: "Restore" })}
                    icon={<Icon name="reload" />}
                    onClick={() => onChangeStatus("active")}
                />
            )}
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "uiDemo.news.list.bulk.delete", defaultMessage: "Delete permanently" })}
                icon={<Icon name="delete" />}
                color="error"
                onClick={onDelete}
            />
        </Menu>
    );
}
