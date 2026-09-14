import { type DocumentNode, gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Button,
    CrudMoreActionsMenu,
    DataGridToolbar,
    type GridColDef,
    GridToolbarQuickFilter,
    MainContent,
    messages,
    RowActionsItem,
    RowActionsMenu,
    StackLink,
    ToolbarFillSpace,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Add, Block, Check, Delete, Edit } from "@dextinity/admin-icons";
import type { ContentScope } from "@dextinity/cms-admin";
import { IconButton } from "@mui/material";
import type { GridSlotsComponent } from "@mui/x-data-grid";
import type { ReactElement } from "react";
import { FormattedMessage, type IntlShape, useIntl } from "react-intl";

import { useContactImportFromCsv } from "../common/contactImport/useContactImportFromCsv";
import { DataGrid } from "../dataGrid/DataGrid";
import type { GQLEmailCampaignContentScopeInput } from "../graphql.generated";
import {
    type GQLBrevoContactsGridQuery,
    type GQLBrevoContactsGridQueryVariables,
    type GQLBrevoContactsListFragment,
    type GQLDeleteBrevoContactMutation,
    type GQLDeleteBrevoContactMutationVariables,
    type GQLUpdateBrevoContactMutation,
    type GQLUpdateBrevoContactMutationVariables,
    namedOperations,
} from "./BrevoContactsGrid.generated";

const brevoContactsFragment = gql`
    fragment BrevoContactsList on BrevoContact {
        id
        createdAt
        modifiedAt
        email
        emailBlacklisted
        smsBlacklisted
    }
`;

const deleteBrevoContactMutation = gql`
    mutation DeleteBrevoContact($id: Int!, $scope: EmailCampaignContentScopeInput!) {
        deleteBrevoContact(id: $id, scope: $scope)
    }
`;

const updateBrevoContactMutation = gql`
    mutation UpdateBrevoContact($id: Int!, $input: BrevoContactUpdateInput!, $scope: EmailCampaignContentScopeInput!) {
        updateBrevoContact(id: $id, input: $input, scope: $scope) {
            id
        }
    }
`;

type BrevoContactsGridToolbarProps = {
    intl: IntlShape;
    scope: GQLEmailCampaignContentScopeInput;
};

function BrevoContactsGridToolbar({ intl, scope }: BrevoContactsGridToolbarProps) {
    const [moreActionsMenuItem, contactImportComponent] = useContactImportFromCsv({
        scope,
        sendDoubleOptIn: true,
        refetchQueries: [namedOperations.Query.BrevoContactsGrid],
    });

    return (
        <>
            <DataGridToolbar>
                <FormattedMessage id="dextinity.brevoContact.title" defaultMessage="Contacts" />
                <GridToolbarQuickFilter
                    placeholder={intl.formatMessage({
                        id: "dextinity.brevoContact.searchEmail",
                        defaultMessage: "Search email address",
                    })}
                />
                <ToolbarFillSpace />
                <CrudMoreActionsMenu overallActions={[moreActionsMenuItem]} />
                <Button startIcon={<Add />} component={StackLink} pageName="add" payload="add" variant="primary">
                    <FormattedMessage id="dextinity.brevoContact.newContact" defaultMessage="New contact" />
                </Button>
            </DataGridToolbar>
            {contactImportComponent}
        </>
    );
}

