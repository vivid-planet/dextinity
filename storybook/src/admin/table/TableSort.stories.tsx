import { gql } from "@apollo/client";
import { SortDirection, Table, TableQuery, useTableQuery, useTableQuerySort } from "@dextinity/admin";

import { apolloRestStoryDecorator } from "../../apollo-rest-story.decorator";

const gqlRest = gql;

const query = gqlRest`
query users(
    $sort: String
    $order: String
) {
    users(
        sort: $sort
        order: $order
    ) @rest(type: "User", path: "users?_sort={args.sort}&_order={args.order}") {
        id
        name
        username
        email
    }
}
`;

interface IQueryData {
    users: Array<{
        id: number;
        name: string;
        username: string;
        email: string;
    }>;
}

interface IVariables {
    blubId: number;
    sort: string;
    order: SortDirection;
}

export default {
    title: "@dextinity/admin/table",
    decorators: [apolloRestStoryDecorator()],
};

export const Sort = () => {
    const sortApi = useTableQuerySort({
        columnName: "name",
        direction: SortDirection.ASC,
    });
    const { tableData, api, loading, error } = useTableQuery<IQueryData, IVariables>()(query, {
        variables: {
            blubId: 123,
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
                    sortApi={sortApi}
                    {...tableData}
                    columns={[
                        {
                            name: "name",
                            header: "Name",
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
