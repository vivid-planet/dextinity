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

import { apolloRestStoryDecorator } from "../../apollo-rest-story.decorator";
import { storyRouterDecorator } from "../../story-router.decorator";

const gqlRest = gql;

const query = gqlRest`
query users {
    users @rest(type: "User", path: "users") {
        id
        name
        username
        email
    }
}
`;

interface IUser {
    id: number;
    name: string;
    username: string;
    email: string;
}
interface IQueryData {
    users: IUser[];
}

interface IExampleTableProps {
    tableData: {
        data: IQueryData["users"];
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
                    name: "name",
                    header: "Name",
                },
            ]}
        />
    );
}

interface IExampleFormProps {
    user: IUser;
    mode: "add" | "edit";
}
function ExampleForm(props: IExampleFormProps) {
    return (
        <FinalForm
            mode="edit"
            onSubmit={(values) => {
                // submit here
            }}
            initialValues={props.user}
        >
            <Field label="Name" name="name" defaultOptions required component={FinalFormInput} />
        </FinalForm>
    );
}

function Story() {
    const [Selection, selection, selectionApi] = useSelectionRoute();
    const { tableData, api, loading, error } = useTableQuery<IQueryData, Record<string, any>>()(query, {
        resolveTableData: (data) => ({
            data: data.users,
            totalCount: data.users.length,
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
        </Selection>
    );
}

export default {
    title: "@dextinity/admin/table",
    decorators: [apolloRestStoryDecorator(), storyRouterDecorator()],
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