export function BrevoContactsGrid({
    scope,
    additionalAttributesFragment,
    additionalGridFields = [],
}: {
    scope: ContentScope;
    additionalAttributesFragment?: { name: string; fragment: DocumentNode };
    additionalGridFields?: GridColDef[];
}): ReactElement {
    const brevoContactsQuery = gql`
        query BrevoContactsGrid($offset: Int!, $limit: Int!, $email: String, $scope: EmailCampaignContentScopeInput!) {
            brevoContacts(offset: $offset, limit: $limit, email: $email, scope: $scope) {
                nodes {
                    ...BrevoContactsList
                    ${additionalAttributesFragment ? "...".concat(additionalAttributesFragment?.name) : ""}
                }
                totalCount
            }
        }
        ${brevoContactsFragment}
        ${additionalAttributesFragment?.fragment ?? ""}
    `;
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("BrevoContactsGrid") };

    const columns: GridColDef<GQLBrevoContactsListFragment>[] = [
        {
            field: "createdAt",
            headerName: intl.formatMessage({ id: "dextinity.brevoContact.subscribedAt", defaultMessage: "Subscribed At" }),
            filterable: false,
            sortable: false,
            width: 150,
            renderCell: ({ row }) => intl.formatDate(new Date(row.createdAt)),
        },
        {
            field: "modifiedAt",
            headerName: intl.formatMessage({ id: "dextinity.brevoContact.modifiedAt", defaultMessage: "Modified At" }),
            filterable: false,
            sortable: false,
            width: 150,
            renderCell: ({ row }) => intl.formatDate(new Date(row.modifiedAt)),
        },
        {
            field: "email",
            headerName: intl.formatMessage({ id: "dextinity.brevoContact.email", defaultMessage: "Email" }),
            filterable: false,
            sortable: false,
            width: 150,
            flex: 1,
        },
        {
            field: "emailBlacklisted",
            headerName: intl.formatMessage({ id: "dextinity.brevoContact.emailBlocked", defaultMessage: "Email blocked" }),
            type: "boolean",
            filterable: false,
            sortable: false,
            width: 150,
        },
        ...additionalGridFields,
        {
            field: "actions",
            headerName: "",
            sortable: false,
            filterable: false,
            type: "actions",
            renderCell: (params) => {
                return (
                    <>
                        <IconButton component={StackLink} pageName="edit" payload={params.row.id.toString()}>
                            <Edit color="primary" />
                        </IconButton>
                        <RowActionsMenu>
                            <RowActionsMenu>
                                <RowActionsItem
                                    onClick={async () => {
                                        await client.mutate<GQLUpdateBrevoContactMutation, GQLUpdateBrevoContactMutationVariables>({
                                            mutation: updateBrevoContactMutation,
                                            variables: { id: params.row.id, input: { blocked: !params.row.emailBlacklisted }, scope },
                                            refetchQueries: [brevoContactsQuery],
                                        });
                                    }}
                                    icon={params.row.emailBlacklisted ? <Check /> : <Block />}
                                >
                                    {params.row.emailBlacklisted ? (
                                        <FormattedMessage id="dextinity.brevoContact.actions.unblock" defaultMessage="Unblock" />
                                    ) : (
                                        <FormattedMessage id="dextinity.brevoContact.actions.block" defaultMessage="Block" />
                                    )}
                                </RowActionsItem>

                                <RowActionsItem
                                    onClick={async () => {
                                        await client.mutate<GQLDeleteBrevoContactMutation, GQLDeleteBrevoContactMutationVariables>({
                                            mutation: deleteBrevoContactMutation,
                                            variables: { id: params.row.id, scope },
                                            refetchQueries: [brevoContactsQuery],
                                        });
                                    }}
                                    icon={<Delete />}
                                >
                                    <FormattedMessage {...messages.delete} />
                                </RowActionsItem>
                            </RowActionsMenu>
                        </RowActionsMenu>
                    </>
                );
            },
        },
    ];

    const { data, loading, error } = useQuery<GQLBrevoContactsGridQuery, GQLBrevoContactsGridQueryVariables>(brevoContactsQuery, {
        variables: {
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            email: dataGridProps.filterModel?.quickFilterValues ? dataGridProps.filterModel?.quickFilterValues[0] : undefined,
            scope,
        },
    });

    const rowCount = useBufferedRowCount(data?.brevoContacts.totalCount);
    if (error) {
        throw error;
    }
    const rows = data?.brevoContacts.nodes ?? [];

    return (
        <MainContent fullHeight>
            <DataGrid
                {...dataGridProps}
                disableRowSelectionOnClick
                rows={rows}
                rowCount={rowCount}
                columns={columns}
                loading={loading}
                slots={{
                    toolbar: BrevoContactsGridToolbar as GridSlotsComponent["toolbar"],
                }}
                slotProps={{
                    toolbar: {
                        intl,
                        scope,
                    } as BrevoContactsGridToolbarProps,
                }}
                showToolbar
            />
        </MainContent>
    );
}
