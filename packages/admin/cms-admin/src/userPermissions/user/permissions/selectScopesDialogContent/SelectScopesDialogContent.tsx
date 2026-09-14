import { gql, useApolloClient, useQuery } from "@apollo/client";
import { DataGridToolbar, Field, FillSpace, FinalForm, type GridColDef, GridToolbarQuickFilter, Loading, useFormApiRef } from "@dextinity/admin";
import isEqual from "lodash.isequal";
import type { FunctionComponent, PropsWithChildren } from "react";

import { DataGrid } from "../../../../dataGrid/DataGrid";
import { generateGridColumnsFromContentScopeProperties } from "../ContentScopeGrid";
import type { GQLContentScopesQuery } from "../ContentScopeGrid.generated";
import type {
    GQLAvailableContentScopesQuery,
    GQLUpdateContentScopesMutation,
    GQLUpdateContentScopesMutationVariables,
} from "./SelectScopesDialogContent.generated";

interface SelectScopesDialogContentProps {
    userId: string;
    userContentScopes: GQLContentScopesQuery["userContentScopes"];
    userContentScopesSkipManual: GQLContentScopesQuery["userContentScopesSkipManual"];
}

type FormValues = {
    contentScopes: string[];
};

type ContentScope = {
    [key: string]: string;
};

function SelectScopesDialogContentGridToolbar() {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <FillSpace />
        </DataGridToolbar>
    );
}

export const SelectScopesDialogContent: FunctionComponent<PropsWithChildren<SelectScopesDialogContentProps>> = ({
    userId,
    userContentScopes,
    userContentScopesSkipManual,
}) => {
    const client = useApolloClient();
    const formApiRef = useFormApiRef<FormValues>();

    const { data, error } = useQuery<GQLAvailableContentScopesQuery>(gql`
        query AvailableContentScopes {
            availableContentScopes: userPermissionsAvailableContentScopes {
                scope
                label
            }
        }
    `);

    const submit = async (values: FormValues) => {
        await client.mutate<GQLUpdateContentScopesMutation, GQLUpdateContentScopesMutationVariables>({
            mutation: gql`
                mutation UpdateContentScopes($userId: String!, $input: UserContentScopesInput!) {
                    userPermissionsUpdateContentScopes(userId: $userId, input: $input)
                }
            `,
            variables: {
                userId,
                input: {
                    contentScopes: values.contentScopes.map((contentScope) => JSON.parse(contentScope)),
                },
            },
            refetchQueries: ["ContentScopes"],
        });
    };

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        return <Loading />;
    }

    const columns: GridColDef<ContentScope>[] = generateGridColumnsFromContentScopeProperties(data.availableContentScopes);

    return (
        <FinalForm<FormValues>
            apiRef={formApiRef}
            subscription={{ values: true }}
            mode="edit"
            onSubmit={submit}
            onAfterSubmit={() => null}
            initialValues={{
                contentScopes: userContentScopes.map((cs) => JSON.stringify(cs)),
            }}
        >
            <Field<string[]> name="contentScopes" fullWidth>
                {(props) => {
                    return (
                        <DataGrid
                            autoHeight={true}
                            rows={data.availableContentScopes
                                .filter((obj) => !Object.values(obj).every((value) => value === undefined))
                                .map((obj) => obj.scope)}
                            columns={columns}
                            rowCount={data.availableContentScopes.length}
                            loading={false}
                            getRowHeight={() => "auto"}
                            getRowId={(row) => JSON.stringify(row)}
                            isRowSelectable={(params) => {
                                return !userContentScopesSkipManual.some((cs: ContentScope) => isEqual(cs, params.row));
                            }}
                            checkboxSelection
                            rowSelectionModel={{ type: "include", ids: new Set(props.input.value) }}
                            onRowSelectionModelChange={(selectionModel) => {
                                props.input.onChange(Array.from(selectionModel.ids).map((id) => String(id)));
                            }}
                            disableRowSelectionExcludeModel
                            slots={{
                                toolbar: SelectScopesDialogContentGridToolbar,
                            }}
                            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                            showToolbar
                        />
                    );
                }}
            </Field>
        </FinalForm>
    );
};
