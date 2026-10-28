import { gql } from "@apollo/client";
import {
    Field,
    FinalForm,
    FinalFormInput,
    type ISelectionApi,
    Selected,
    Table,
    TableQuery,
    useSelectionRoute,
    useTableQuery,
} from "@dextinity/admin";
import { Grid } from "@mui/material";
import { Redirect, Route, Switch, useLocation } from "react-router";

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
    const [Selection, selection, selectionApi] = useSelectionRoute();
    const { tableData, api, loading, error } = useTableQuery<IQueryData, Record<string, any>>()(query, {
        resolveTableData: (data) => ({
            data: data.launchesPastResult.data,
            totalCount: data.launchesPastResult.result.totalCount,
        }),
    });

    const location = useLocation();

    if (!tableData) {
        return null;
    }

    return (
        <Selection>
            <div>URL: {location.pathname}</div>
            <TableQuery api={api} loading={loading} error={error}>
                <Grid container spacing={4}>
                    <Grid size={2}>
                        <ExampleTable tableData={tableData} selectedId={selection.id} selectionApi={selectionApi} />
                    </Grid>
                    <Grid size={2}>
                        <Selected selectionMode={selection.mode} selectedId={selection.id} rows={tableData.data}>
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
        </Selection>
    );
}

export default {
    title: "@dextinity/admin/table",
    decorators: [apolloStoryDecorator("/graphql"), storyRouterDecorator()],
};

export const BesidesFormSelectionHooks = () => {
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
