import { gql } from "@apollo/client";
import { Table, TableQuery, useTableQuery } from "@dextinity/admin";

import type { LaunchesPastResult } from "../../../../.storybook/mocks/handlers";
import { apolloStoryDecorator } from "../../../apollo-story.decorator";

const query = gql`
    query LaunchesPast {
        launchesPastResult {
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

export default {
    title: "Docs/Components/Table/TableQuery",
    decorators: [apolloStoryDecorator("/graphql")],
};

export const _TableQuery = {
    render: () => {
        const { tableData, api, loading, error } = useTableQuery<QueryData, Record<string, never>>()(query, {
            resolveTableData: (data) => ({
                data: data.launchesPastResult.data,
                totalCount: data.launchesPastResult.result.totalCount,
            }),
        });

        return (
            <TableQuery api={api} loading={loading} error={error}>
                {tableData && (
                    <Table
                        {...tableData}
                        columns={[
                            {
                                name: "mission_name",
                                header: "Mission Name",
                            },
                            {
                                name: "launch_date_local",
                                header: "Launch Date",
                            },
                        ]}
                    />
                )}
            </TableQuery>
        );
    },

    name: "TableQuery",
};
