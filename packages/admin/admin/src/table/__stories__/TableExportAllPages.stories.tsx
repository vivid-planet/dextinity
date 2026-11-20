import { gql } from "@apollo/client";
import { Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import type { Launch, LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { FillSpace } from "../../common/FillSpace";
import { MainContent } from "../../common/MainContent";
import { ToolbarActions } from "../../common/toolbar/actions/ToolbarActions";
import { ToolbarItem } from "../../common/toolbar/item/ToolbarItem";
import { Toolbar } from "../../common/toolbar/Toolbar";
import { useExportPagedTableQuery } from "../excelexport/useExportPagedTableQuery";
import { ExcelExportButton } from "../ExcelExportButton";
import { createRestStartLimitPagingActions } from "../paging/createRestStartLimitPagingActions";
import { Table } from "../Table";
import { TableQuery } from "../TableQuery";
import { useTableQuery } from "../useTableQuery";
import { useTableQueryPaging } from "../useTableQueryPaging";

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

const meta: Meta = {
    title: "components/table/TableExportAllPages",
};

export default meta;

type Story = StoryObj;

export const ExportAllPages: Story = {
    render: () => {
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

        const exportApi = useExportPagedTableQuery<IVariables>(api, {
            fromPage: 0,
            toPage: (tableData?.pagingInfo?.totalPages ?? 1) - 1,
            variablesForPage: (page) => {
                return {
                    offset: page * loadLimit,
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
    },
};
