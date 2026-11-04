import { gql } from "@apollo/client";
import {
    createOffsetLimitPagingAction,
    Field,
    FinalFormInput,
    MainContent,
    SortDirection,
    Table,
    TableFilterFinalForm,
    TableQuery,
    Toolbar,
    ToolbarItem,
    useTableQuery,
    useTableQueryFilter,
    useTableQueryPaging,
    useTableQuerySort,
} from "@dextinity/admin";
import { Typography } from "@mui/material";

import type { LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { apolloStoryDecorator } from "../../apollo-story.decorator";

const query = gql`
    query LaunchesPast($offset: Int, $limit: Int, $sort: String, $order: String, $filter: LaunchesPastFilter) {
        launchesPastResult(offset: $offset, limit: $limit, sort: $sort, order: $order, filter: $filter) {
            data {
                id
                mission_name
                launch_date_local
            }
            result {
                totalCount
            }
        }
    }
`;

interface IQueryData {
    launchesPastResult: LaunchesPastResult;
}

interface IVariables {
    offset: number;
    limit: number;
    sort: string;
    order: string;
    filter?: { mission_name: { contains: string } };
}
interface IFilterValues {
    query?: string;
}

export default {
    title: "@dextinity/admin/table",
    decorators: [apolloStoryDecorator("/graphql")],
};

export const FilterPagingSort = () => {
    const filterApi = useTableQueryFilter<IFilterValues>({});

    const limit = 5;
    const pagingApi = useTableQueryPaging(0);
    const sortApi = useTableQuerySort({
        columnName: "mission_name",
        direction: SortDirection.ASC,
    });
    const { tableData, api, loading, error } = useTableQuery<IQueryData, IVariables>()(query, {
        variables: {
            sort: sortApi.current.columnName,
            order: sortApi.current.direction,
            offset: pagingApi.current,
            limit,
            filter: filterApi.current.query ? { mission_name: { contains: filterApi.current.query } } : undefined,
        },
        resolveTableData: (data) => {
            const totalCount = data.launchesPastResult.result.totalCount;
            return {
                data: data.launchesPastResult.data,
                totalCount,
                pagingInfo: createOffsetLimitPagingAction(pagingApi, { totalCount }, limit),
            };
        },
    });

    return (
        <TableQuery api={api} loading={loading} error={error}>
            <>
                <Toolbar>
                    <ToolbarItem>
                        <Typography variant="h3">Filter Paging Sort</Typography>
                    </ToolbarItem>
                    <ToolbarItem>
                        <TableFilterFinalForm<IFilterValues> filterApi={filterApi}>
                            <Field name="query" type="text" component={FinalFormInput} fullWidth />
                        </TableFilterFinalForm>
                    </ToolbarItem>
                </Toolbar>
                {tableData && (
                    <MainContent>
                        <Table
                            sortApi={sortApi}
                            {...tableData}
                            columns={[
                                {
                                    name: "mission_name",
                                    header: "Mission Name",
                                    sortable: true,
                                },
                                {
                                    name: "launch_date_local",
                                    header: "Launch Date",
                                    sortable: true,
                                },
                            ]}
                        />
                    </MainContent>
                )}
            </>
        </TableQuery>
    );
};
