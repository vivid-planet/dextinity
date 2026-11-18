import { gql } from "@apollo/client";
import { Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import type { Launch, LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { FillSpace } from "../../common/FillSpace";
import { MainContent } from "../../common/MainContent";
import { ToolbarActions } from "../../common/toolbar/actions/ToolbarActions";
import { ToolbarItem } from "../../common/toolbar/item/ToolbarItem";
import { Toolbar } from "../../common/toolbar/Toolbar";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
import { useExportDisplayedTableData } from "../excelexport/useExportDisplayedTableData";
import { useExportTableQuery } from "../excelexport/useExportTableQuery";
import { ExcelExportButton } from "../ExcelExportButton";
import { createRestStartLimitPagingActions } from "../paging/createRestStartLimitPagingActions";
import { Table, VisibleType } from "../Table";
import { TableFilterFinalForm } from "../TableFilterFinalForm";
import { TableQuery } from "../TableQuery";
import { useTableQuery } from "../useTableQuery";
import { useTableQueryFilter } from "../useTableQueryFilter";
import { useTableQueryPaging } from "../useTableQueryPaging";

const query = gql`
    query LaunchesPast($offset: Int, $limit: Int, $filter: LaunchesPastFilter) {
        launchesPastResult(offset: $offset, limit: $limit, filter: $filter) {
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

interface IFilterValues {
    query: string;
}
interface IVariables {
    offset: number;
    limit: number;
    filter?: { mission_name: { contains: string } };
}

const meta: Meta = {
    title: "components/table/TableExportWithLimitFilter",
};

export default meta;

type Story = StoryObj;

export const ExportWithLimitFilter: Story = {
    render: () => {
        const loadLimit = 10;
        const pagingApi = useTableQueryPaging(0);

        const filterApi = useTableQueryFilter<IFilterValues>({ query: "" });
        const filter = filterApi.current.query ? { mission_name: { contains: filterApi.current.query } } : undefined;

        const { tableData, api, loading, error } = useTableQuery<IQueryData, IVariables>()(query, {
            variables: {
                offset: pagingApi.current,
                limit: loadLimit,
                filter,
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

        const exportCurrentPageApi = useExportDisplayedTableData();
        const exportApi = useExportTableQuery<IVariables>(api, { filter, offset: 0, limit: 5000 });

        return (
            <TableQuery api={api} loading={loading} error={error}>
                <>
                    <Toolbar>
                        <ToolbarItem>
                            <Typography variant="h3">Export Visibility With LimitFilter</Typography>
                        </ToolbarItem>
                        <ToolbarItem>
                            <TableFilterFinalForm filterApi={filterApi}>
                                <Field name="query" type="text" component={FinalFormInput} fullWidth />
                            </TableFilterFinalForm>
                        </ToolbarItem>
                        <FillSpace />
                        <ToolbarActions>
                            <ExcelExportButton exportApi={exportCurrentPageApi}>Aktuelle Seite exportieren</ExcelExportButton>
                            <ExcelExportButton exportApi={exportApi}>Export All (max. 5000 Rows)</ExcelExportButton>
                        </ToolbarActions>
                    </Toolbar>
                    <MainContent>
                        {tableData && (
                            <Table
                                exportApis={[exportCurrentPageApi, exportApi]}
                                {...tableData}
                                columns={[
                                    {
                                        name: "launch_date_local",
                                        header: "Launch Date",
                                        sortable: true,
                                        visible: { [VisibleType.Browser]: false, [VisibleType.Export]: false },
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
                                        visible: { [VisibleType.Browser]: true },
                                        header: "Mission Name",
                                        sortable: true,
                                    },
                                ]}
                            />
                        )}
                    </MainContent>
                </>
            </TableQuery>
        );
    },
};
