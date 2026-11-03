import { gql } from "@apollo/client";
import { SortDirection, Table, TableQuery, useTableQuery, useTableQuerySort } from "@dextinity/admin";

import type { LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { apolloStoryDecorator } from "../../apollo-story.decorator";

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

interface IQueryData {
    launchesPastResult: LaunchesPastResult;
}

interface IVariables {
    sort: string;
    order: SortDirection;
}

export default {
    title: "@dextinity/admin/table",
    decorators: [apolloStoryDecorator("/graphql")],
};

export const Sort = () => {
    const sortApi = useTableQuerySort({
        columnName: "mission_name",
        direction: SortDirection.ASC,
    });
    const { tableData, api, loading, error } = useTableQuery<IQueryData, IVariables>()(query, {
        variables: {
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
            )}
        </TableQuery>
    );
};
