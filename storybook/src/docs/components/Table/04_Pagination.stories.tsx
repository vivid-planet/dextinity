import { gql } from "@apollo/client";
import { createOffsetLimitPagingAction, Table, TableQuery, useTableQuery, useTableQueryPaging } from "@dextinity/admin";

import type { LaunchesPastResult } from "../../../../.storybook/mocks/handlers";
import { apolloStoryDecorator } from "../../../apollo-story.decorator";

const query = gql`
    query LaunchesPast($offset: Int, $limit: Int) {
        launchesPastResult(offset: $offset, limit: $limit) {
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

interface QueryData {
    launchesPastResult: LaunchesPastResult;
}

interface QueryVariables {
    offset: number;
    limit: number;
}

export default {
    title: "Docs/Components/Table/Pagination",
    decorators: [apolloStoryDecorator("/graphql")],
};

export const PaginationTable = () => {
    // step 1
    const pagingApi = useTableQueryPaging(0);
    const limit = 5;
    // step 2
    const { tableData, api, loading, error } = useTableQuery<QueryData, QueryVariables>()(query, {
        variables: {
            // step 3
            offset: pagingApi.current,
            limit,
        },
        resolveTableData: (data) => {
            const totalCount = data.launchesPastResult.result.totalCount;
            return {
                data: data.launchesPastResult.data,
                totalCount,
                // step 4
                pagingInfo: createOffsetLimitPagingAction(pagingApi, { totalCount }, limit),
            };
        },
    });

    return (
        <TableQuery api={api} loading={loading} error={error}>
            {tableData && (
                <Table
                    // step 5
                    // pagingInfo is a property of tableData
                    {...tableData}
                    columns={[
                        {
                            name: "id",
                            header: "ID",
                        },
                        {
                            name: "mission_name",
                            header: "Mission Name",
                        },
                    ]}
                />
            )}
        </TableQuery>
    );
};
