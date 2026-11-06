import { useApolloClient, useQuery } from "@apollo/client";
import { useContentScope } from "@dextinity/cms-admin";
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
import { useCallback, useEffect, useState } from "react";
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
import { type NewsStatusFilter, useNewsListUrlState } from "./useNewsListUrlState";
import { useRouterLinkClick } from "./useRouterLinkClick";

type NewsRow = GQLNewsUiListQuery["newsList"]["nodes"][number];

const searchDebounceMs = 300;

interface NewsListPageProps {
    baseUrl: string;
}

export function NewsListPage({ baseUrl }: NewsListPageProps) {
    const intl = useIntl();
    const history = useHistory();
    const navigateWithRouter = useRouterLinkClick();
    const client = useApolloClient();
    const { scope } = useContentScope();
    const { search, status, category, sort, page, pageSize, setPageSize, update: updateUrlState } = useNewsListUrlState();
    const [searchInput, setSearchInput] = useState(search);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState<NewsRow[]>([]);
    const [deleting, setDeleting] = useState(false);
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const update = useCallback(
        (changes: Parameters<typeof updateUrlState>[0]) => {
            setSelectedIds([]);
            updateUrlState(changes);
        },
        [updateUrlState],
    );
    const { perform } = useUndoToast({
        addToast,
        labels: { undo: intl.formatMessage({ id: "uiDemo.news.list.undo", defaultMessage: "Undo" }) },
    });

    useEffect(() => {
        if (searchInput === search) {
            return;
        }
        const timeout = window.setTimeout(() => update({ search: searchInput }), searchDebounceMs);
        return () => window.clearTimeout(timeout);
    }, [searchInput, search, update]);

    const countFilter: GQLNewsFilter = category ? { category: { equal: category } } : {};
    const filter: GQLNewsFilter = status === "all" ? countFilter : { and: [countFilter, { status: { equal: status } }] };

    const { data, previousData, loading, error, refetch } = useQuery<GQLNewsUiListQuery, GQLNewsUiListQueryVariables>(newsListQuery, {
        fetchPolicy: "cache-and-network",
        variables: {
            scope,
            offset: (page - 1) * pageSize,
            limit: pageSize,
            sort: [{ field: sort.key as GQLNewsSortField, direction: sort.direction === "asc" ? "ASC" : "DESC" }],
            search: search || undefined,
            filter,
            countFilter,
        },
    });

    if (error) {
        throw error;
    }

    const shownData = data ?? previousData;
    const rows = shownData?.newsList.nodes ?? [];
    const total = shownData?.newsList.totalCount ?? 0;
    const isFiltered = search !== "" || status !== "all" || category !== null;

    const newsUrl = (id: string) => `${baseUrl}/${id}/edit`;

    const setStatuses = async (news: NewsRow[], nextStatus: GQLNewsStatus) => {
        await Promise.all(
            news.map((entry) =>
                client.mutate<GQLNewsUiUpdateStatusMutation, GQLNewsUiUpdateStatusMutationVariables>({
                    mutation: updateNewsStatusMutation,
                    variables: { id: entry.id, status: nextStatus },
                }),
            ),
        );
        await refetch();
    };

    const restoreStatuses = async (news: NewsRow[]) => {
        await Promise.all(
            news.map((entry) =>
                client.mutate<GQLNewsUiUpdateStatusMutation, GQLNewsUiUpdateStatusMutationVariables>({
                    mutation: updateNewsStatusMutation,
                    variables: { id: entry.id, status: entry.status },
                }),
            ),
        );
        await refetch();
    };

    const changeStatus = (news: NewsRow[], nextStatus: GQLNewsStatus) => {
        const affected = news.filter((entry) => entry.status !== nextStatus);
        if (affected.length === 0) {
            return;
        }
        const previous = affected.map((entry) => ({ ...entry }));
        const name = affected.length === 1 ? affected[0].title : undefined;
        perform({
            run: () => {
                setSelectedIds([]);
                void setStatuses(affected, nextStatus);
            },
            undo: () => {
                void restoreStatuses(previous);
            },
            icon: <Icon name={nextStatus === "deleted" ? "archive" : "refresh"} />,
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
        try {
            await Promise.all(
                newsToDelete.map((entry) =>
                    client.mutate<GQLNewsUiDeleteMutation, GQLNewsUiDeleteMutationVariables>({
                        mutation: deleteNewsMutation,
                        variables: { id: entry.id },
                    }),
                ),
            );
            addToast({
                icon: <Icon name="trash" />,
                message: intl.formatMessage(
                    { id: "uiDemo.news.list.deleted", defaultMessage: "{count, plural, one {# news} other {# news}} deleted permanently" },
                    { count: newsToDelete.length },
                ),
            });
            setSelectedIds((ids) => ids.filter((id) => !newsToDelete.some((entry) => entry.id === id)));
            setNewsToDelete([]);
            await refetch();
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({ id: "uiDemo.news.list.deleteFailed", defaultMessage: "Deleting failed · nothing was deleted" }),
            });
        } finally {
            setDeleting(false);
        }
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

    const resetFilters = () => {
        setSearchInput("");
        update({ search: "", status: "all", category: null });
    };

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
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                        resultCount={shownData ? total : undefined}
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
                                onClick={() => update({ status: filterOption.value })}
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
                                    update({ category: nextCategory === "" ? null : (nextCategory as GQLNewsCategory) });
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
                                onDelete={() => update({ category: null })}
                                labels={{
                                    delete: intl.formatMessage(
                                        { id: "uiDemo.news.list.filter.removeCategory", defaultMessage: "Remove filter Category: {category}" },
                                        { category: getNewsCategoryLabel(intl, category) },
                                    ),
                                }}
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
                    onSortChange={(nextSort) => update({ sort: nextSort, page })}
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
                            icon: <Icon name="refresh" />,
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
                            icon: <Icon name="trash" />,
                            color: "error",
                            onClick: () => setNewsToDelete(selectedRows),
                        },
                    ]}
                    bulkActionLabels={{
                        count: (count) => intl.formatMessage({ id: "uiDemo.news.list.bulk.count", defaultMessage: "{count} selected" }, { count }),
                        clear: intl.formatMessage({ id: "uiDemo.news.list.bulk.clear", defaultMessage: "Clear selection" }),
                        toolbar: intl.formatMessage({ id: "uiDemo.news.list.bulk.toolbar", defaultMessage: "Bulk actions" }),
                    }}
                    pagination={
                        total === 0
                            ? undefined
                            : {
                                  page,
                                  pageSize,
                                  total,
                                  onPageChange: (nextPage) => update({ page: nextPage }),
                                  onPageSizeChange: (nextPageSize) => {
                                      setPageSize(nextPageSize);
                                      update({ page: 1 });
                                  },
                                  labels: {
                                      navigation: intl.formatMessage({ id: "uiDemo.news.list.pagination", defaultMessage: "Pagination" }),
                                      pageSize: intl.formatMessage({ id: "uiDemo.news.list.pageSize", defaultMessage: "Per page" }),
                                      range: (from, to, count) =>
                                          intl.formatMessage(
                                              { id: "uiDemo.news.list.range", defaultMessage: "{from}–{to} of {count}" },
                                              { from, to, count },
                                          ),
                                      previous: intl.formatMessage({ id: "uiDemo.news.list.previousPage", defaultMessage: "Previous page" }),
                                      next: intl.formatMessage({ id: "uiDemo.news.list.nextPage", defaultMessage: "Next page" }),
                                      page: (pageNumber) =>
                                          intl.formatMessage({ id: "uiDemo.news.list.page", defaultMessage: "Page {page}" }, { page: pageNumber }),
                                  },
                              }
                    }
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
                                    <Button variant="outlined" color="secondary" size="small" onClick={resetFilters}>
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
                confirmIcon={<Icon name="trash" />}
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
                >
                    <Icon name="more" />
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
                    icon={<Icon name="refresh" />}
                    onClick={() => onChangeStatus("active")}
                />
            )}
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "uiDemo.news.list.bulk.delete", defaultMessage: "Delete permanently" })}
                icon={<Icon name="trash" />}
                color="error"
                onClick={onDelete}
            />
        </Menu>
    );
}
