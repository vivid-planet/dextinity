import { gql, useQuery } from "@apollo/client";
import { AutocompleteField, Table, TableFilterFinalForm, TableQuery, useTableQuery, useTableQueryFilter } from "@dextinity/admin";
import { Grid } from "@mui/material";

import type { LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { apolloStoryDecorator } from "../../apollo-story.decorator";

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

export default {
    title: "@dextinity/admin/table",
    decorators: [apolloStoryDecorator("/graphql")],
};

export const ResetFilter = () => {
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
};
