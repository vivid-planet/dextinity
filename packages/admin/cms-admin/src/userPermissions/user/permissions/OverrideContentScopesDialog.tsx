import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    CancelButton,
    DataGridToolbar,
    Field,
    FillSpace,
    FinalForm,
    FinalFormSwitch,
    type GridColDef,
    GridToolbarQuickFilter,
    SaveButton,
} from "@dextinity/admin";
import {
    CircularProgress,
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { FormattedMessage } from "react-intl";

import type { ContentScope } from "../../../contentScope/Provider";
import { DataGrid } from "../../../dataGrid/DataGrid";
import { generateGridColumnsFromContentScopeProperties } from "./ContentScopeGrid";
import {
    type GQLOverrideContentScopesMutation,
    type GQLOverrideContentScopesMutationVariables,
    type GQLPermissionContentScopesQuery,
    type GQLPermissionContentScopesQueryVariables,
    namedOperations,
} from "./OverrideContentScopesDialog.generated";

interface FormSubmitData {
    overrideContentScopes: boolean;
    contentScopes: string[];
}
interface FormProps {
    permissionId: string;
    userId: string;
    handleDialogClose: () => void;
}

function OverrideContentScopesDialogGridToolbar() {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <FillSpace />
        </DataGridToolbar>
    );
}

export const OverrideContentScopesDialog = ({ permissionId, userId, handleDialogClose }: FormProps) => {
    const client = useApolloClient();

    const submit = async (data: FormSubmitData) => {
        await client.mutate<GQLOverrideContentScopesMutation, GQLOverrideContentScopesMutationVariables>({
            mutation: gql`
                mutation OverrideContentScopes($input: UserPermissionOverrideContentScopesInput!) {
                    userPermissionsUpdateOverrideContentScopes(input: $input) {
                        id
                    }
                }
            `,
            variables: {
                input: {
                    permissionId,
                    overrideContentScopes: data.overrideContentScopes,
                    contentScopes: data.contentScopes.map((contentScope) => JSON.parse(contentScope)),
                },
            },
            refetchQueries: [namedOperations.Query.PermissionContentScopes, "Permissions"],
        });
        handleDialogClose();
    };

    const { data, error } = useQuery<GQLPermissionContentScopesQuery, GQLPermissionContentScopesQueryVariables>(
        gql`
            query PermissionContentScopes($permissionId: ID!, $userId: String!) {
                availableContentScopes: userPermissionsAvailableContentScopes {
                    scope
                    label
                }
                permission: userPermissionsPermission(id: $permissionId, userId: $userId) {
                    source
                    overrideContentScopes
                    contentScopes
                }
            }
        `,
        {
            variables: { permissionId, userId },
        },
    );

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        return <CircularProgress />;
    }

    const initialValues: FormSubmitData = {
        overrideContentScopes: data.permission.overrideContentScopes,
        contentScopes: data.permission.contentScopes.map((v) => JSON.stringify(v)),
    };
    const disabled = data && data.permission.source === "BY_RULE";

    const columns: GridColDef<ContentScope>[] = generateGridColumnsFromContentScopeProperties(data.availableContentScopes);

    return (
        <Dialog maxWidth="lg" open={true}>
            <FinalForm<FormSubmitData>
                mode="edit"
                onSubmit={submit}
                initialValues={initialValues}
                render={({ values }) => (
                    <>
                        <DialogTitle>
                            <FormattedMessage id="dextinity.userPermissions.scopes" defaultMessage="Scopes" />
                        </DialogTitle>
                        <DialogContent>
                            <Field
                                name="overrideContentScopes"
                                label={
                                    <FormattedMessage
                                        id="dextinity.userPermissions.overrideScopes"
                                        defaultMessage="Permission-specific Content-Scopes"
                                    />
                                }
                                component={FinalFormSwitch}
                                type="checkbox"
                                disabled={disabled}
                            />
                            {values.overrideContentScopes && (
                                <Field<string[]> name="contentScopes" fullWidth>
                                    {(props) => {
                                        return (
                                            <DataGrid
                                                autoHeight={true}
                                                rows={(
                                                    data.availableContentScopes.filter(
                                                        (obj) => !Object.values(obj).every((value) => value === undefined),
                                                    ) ?? []
                                                ).map((obj) => obj.scope)}
                                                columns={columns}
                                                rowCount={data.availableContentScopes.length}
                                                loading={false}
                                                getRowHeight={() => "auto"}
                                                getRowId={(row) => JSON.stringify(row)}
                                                checkboxSelection={!disabled}
                                                rowSelectionModel={{ type: "include", ids: new Set(props.input.value) }}
                                                onRowSelectionModelChange={(selectionModel) => {
                                                    props.input.onChange(Array.from(selectionModel.ids).map((id) => String(id)));
                                                }}
                                                disableRowSelectionExcludeModel
                                                slots={{
                                                    toolbar: OverrideContentScopesDialogGridToolbar,
                                                }}
                                                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                                                showToolbar
                                            />
                                        );
                                    }}
                                </Field>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <CancelButton onClick={() => handleDialogClose()}>
                                <FormattedMessage id="dextinity.userPermissions.close" defaultMessage="Close" />
                            </CancelButton>
                            {!disabled && <SaveButton type="submit" />}
                        </DialogActions>
                    </>
                )}
            />
        </Dialog>
    );
};
