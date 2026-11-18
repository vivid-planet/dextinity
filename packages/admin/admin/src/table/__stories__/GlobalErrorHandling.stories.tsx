import { gql } from "@apollo/client";
import { Table, TableQuery, useTableQuery } from "@dextinity/admin";

import { apolloSwapiStoryDecorator } from "../../apollo-story.decorator";
import { errorDialogStoryProviderDecorator } from "../../docs/components/ErrorHandling/ErrorDialog/error-dialog-provider.decorator";

interface People {
    id: string;
    name: string;
    birthYear: string;
    gender: string;
    homeworld: {
        name: string;
    };
}
interface QueryData {
    allPeople: {
        people: People[];
    };
}

export default {
    title: "@dextinity/admin/table/globalErrorHandling",
    decorators: [apolloSwapiStoryDecorator(), errorDialogStoryProviderDecorator()],
    args: {
        query: "query StarWarsPeople {allPeople { people { id name birthYear gender homeworld{ name } } }}",
    },
    argTypes: {
        query: {
            name: "GQL Query",
        },
    },
};

type Args = {
    query: string;
};

export const GlobalErrorHandling = {
    render: ({ query }: Args) => {
        const { tableData, api, loading, error } = useTableQuery<QueryData, Record<string, any>>()(
            gql`
                ${query}
            `,
            {
                resolveTableData: (data) => ({
                    data: data.allPeople.people,
                    totalCount: data.allPeople.people.length,
                }),
                globalErrorHandling: true,
            },
        );

        return (
            <TableQuery api={api} loading={loading} error={error}>
                {tableData && (
                    <Table
                        {...tableData}
                        columns={[
                            {
                                name: "id",
                                header: "Id",
                            },
                            {
                                name: "name",
                                header: "Name",
                            },
                            {
                                name: "birthYear",
                                header: "Birthyear",
                            },
                            {
                                name: "gender",
                                header: "Gender",
                            },
                            {
                                name: "homeworld.name",
                                header: "Homeworld",
                            },
                        ]}
                    />
                )}
            </TableQuery>
        );
    },
};
