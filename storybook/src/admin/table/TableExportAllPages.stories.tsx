import { gql } from "@apollo/client";
import {
    createRestStartLimitPagingActions,
    ExcelExportButton,
    FillSpace,
    MainContent,
    Table,
    TableQuery,
    Toolbar,
    ToolbarActions,
    ToolbarItem,
    useExportPagedTableQuery,
    useTableQuery,
    useTableQueryPaging,
} from "@dextinity/admin";
import { Typography } from "@mui/material";

import { apolloRestStoryDecorator } from "../../apollo-rest-story.decorator";

const gqlRest = gql;

const query = gqlRest`
query users(
    $query: String
    $start : Int
    $limit : Int
) {
    photos(
        query: $query
        start: $start
        limit: $limit
    ) @rest(type: "Photos", path: "photos?_start={args.start}&_limit={args.limit}") {
        id
        albumId
        title
        thumbnailUrl
    }
}
`;
interface IPhoto {
    id: number;
    albumId: number;
    title: string;
    thumbnailUrl: string;
}

interface IQueryData {
    photos: IPhoto[];
}

interface IVariables {
    start: number;
    limit: number;
}

export default {
    title: "@dextinity/admin/table",
    decorators: [apolloRestStoryDecorator()],
};

export const ExportAllPages = () => {
    const totalCount = 5000;
    const loadLimit = 50;
    const pagingApi = useTableQueryPaging(0);

    const { tableData, api, loading, error } = useTableQuery<IQueryData, IVariables>()(query, {
        variables: {
            start: pagingApi.current,
            limit: loadLimit,
        },
        resolveTableData: (data) => ({
            data: data.photos,
            totalCount,
            pagingInfo: createRestStartLimitPagingActions(pagingApi, {
                totalPages: Math.ceil(totalCount / loadLimit), // Don't calculate this in a real application
                loadLimit,
            }),
        }),
    });

    const exportApi = useExportPagedTableQuery<IVariables>(api, {
        fromPage: 0,
        toPage: totalCount / loadLimit,
        variablesForPage: (page) => {
            return {
                start: page * loadLimit,
                limit: loadLimit,
            };
        },
    });

    return (
        <TableQuery api={api} loading={loading} error={error}>
            {tableData && (
                <>
                    <Toolbar>
                        <ToolbarItem>
                            <Typography variant="h3">Export All Pages</Typography>
                        </ToolbarItem>
                        <FillSpace />
                        <ToolbarActions>
                            <ExcelExportButton exportApi={exportApi} />
                        </ToolbarActions>
                    </Toolbar>
                    <MainContent>
                        <Table
                            exportApis={[exportApi]}
                            {...tableData}
                            columns={[
                                {
                                    name: "thumbnailUrl",
                                    header: "Thumbnail",
                                    sortable: true,
                                    render: (row: IPhoto) => {
                                        return <img src={row.thumbnailUrl} />;
                                    },
                                    headerExcel: "Thumbnail Url",
                                    renderExcel: (row: IPhoto) => {
                                        return row.thumbnailUrl;
                                    },
                                },
                                {
                                    name: "title",
                                    header: "Title",
                                    sortable: true,
                                },
                            ]}
                        />
                    </MainContent>
                </>
            )}
        </TableQuery>
    );
};
