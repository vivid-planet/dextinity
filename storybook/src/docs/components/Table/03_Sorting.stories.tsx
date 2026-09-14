import { gql } from "@apollo/client";
import { SortDirection, Table, TableQuery, useTableQuery, useTableQuerySort } from "@dextinity/admin";

import { apolloRestStoryDecorator } from "../../../apollo-rest-story.decorator";

const query = gql`
    query users($sort: String, $order: String) {
        users(sort: $sort, order: $order) @rest(type: "User", path: "users?_sort={args.sort}&_order={args.order}") {
            id
            name
            username
            email
        }
    }
`;

interface QueryData {
    users: Array<{
        id: number;
        name: string;
        username: string;
        email: string;
    }>;
}

interface QueryVariables {
    blubId: number;
    sort: string;
    order: SortDirection;
}

export default {
    title: "Docs/Components/Table/Sorting",
    decorators: [apolloRestStoryDecorator()],
};

export const SortableTable = () => {
    // step 1
    const sortApi = useTableQuerySort({
        columnName: "name",
        direction: SortDirection.ASC,
    });
    const { tableData, api, loading, error } = useTableQuery<QueryData, QueryVariables>()(query, {
        variables: {
            blubId: 123,
            // step 4
            sort: sortApi.current.columnName,
            order: sortApi.current.direction,
        },
        resolveTableData: (data) => ({
            data: data.users,
            totalCount: data.users.length,
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
                            name: "name",
                            header: "Name",
                            // step 3
                            sortable: true,
                        },
                        {
                            name: "username",
                            header: "Username",
                            sortable: true,
                        },
                        {
                            name: "email",
                            header: "E-Mail",
                            sortable: true,
                        },
                    ]}
                />
            )}
        </TableQuery>
    );
};
