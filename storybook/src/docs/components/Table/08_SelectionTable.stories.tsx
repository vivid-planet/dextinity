import { gql } from "@apollo/client";
import { Field, FinalForm, FinalFormInput, Selected, Table, TableQuery, useSelectionRoute, useTableQuery } from "@dextinity/admin";
import { Grid } from "@mui/material";

import { apolloRestStoryDecorator } from "../../../apollo-rest-story.decorator";
import { storyRouterDecorator } from "../../../story-router.decorator";

const gqlRest = gql;

const usersQuery = gqlRest`
query users {
    users @rest(type: "User", path: "users") {
        id
        name
        username
        email
    }
}
`;

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
}

interface UserQueryData {
    users: User[];
}

interface ExampleFormProps {
    user: User;
    mode: "add" | "edit";
}

const ExampleForm = (props: ExampleFormProps) => {
    return (
        <FinalForm
            mode="edit"
            onSubmit={(values) => {
                // submit here
            }}
            initialValues={props.user}
        >
            <Field label="Name" name="name" defaultOptions required component={FinalFormInput} />
            <Field label="Username" name="username" defaultOptions required component={FinalFormInput} />
            <Field label="E-Mail" name="email" defaultOptions required component={FinalFormInput} />
        </FinalForm>
    );
};

export default {
    title: "Docs/Components/Table/Selection Table",
    decorators: [apolloRestStoryDecorator(), storyRouterDecorator()],
};

export const SelectionTable = () => {
    // step 1
    const [SelectionRoute, selection, selectionApi] = useSelectionRoute();
    const { tableData, api, loading, error } = useTableQuery<UserQueryData, never>()(usersQuery, {
        resolveTableData: (data) => ({
            data: data.users,
            totalCount: data.users.length,
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
                                    name: "name",
                                    header: "Name",
                                },
                            ]}
                        />
                    </Grid>
                    <Grid size={4}>
                        {/* step 4 */}
                        <Selected selectionMode={selection.mode} selectedId={selection.id} rows={tableData.data}>
                            {(user, { selectionMode: selectedSelectionMode }) => {
                                if (user === undefined) {
                                    return null;
                                }

                                return <ExampleForm mode={selectedSelectionMode} user={user} />;
                            }}
                        </Selected>
                    </Grid>
                </Grid>
            </TableQuery>
        </SelectionRoute>
    );
};
