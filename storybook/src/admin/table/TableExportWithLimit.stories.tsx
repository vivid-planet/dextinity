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
    useExportDisplayedTableData,
    useExportTableQuery,
    useTableQuery,
    useTableQueryPaging,
} from "@dextinity/admin";
import { Typography } from "@mui/material";

import type { Launch, LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { apolloStoryDecorator } from "../../apollo-story.decorator";

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
interface IQueryData {
    launchesPastResult: LaunchesPastResult;
}

interface IVariables {
    offset: number;
    limit: number;
}

export default {
    title: "@dextinity/admin/table",
    decorators: [apolloStoryDecorator("/graphql")],
};

export const ExportWithLimit = () => {
    const loadLimit = 10;
    const pagingApi = useTableQueryPaging(0);

    const { tableData, api, loading, error } = useTableQuery<IQueryData, IVariables>()(query, {
        variables: {
            offset: pagingApi.current,
            limit: loadLimit,
        },
        resolveTableData: (data) => {
            const totalCount = data.launchesPastResult.result.totalCount;
            return {
                data: data.launchesPastResult.data,
                totalCount,
                pagingInfo: createRestStartLimitPagingActions(pagingApi, {
                    totalPages: Math.ceil(totalCount / loadLimit),
                    loadLimit,
                }),
            };
        },
    });

    const exportCurrentPageApi = useExportDisplayedTableData({ fileName: "Custom File Name Displayed Data" });
    const exportApi = useExportTableQuery<IVariables>(api, { offset: 0, limit: 5000 }, { fileName: "Custom File Name Limit 5000" });

    return (
        <TableQuery api={api} loading={loading} error={error}>
            {tableData && (
                <>
                    <Toolbar>
                        <ToolbarItem>
                            <Typography variant="h3">Export Visibility With Limit</Typography>
                        </ToolbarItem>
                        <FillSpace />
                        <ToolbarActions>
                            <ExcelExportButton exportApi={exportCurrentPageApi}>Aktuelle Seite exportieren</ExcelExportButton>
                            <ExcelExportButton exportApi={exportApi}>Export All (max. 5000 Rows)</ExcelExportButton>
                        </ToolbarActions>
                    </Toolbar>

                    <MainContent>
                        <Table
                            exportApis={[exportCurrentPageApi, exportApi]}
                            {...tableData}
                            columns={[
                                {
                                    name: "launch_date_local",
                                    header: "Launch Date",
                                    sortable: true,
                                    render: (row: Launch) => {
                                        return new Date(row.launch_date_local).toLocaleDateString();
                                    },
                                    headerExcel: "Launch Date (ISO)",
                                    renderExcel: (row: Launch) => {
                                        return new Date(row.launch_date_local).toISOString();
                                    },
                                },
                                {
                                    name: "mission_name",
                                    header: "Mission Name",
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
