import { gql } from "@apollo/client";
import { createOffsetLimitPagingAction, Table, TableQuery, useTableQuery, useTableQueryPaging } from "@dextinity/admin";

import { apolloRestStoryDecorator } from "../../../apollo-rest-story.decorator";

const query = gql`
    query Post($offset: Int, $limit: Int) {
        posts(offset: $offset, limit: $limit) @rest(type: "PostPayload", path: "posts?_start={args.offset}&_limit={args.limit}") {
            id
            title
        }
    }
`;

interface Post {
    id: string;
    title: string;
}

interface QueryResult {
    posts: Post[];
    totalCount: number;
}

interface QueryVariables {
    offset: number;
    limit: number;
}

export default {
    title: "Docs/Components/Table/Pagination",
    decorators: [apolloRestStoryDecorator()],
};

export const PaginationTable = () => {
    // step 1
    const pagingApi = useTableQueryPaging(0);
    const limit = 5;
    // step 2
    const { tableData, api, loading, error } = useTableQuery<QueryResult, QueryVariables>()(query, {
        variables: {
            // step 3
            offset: pagingApi.current,
            limit,
        },
        resolveTableData: (result) => {
            const data = {
                ...result,
                // Don't hardcode this in a real application,
                // normally the API should return the totalCount
                totalCount: 100,
            };
            return {
                data: data.posts,
                totalCount: data.totalCount,
                // step 4
                pagingInfo: createOffsetLimitPagingAction(pagingApi, data, limit),
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
                            name: "title",
                            header: "Title",
                        },
                    ]}
                />
            )}
        </TableQuery>
    );
};
