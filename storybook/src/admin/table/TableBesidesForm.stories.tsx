import { gql } from "@apollo/client";
import { Field, FinalForm, FinalFormInput, type ISelectionApi, Selected, SelectionRoute, Table, TableQuery, useTableQuery } from "@dextinity/admin";
import { Grid } from "@mui/material";
import { Redirect, Route, Switch } from "react-router";

import type { Launch, LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { apolloStoryDecorator } from "../../apollo-story.decorator";
import { storyRouterDecorator } from "../../story-router.decorator";

const query = gql`
    query LaunchesPast {
        launchesPastResult {
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

interface IExampleTableProps {
    tableData: {
        data: Launch[];
        totalCount: number;
    };
    selectionApi: ISelectionApi;
    selectedId?: string;
}
function ExampleTable(props: IExampleTableProps) {
    return (
        <Table
            {...props.tableData}
            selectionApi={props.selectionApi}
            selectedId={props.selectedId}
            selectable={true}
            columns={[
                {
                    name: "mission_name",
                    header: "Mission Name",
                },
            ]}
        />
    );
}

interface IExampleFormProps {
    launch: Launch;
    mode: "add" | "edit";
}
function ExampleForm(props: IExampleFormProps) {
    return (
        <FinalForm
            mode="edit"
            onSubmit={(values) => {
                // submit here
            }}
            initialValues={props.launch}
        >
            <Field label="Mission Name" name="mission_name" defaultOptions required component={FinalFormInput} />
        </FinalForm>
    );
}

function Story() {
    const { tableData, api, loading, error } = useTableQuery<IQueryData, Record<string, any>>()(query, {
        resolveTableData: (data) => ({
            data: data.launchesPastResult.data,
            totalCount: data.launchesPastResult.result.totalCount,
        }),
    });

    if (!tableData) {
        return null;
    }

    return (
        <SelectionRoute>
            {({ selectedId, selectionMode, selectionApi }) => (
                <TableQuery api={api} loading={loading} error={error}>
                    <Grid container spacing={4}>
                        <Grid size={2}>
                            <ExampleTable tableData={tableData} selectedId={selectedId} selectionApi={selectionApi} />
                        </Grid>
                        <Grid size={2}>
                            <Selected selectionMode={selectionMode} selectedId={selectedId} rows={tableData.data}>
                                {(launch, { selectionMode: selectedSelectionMode }) => {
                                    if (launch === undefined) {
                                        return null;
                                    }

                                    return <ExampleForm mode={selectedSelectionMode} launch={launch} />;
                                }}
                            </Selected>
                        </Grid>
                    </Grid>
                </TableQuery>
            )}
        </SelectionRoute>
    );
}

export default {
    title: "@dextinity/admin/table",
    decorators: [apolloStoryDecorator("/graphql"), storyRouterDecorator()],
};

export const BesidesForm = () => {
    return (
        <Switch>
            <Route exact path="/">
                <Redirect to="/foo" />
            </Route>
            <Route path="/foo">
                <Story />
            </Route>
        </Switch>
    );
};
