import { gql } from "@apollo/client";
import { SortDirection, Table, TableQuery, useTableQuery, useTableQuerySort } from "@dextinity/admin";

import type { LaunchesPastResult } from "../../../../.storybook/mocks/handlers";
import { apolloStoryDecorator } from "../../../apollo-story.decorator";

const query = gql`
    query LaunchesPast($sort: String, $order: String) {
        launchesPastResult(sort: $sort, order: $order) {
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
    sort: string;
    order: SortDirection;
}

export default {
    title: "Docs/Components/Table/Sorting",
    decorators: [apolloStoryDecorator("/graphql")],
};

export const SortableTable = () => {
    // step 1
    const sortApi = useTableQuerySort({
        columnName: "mission_name",
        direction: SortDirection.ASC,
    });
    const { tableData, api, loading, error } = useTableQuery<QueryData, QueryVariables>()(query, {
        variables: {
            // step 4
            sort: sortApi.current.columnName,
            order: sortApi.current.direction,
        },
        resolveTableData: (data) => ({
            data: data.launchesPastResult.data,
            totalCount: data.launchesPastResult.result.totalCount,
        }),
    });

    return (
        <TableQuery api={api} loading={loading} error={error}>
            {tableData && (
                <Table
                    // step 2
                    sortApi={sortApi}
                    {...tableData}
                    columns={[
                        {
                            name: "mission_name",
                            header: "Mission Name",
                            // step 3
                            sortable: true,
                        },
                        {
                            name: "launch_date_local",
                            header: "Launch Date",
                            sortable: true,
                        },
                    ]}
                />
            )}
        </TableQuery>
    );
};
