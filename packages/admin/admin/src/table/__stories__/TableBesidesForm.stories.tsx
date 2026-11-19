import { gql } from "@apollo/client";
import { Grid } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Redirect, Route, Switch } from "react-router";

import type { Launch, LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
import { Selected } from "../../Selected";
import type { ISelectionApi } from "../../SelectionApi";
import { SelectionRoute } from "../../SelectionRoute";
import { Table } from "../Table";
import { TableQuery } from "../TableQuery";
import { useTableQuery } from "../useTableQuery";

const launchFormFragment = gql`
    fragment LaunchForm on Launch {
        mission_name
    }
`;

interface ILaunchFormFragment {
    mission_name: string;
}

const query = gql`
    query LaunchesPast {
        launchesPastResult {
            data {
                id
                mission_name
                launch_date_local
                ...LaunchForm
            }
            result {
                totalCount
            }
        }
    }
    ${launchFormFragment}
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
    launch: ILaunchFormFragment;
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

function Example() {
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

const meta: Meta = {
    title: "components/table/TableBesidesForm",
};

export default meta;

type Story = StoryObj;

export const BesidesForm: Story = {
    render: () => {
        return (
            <Switch>
                <Route exact path="/">
                    <Redirect to="/foo" />
                </Route>
                <Route path="/foo">
                    <Example />
                </Route>
            </Switch>
        );
    },
};
