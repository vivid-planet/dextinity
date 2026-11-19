import { gql } from "@apollo/client";
import { Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import type { LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { MainContent } from "../../common/MainContent";
import { ToolbarItem } from "../../common/toolbar/item/ToolbarItem";
import { Toolbar } from "../../common/toolbar/Toolbar";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
import { Table } from "../Table";
import { TableFilterFinalForm } from "../TableFilterFinalForm";
import { TableQuery } from "../TableQuery";
import { useTableQuery } from "../useTableQuery";
import { useTableQueryFilter } from "../useTableQueryFilter";

const query = gql`
    query LaunchesPast($filter: LaunchesPastFilter) {
        launchesPastResult(filter: $filter) {
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
    query?: string;
}
interface IVariables {
    filter?: { mission_name: { contains: string } };
}

const meta: Meta = {
    title: "components/table/TableFilter",
};

export default meta;

type Story = StoryObj;

export const Filter: Story = {
    render: () => {
        const filterApi = useTableQueryFilter<IFilterValues>({});
        const { tableData, api, loading, error } = useTableQuery<IQueryData, IVariables>()(query, {
            variables: {
                filter: filterApi.current.query ? { mission_name: { contains: filterApi.current.query } } : undefined,
            },
            resolveTableData: (data) => ({
                data: data.launchesPastResult.data,
                totalCount: data.launchesPastResult.result.totalCount,
            }),
        });

        return (
            <TableQuery api={api} loading={loading} error={error}>
                <>
                    <Toolbar>
                        <ToolbarItem>
                            <Typography variant="h3">Filter</Typography>
                        </ToolbarItem>
                        <ToolbarItem>
                            <TableFilterFinalForm filterApi={filterApi}>
                                <Field name="query" type="text" component={FinalFormInput} fullWidth />
                            </TableFilterFinalForm>
                        </ToolbarItem>
                    </Toolbar>
                    {tableData && (
                        <MainContent>
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
                        </MainContent>
                    )}
                </>
            </TableQuery>
        );
    },
};
