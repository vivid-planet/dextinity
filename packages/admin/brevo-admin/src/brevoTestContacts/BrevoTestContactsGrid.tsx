import { type DocumentNode, gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Alert,
    Button,
    DataGridToolbar,
    type GridColDef,
    GridToolbarQuickFilter,
    MainContent,
    messages,
    RowActionsItem,
    RowActionsMenu,
    StackLink,
    ToolbarFillSpace,
    ToolbarTitleItem,
    Tooltip,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Add, Delete, Edit } from "@dextinity/admin-icons";
import type { ContentScope } from "@dextinity/cms-admin";
import { Box, IconButton } from "@mui/material";
import type { GridSlotsComponent } from "@mui/x-data-grid";
import type { ReactElement } from "react";
import { FormattedMessage, type IntlShape, useIntl } from "react-intl";

import { DataGrid } from "../dataGrid/DataGrid";
import type {
    GQLBrevoContactsListFragment,
    GQLBrevoTestContactsGridQuery,
    GQLBrevoTestContactsGridQueryVariables,
    GQLDeleteBrevoTestContactMutation,
    GQLDeleteBrevoTestContactMutationVariables,
} from "./BrevoTestContactsGrid.generated";

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

const deleteBrevoTestContactMutation = gql`
    mutation DeleteBrevoTestContact($id: Int!, $scope: EmailCampaignContentScopeInput!) {
        deleteBrevoTestContact(id: $id, scope: $scope)
    }
`;

type BrevoTestContactsGridToolbarProps = {
    intl: IntlShape;
    totalCount: number;
};

function BrevoTestContactsGridToolbar({ intl, totalCount }: BrevoTestContactsGridToolbarProps) {
    const disableButton = totalCount >= 100;
    const tooltipMessage = intl.formatMessage({
        id: "dextinity.brevoTestContact.contactLimitReached",
        defaultMessage: "Contact limit of 100 reached. You cannot add more contacts.",
    });
    return (
        <DataGridToolbar>
            <ToolbarTitleItem>
                <FormattedMessage id="dextinity.brevoTestContact.title" defaultMessage="Test contacts" />
            </ToolbarTitleItem>
            <GridToolbarQuickFilter
                placeholder={intl.formatMessage({
                    id: "dextinity.brevoTestContact.searchEmail",
                    defaultMessage: "Search email address",
                })}
            />
            <ToolbarFillSpace />
            <Tooltip title={disableButton ? tooltipMessage : ""}>
                <span>
                    <Button startIcon={<Add />} component={StackLink} pageName="add" payload="add" variant="primary" disabled={disableButton}>
                        <FormattedMessage id="dextinity.brevoTestContact.newContact" defaultMessage="New test contact" />
                    </Button>
                </span>
            </Tooltip>
        </DataGridToolbar>
    );
}

export function BrevoTestContactsGrid({
    scope,
    additionalAttributesFragment,
    additionalGridFields = [],
}: {
    scope: ContentScope;
    additionalAttributesFragment?: { name: string; fragment: DocumentNode };
    additionalGridFields?: GridColDef[];
}): ReactElement {
    const brevoTestContactsQuery = gql`
        query BrevoTestContactsGrid($offset: Int, $limit: Int, $email: String, $scope: EmailCampaignContentScopeInput!) {
            brevoTestContacts(offset: $offset, limit: $limit, email: $email, scope: $scope) {
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
            headerName: intl.formatMessage({ id: "dextinity.brevoTestContact.subscribedAt", defaultMessage: "Subscribed At" }),
            filterable: false,
            sortable: false,
            width: 150,
            renderCell: ({ row }) => intl.formatDate(new Date(row.createdAt)),
        },
        {
            field: "modifiedAt",
            headerName: intl.formatMessage({ id: "dextinity.brevoTestContact.modifiedAt", defaultMessage: "Modified At" }),
            filterable: false,
            sortable: false,
            width: 150,
            renderCell: ({ row }) => intl.formatDate(new Date(row.modifiedAt)),
        },
        {
            field: "email",
            headerName: intl.formatMessage({ id: "dextinity.brevoTestContact.email", defaultMessage: "Email" }),
            filterable: false,
            sortable: false,
            width: 150,
            flex: 1,
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
                                        await client.mutate<GQLDeleteBrevoTestContactMutation, GQLDeleteBrevoTestContactMutationVariables>({
                                            mutation: deleteBrevoTestContactMutation,
                                            variables: { id: params.row.id, scope },
                                            refetchQueries: [brevoTestContactsQuery],
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

    const { data, loading, error } = useQuery<GQLBrevoTestContactsGridQuery, GQLBrevoTestContactsGridQueryVariables>(brevoTestContactsQuery, {
        variables: {
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            email: dataGridProps.filterModel?.quickFilterValues ? dataGridProps.filterModel?.quickFilterValues[0] : undefined,
            scope,
        },
    });

    const rowCount = useBufferedRowCount(data?.brevoTestContacts.totalCount);
    if (error) {
        throw error;
    }
    const rows = data?.brevoTestContacts.nodes ?? [];
    const totalCount = data?.brevoTestContacts.totalCount || 0;

    return (
        <MainContent fullHeight>
            <Box sx={{ marginBottom: 4 }}>
                <Alert severity="warning">
                    <FormattedMessage
                        id="dextinity.brevoTestContact.testContactAlert"
                        defaultMessage="Contacts in this list are only added for testing purposes. Users do not get a double-opt in to confirm their subscription."
                    />
                </Alert>
            </Box>
            <DataGrid
                {...dataGridProps}
                disableRowSelectionOnClick
                rows={rows}
                rowCount={rowCount}
                columns={columns}
                loading={loading}
                slots={{
                    toolbar: BrevoTestContactsGridToolbar as GridSlotsComponent["toolbar"],
                }}
                slotProps={{
                    toolbar: {
                        intl,
                        scope,
                        totalCount,
                    } as BrevoTestContactsGridToolbarProps,
                }}
                showToolbar
            />
        </MainContent>
    );
}
