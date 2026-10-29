import { gql } from "@apollo/client";
import {
    Field,
    FinalFormInput,
    MainContent,
    Table,
    TableFilterFinalForm,
    TableQuery,
    Toolbar,
    ToolbarItem,
    useTableQuery,
    useTableQueryFilter,
} from "@dextinity/admin";
import { Typography } from "@mui/material";

import type { LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { apolloStoryDecorator } from "../../apollo-story.decorator";

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

export default {
    title: "@dextinity/admin/table",
    decorators: [apolloStoryDecorator("/graphql")],
};

export const Filter = () => {
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
};
