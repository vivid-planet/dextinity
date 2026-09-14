import { gql } from "@apollo/client";
import {
    createOffsetLimitPagingAction,
    ExcelExportButton,
    FillSpace,
    MainContent,
    Table,
    TableQuery,
    Toolbar,
    ToolbarActions,
    ToolbarItem,
    useExportDisplayedTableData,
    useExportPagedTableQuery,
    useExportTableQuery,
    useTableQuery,
    useTableQueryPaging,
    VisibleType,
} from "@dextinity/admin";
import { Typography } from "@mui/material";

import { apolloRestStoryDecorator } from "../../../apollo-rest-story.decorator";

interface Person {
    id: number;
    firstname: string;
    lastname: string;
    hourlySalary?: number;
    job: {
        id: number;
        name: string;
    };
}

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
    title: "Docs/Components/Table/Excel Export",
    decorators: [apolloRestStoryDecorator()],
};

export const BasicExcelExportTable = () => {
    const data: Person[] = [
        { id: 1, firstname: "Kady", lastname: "Wood", job: { id: 1, name: "Project Manager" } },
        { id: 2, firstname: "Lewis", lastname: "Chan", job: { id: 2, name: "UI/UX Designer" } },
        { id: 3, firstname: "Tom", lastname: "Weaver", job: { id: 3, name: "Frontend Developer" } },
        { id: 4, firstname: "Mia", lastname: "Carroll", job: { id: 4, name: "Backend Developer" } },
    ];

    // step 1
    const exportApi = useExportDisplayedTableData({ fileName: "useExportDisplayedTableData", worksheetName: "Employees" });

    return (
        <>
            <Toolbar>
                <ToolbarItem>
                    <Typography variant="h3">Basic Excel Export</Typography>
                </ToolbarItem>
                <FillSpace />
                <ToolbarActions>
                    {/* step 3 */}
                    <ExcelExportButton exportApi={exportApi} />
                </ToolbarActions>
            </Toolbar>

            <MainContent>
                <Table
                    // step 2
                    exportApis={[exportApi]}
                    data={data}
                    totalCount={data.length}
                    columns={[
                        {
                            name: "id",
                            header: "ID",
                        },
                        {
                            name: "firstname",
                            header: "Firstname",
                        },
                        {
                            name: "lastname",
                            header: "Lastname",
                        },
                        {
                            name: "job.name",
                            header: "Job (Nested)",
                        },
                    ]}
                />
            </MainContent>
        </>
    );
};

export const ExcelExportAndVisibility = {
    render: () => {
        const data = [
            { id: 1, column1: 1, column2: 2, column3: 3, column4: 4, column5: 5 },
            { id: 2, column1: 1, column2: 2, column3: 3, column4: 4, column5: 5 },
            { id: 3, column1: 1, column2: 2, column3: 3, column4: 4, column5: 5 },
            { id: 4, column1: 1, column2: 2, column3: 3, column4: 4, column5: 5 },
            { id: 5, column1: 1, column2: 2, column3: 3, column4: 4, column5: 5 },
        ];

        const exportApi = useExportDisplayedTableData({ fileName: "visibility", worksheetName: "Export Visibility" });

        /*
         * Browser: Show columns 1 and 5
         * Export: Show columns 1, 3 and 4
         * */
        return (
            <>
                <Toolbar>
                    <ToolbarItem>
                        <Typography variant="h3">Excel Export and Visibility</Typography>
                    </ToolbarItem>
                    <FillSpace />
                    <ToolbarActions>
                        <ExcelExportButton exportApi={exportApi} />
                    </ToolbarActions>
                </Toolbar>

                <MainContent>
                    <Table
                        exportApis={[exportApi]}
                        data={data}
                        totalCount={data.length}
                        columns={[
                            {
                                name: "column1",
                                header: "Column 1",
                                // Default visibility: is true for browser and export
                            },
                            {
                                name: "column2",
                                header: "Column 2",
                                visible: false, // explicitly set visibility to false (for browser and export)
                            },
                            {
                                name: "column3",
                                header: "Column 3",
                                visible: { [VisibleType.Browser]: false }, // column will not be shown in Browser, but will be exported
                            },
                            {
                                name: "column4",
                                header: "Column 4",
                                visible: { [VisibleType.Browser]: false, [VisibleType.Export]: true }, // column will not be shown in Browser, but will be exported
                            },
                            {
                                name: "column5",
                                header: "Column 5",
                                visible: { [VisibleType.Browser]: true, [VisibleType.Export]: false }, // column will be shown in Browser, but will not be exported
                            },
                        ]}
                    />
                </MainContent>
            </>
        );
    },

    name: "Excel Export and Visibility",
};

