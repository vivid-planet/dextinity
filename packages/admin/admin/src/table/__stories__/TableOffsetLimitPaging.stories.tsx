import { gql } from "@apollo/client";
import { createOffsetLimitPagingAction, MainContent, Table, TableQuery, useTableQuery, useTableQueryPaging } from "@dextinity/admin";

import type { LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { apolloStoryDecorator } from "../../apollo-story.decorator";

export default {
    title: "@dextinity/admin/table",
    decorators: [apolloStoryDecorator("/graphql")],
};

export const PagingOffsetLimit = () => {
    const pagingApi = useTableQueryPaging(0);
    const limit = 10;
    const { tableData, api, loading, error } = useTableQuery<
        { launchesPastResult: LaunchesPastResult },
        { limit?: number; offset?: number; sort?: string; order?: string }
    >()(
        gql`
            query LaunchesPast($limit: Int, $offset: Int, $sort: String, $order: String) {
                launchesPastResult(limit: $limit, offset: $offset, sort: $sort, order: $order) {
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
        `,
        {
            variables: {
                offset: pagingApi.current,
                limit,
            },
            resolveTableData: (data) => {
                return {
                    data: data?.launchesPastResult?.data,
                    totalCount: data?.launchesPastResult?.result.totalCount,
                    pagingInfo: createOffsetLimitPagingAction(pagingApi, { totalCount: data?.launchesPastResult?.result.totalCount }, limit),
                };
            },
            notifyOnNetworkStatusChange: true,
        },
    );

    return (
        <TableQuery api={api} loading={loading} error={error}>
            <MainContent>
                {tableData && (
                    <Table
                        {...tableData}
                        columns={[
                            {
                                name: "mission_name",
                                header: "Mission Name",
                            },
                        ]}
                    />
                )}
            </MainContent>
        </TableQuery>
    );
};
