import { gql } from "@apollo/client";
import { Field, FinalForm, FinalFormInput, Selected, Table, TableQuery, useSelectionRoute, useTableQuery } from "@dextinity/admin";
import { Grid } from "@mui/material";

import type { LaunchesPastResult } from "../../../../.storybook/mocks/handlers";
import { apolloStoryDecorator } from "../../../apollo-story.decorator";
import { storyRouterDecorator } from "../../../story-router.decorator";

const launchFormFragment = gql`
    fragment LaunchForm on Launch {
        mission_name
        launch_date_local
    }
`;

interface LaunchFormFragment {
    mission_name: string;
    launch_date_local: Date;
}

const launchesQuery = gql`
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

interface LaunchesQueryData {
    launchesPastResult: LaunchesPastResult;
}

interface ExampleFormProps {
    launch: LaunchFormFragment;
    mode: "add" | "edit";
}

const ExampleForm = (props: ExampleFormProps) => {
    return (
        <FinalForm
            mode="edit"
            onSubmit={(values) => {
                // submit here
            }}
            initialValues={props.launch}
        >
            <Field label="Mission Name" name="mission_name" defaultOptions required component={FinalFormInput} />
            <Field label="Launch Date" name="launch_date_local" defaultOptions required component={FinalFormInput} />
        </FinalForm>
    );
};

export default {
    title: "Docs/Components/Table/Selection Table",
    decorators: [apolloStoryDecorator("/graphql"), storyRouterDecorator()],
};

export const SelectionTable = () => {
    // step 1
    const [SelectionRoute, selection, selectionApi] = useSelectionRoute();
    const { tableData, api, loading, error } = useTableQuery<LaunchesQueryData, never>()(launchesQuery, {
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
            {/* step 2 */}
            <TableQuery api={api} loading={loading} error={error}>
                <Grid container spacing={4}>
                    <Grid>
                        <Table
                            {...tableData}
                            // step 3
                            selectionApi={selectionApi}
                            selectedId={selection.id}
                            selectable={true}
                            columns={[
                                {
                                    name: "mission_name",
                                    header: "Mission Name",
                                },
                            ]}
                        />
                    </Grid>
                    <Grid size={4}>
                        {/* step 4 */}
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
        </SelectionRoute>
    );
};