export const ExcelExportAndCustomRenderedColumns = {
    render: () => {
        const data: Person[] = [
            { id: 1, firstname: "Kady", lastname: "Wood", job: { id: 1, name: "Project Manager" } },
            { id: 2, firstname: "Lewis", lastname: "Chan", job: { id: 2, name: "UI/UX Designer" } },
            { id: 3, firstname: "Tom", lastname: "Weaver", job: { id: 3, name: "Frontend Developer" } },
            { id: 4, firstname: "Mia", lastname: "Carroll", job: { id: 4, name: "Backend Developer" } },
        ];

        const exportApi = useExportDisplayedTableData({ fileName: "useExportDisplayedTableData", worksheetName: "Employees" });

        return (
            <>
                <Toolbar>
                    <ToolbarItem>
                        <Typography variant="h3">Excel Export and Custom Rendered Columns</Typography>
                    </ToolbarItem>
                    <FillSpace />
                    <ToolbarActions>
                        <ExcelExportButton exportApi={exportApi} />
                    </ToolbarActions>
                </Toolbar>

                <MainContent>
                    <Table
                        exportApis={[exportApi]}
                        data={data}
                        totalCount={data.length}
                        columns={[
                            {
                                name: "id",
                                header: "ID",
                            },
                            {
                                name: "name",
                                header: "Name",
                                render: (row) => (
                                    <>
                                        {row.firstname} <strong>{row.lastname}</strong>
                                    </>
                                ),
                                renderExcel: (row) => `${row.firstname} ${row.lastname}`,
                            },
                        ]}
                    />
                </MainContent>
            </>
        );
    },

    name: "Excel Export and Custom Rendered Columns",
};

export const ExcelExportAndPaginationUseExportPagedTableQuery = {
    render: () => {
        const pagingApi = useTableQueryPaging(0);
        const limit = 5;

        const { tableData, api, loading, error } = useTableQuery<QueryResult, QueryVariables>()(query, {
            variables: {
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
                    pagingInfo: createOffsetLimitPagingAction(pagingApi, data, limit),
                };
            },
        });

        const exportApi = useExportPagedTableQuery<QueryVariables>(
            api,
            {
                fromPage: 0,
                toPage: 2,
                variablesForPage: (page) => {
                    return {
                        offset: page * limit,
                        limit: limit,
                    };
                },
            },
            { fileName: "useExportPagedTableQuery" },
        );

        return (
            <TableQuery api={api} loading={loading} error={error}>
                {tableData && (
                    <>
                        <Toolbar>
                            <ToolbarItem>
                                <Typography variant="h3">Export Pages</Typography>
                            </ToolbarItem>
                            <FillSpace />
                            <ToolbarActions>
                                <ExcelExportButton exportApi={exportApi}>Export Pages 1 to 3</ExcelExportButton>
                            </ToolbarActions>
                        </Toolbar>
                        <Table
                            exportApis={[exportApi]}
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
                    </>
                )}
            </TableQuery>
        );
    },

    name: "Excel Export and Pagination (useExportPagedTableQuery)",
};

export const ExcelExportAndPaginationUseExportTableQuery = {
    render: () => {
        const pagingApi = useTableQueryPaging(0);
        const limit = 5;

        const { tableData, api, loading, error } = useTableQuery<QueryResult, QueryVariables>()(query, {
            variables: {
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
                    pagingInfo: createOffsetLimitPagingAction(pagingApi, data, limit),
                };
            },
        });

        const exportApi = useExportTableQuery<QueryVariables>(api, { offset: 10, limit: 20 }, { fileName: "useExportTableQuery" });

        return (
            <TableQuery api={api} loading={loading} error={error}>
                {tableData && (
                    <>
                        <Toolbar>
                            <ToolbarItem>
                                <Typography variant="h3">Export Pages</Typography>
                            </ToolbarItem>
                            <FillSpace />
                            <ToolbarActions>
                                <ExcelExportButton exportApi={exportApi}>Export Rows 11 to 30</ExcelExportButton>
                            </ToolbarActions>
                        </Toolbar>
                        <Table
                            exportApis={[exportApi]}
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
                    </>
                )}
            </TableQuery>
        );
    },

    name: "Excel Export and Pagination (useExportTableQuery)",
};
