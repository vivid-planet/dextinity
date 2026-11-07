import { gql, useQuery } from "@apollo/client";
import {
    BlockAdminComponentSection,
    type BlockInterface,
    createBlockSkeleton,
    toGqlSort,
    useContentScope,
    useDataGridLabels,
    useRemoteListPagination,
} from "@dextinity/cms-admin";
import { Button, DataGrid, type DataGridColumn, type DataGridSort, FilterBar, Typography } from "@dextinity/ui";
import type { NewsListBlockData, NewsListBlockInput } from "@src/blocks.generated";
import type { GQLNewsSortField } from "@src/graphql.generated";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useDebounce } from "use-debounce";

import type { GQLNewsListBlockNewsFragment, GQLNewsListBlockQuery, GQLNewsListBlockQueryVariables } from "./NewsListBlock.generated";

type State = {
    ids: string[];
};

const newsListBlockQuery = gql`
    query NewsListBlock($scope: NewsContentScopeInput!, $search: String, $sort: [NewsSort!], $offset: Int!, $limit: Int!) {
        newsList(scope: $scope, search: $search, sort: $sort, offset: $offset, limit: $limit) {
            nodes {
                id
                ...NewsListBlockNews
            }
            totalCount
        }
    }
    fragment NewsListBlockNews on News {
        title
    }
`;

export const NewsListBlock: BlockInterface<NewsListBlockData, State, NewsListBlockInput> = {
    ...createBlockSkeleton(),
    name: "NewsList",
    displayName: <FormattedMessage id="blocks.newsList.name" defaultMessage="News List" />,
    defaultValues: () => ({ ids: [] }),
    AdminComponent: ({ state, updateState }) => {
        const { scope } = useContentScope();
        const intl = useIntl();
        const { labels: dataGridLabels } = useDataGridLabels();
        const [searchInput, setSearchInput] = useState("");
        const [search] = useDebounce(searchInput, 300);
        const [sort, setSort] = useState<DataGridSort | undefined>();
        const [page, setPage] = useState(1);
        const [pageSize, setPageSize] = useState(10);

        const { data, previousData, loading, error } = useQuery<GQLNewsListBlockQuery, GQLNewsListBlockQueryVariables>(newsListBlockQuery, {
            variables: {
                scope,
                search: search || undefined,
                sort: toGqlSort<GQLNewsSortField>(sort),
                offset: (page - 1) * pageSize,
                limit: pageSize,
            },
        });
        const newsList = (data ?? previousData)?.newsList;
        const pagination = useRemoteListPagination(
            {
                page,
                pageSize,
                setPage,
                setPageSize: (newPageSize) => {
                    setPageSize(newPageSize);
                    setPage(1);
                },
            },
            newsList?.totalCount,
        );

        if (error) {
            throw error;
        }

        const columns: DataGridColumn<GQLNewsListBlockNewsFragment & { id: string }>[] = [
            {
                key: "title",
                header: intl.formatMessage({ id: "news.title", defaultMessage: "Title" }),
                render: (news) => news.title,
                sortable: true,
            },
        ];

        return (
            <>
                <BlockAdminComponentSection variant="dense">
                    <FilterBar
                        searchValue={searchInput}
                        onSearchChange={(value) => {
                            setSearchInput(value);
                            setPage(1);
                        }}
                        searchShortcut={false}
                        resultCount={newsList?.totalCount}
                        labels={{
                            search: intl.formatMessage({ id: "blocks.newsList.search", defaultMessage: "Search" }),
                            searchPlaceholder: intl.formatMessage({ id: "blocks.newsList.searchPlaceholder", defaultMessage: "Search news" }),
                            filters: intl.formatMessage({ id: "blocks.newsList.filters", defaultMessage: "Filters" }),
                            resultCount: (count) =>
                                intl.formatMessage(
                                    { id: "blocks.newsList.resultCount", defaultMessage: "{count, plural, one {# news} other {# news}}" },
                                    { count },
                                ),
                        }}
                    />
                </BlockAdminComponentSection>
                <DataGrid
                    aria-label={intl.formatMessage({ id: "blocks.newsList.news", defaultMessage: "News" })}
                    columns={columns}
                    rows={newsList?.nodes ?? []}
                    getRowId={(news) => news.id}
                    selectable
                    selectedIds={state.ids}
                    onSelectionChange={(ids) => updateState({ ids })}
                    clearSelectionOnEscape={false}
                    sort={sort}
                    onSortChange={(newSort) => {
                        setSort(newSort);
                        setPage(1);
                    }}
                    loading={loading && !newsList}
                    pagination={pagination}
                    labels={dataGridLabels}
                    footer={
                        state.ids.length > 0 ? (
                            <>
                                <Typography variant="small" element="span">
                                    <FormattedMessage
                                        id="blocks.newsList.selectedCount"
                                        defaultMessage="{count, plural, one {# news selected} other {# news selected}}"
                                        values={{ count: state.ids.length }}
                                    />
                                </Typography>
                                <Button variant="text" color="secondary" size="small" onClick={() => updateState({ ids: [] })}>
                                    <FormattedMessage id="blocks.newsList.clearSelection" defaultMessage="Clear selection" />
                                </Button>
                            </>
                        ) : undefined
                    }
                />
            </>
        );
    },
};
