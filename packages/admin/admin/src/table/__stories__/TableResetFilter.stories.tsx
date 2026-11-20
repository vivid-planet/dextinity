import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Grid } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import type { LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { AutocompleteField } from "../../form/fields/AutocompleteField";
import { Table } from "../Table";
import { TableFilterFinalForm } from "../TableFilterFinalForm";
import { TableQuery } from "../TableQuery";
import { useTableQuery } from "../useTableQuery";
import { useTableQueryFilter } from "../useTableQueryFilter";

const query = gql`
    query LaunchesPast($filter: LaunchesPastFilter, $limit: Int, $offset: Int) {
        launchesPastResult(filter: $filter, limit: $limit, offset: $offset) {
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
    missionName?: { label: string; value: string };
}
interface IVariables {
    filter?: { mission_name: { equal: string } };
    limit?: number;
    offset?: number;
}

const meta: Meta = {
    title: "components/table/TableResetFilter",
};

export default meta;

type Story = StoryObj;

export const ResetFilter: Story = {
    render: () => {
        const filterApi = useTableQueryFilter<IFilterValues>({});
        const { data: optionsData } = useQuery<IQueryData, IVariables>(query, { variables: { limit: 3, offset: 0 } });
        const { tableData, api, loading, error } = useTableQuery<IQueryData, IVariables>()(query, {
            variables: {
                filter: filterApi.current.missionName ? { mission_name: { equal: filterApi.current.missionName.value } } : undefined,
            },
            resolveTableData: (data) => ({
                data: data.launchesPastResult.data,
                totalCount: data.launchesPastResult.result.totalCount,
            }),
        });

        return (
            <TableQuery api={api} loading={loading} error={error}>
                {tableData && (
                    <>
                        <TableFilterFinalForm filterApi={filterApi} resetButton>
                            <Grid container>
                                <Grid size={2}>
                                    <AutocompleteField
                                        name="missionName"
                                        options={
                                            optionsData?.launchesPastResult.data.map((launch) => ({
                                                label: launch.mission_name,
                                                value: launch.mission_name,
                                            })) ?? []
                                        }
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </TableFilterFinalForm>
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
                    </>
                )}
            </TableQuery>
        );
    },
};
