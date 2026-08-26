import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Button,
    CrudContextMenu,
    DataGridToolbar,
    downloadFile,
    type GridColDef,
    GridFilterButton,
    GridToolbarQuickFilter,
    MainContent,
    muiGridFilterToGql,
    muiGridSortToGql,
    StackLink,
    ToolbarAutomaticTitleItem,
    ToolbarFillSpace,
    useBufferedRowCount,
    useDataGridRemote,
    useEditDialog,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Add as AddIcon, Download, Edit } from "@dextinity/admin-icons";
import type { ContentScope } from "@dextinity/cms-admin";
import { DialogContent, IconButton } from "@mui/material";
import type { DocumentNode } from "graphql";
import type { ReactElement } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { DataGrid } from "../dataGrid/DataGrid";
import { TargetGroupDialog } from "./TargetGroupDialog";
import type {
    GQLCreateTargetGroupMutation,
    GQLCreateTargetGroupMutationVariables,
    GQLDeleteTargetGroupMutation,
    GQLDeleteTargetGroupMutationVariables,
    GQLTargetGroupContactItemFragment,
    GQLTargetGroupContactsQuery,
    GQLTargetGroupContactsQueryVariables,
    GQLTargetGroupsGridQuery,
    GQLTargetGroupsGridQueryVariables,
    GQLTargetGroupsListFragment,
} from "./TargetGroupsGrid.generated";

export type AdditionalContactAttributesType = Record<string, unknown>;

type ContactWithAdditionalAttributes = GQLTargetGroupContactItemFragment & AdditionalContactAttributesType;

const targetGroupsFragment = gql`
    fragment TargetGroupsList on BrevoTargetGroup {
        id
        title
        totalSubscribers
        isMainList
    }
`;

const targetGroupContactItemFragment = gql`
    fragment TargetGroupContactItem on BrevoContact {
        id
        email
        emailBlacklisted
        smsBlacklisted
    }
`;

const targetGroupsQuery = gql`
    query TargetGroupsGrid(
        $offset: Int
        $limit: Int
        $sort: [TargetGroupSort!]
        $search: String
        $filter: TargetGroupFilter
        $scope: EmailCampaignContentScopeInput!
    ) {
        brevoTargetGroups(offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter, scope: $scope) {
            nodes {
                ...TargetGroupsList
            }
            totalCount
        }
    }
    ${targetGroupsFragment}
`;

const deleteTargetGroupMutation = gql`
    mutation DeleteTargetGroup($id: ID!) {
        deleteBrevoTargetGroup(id: $id)
    }
`;

const createTargetGroupMutation = gql`
    mutation CreateTargetGroup($scope: EmailCampaignContentScopeInput!, $input: TargetGroupInput!) {
        createBrevoTargetGroup(scope: $scope, input: $input) {
            id
        }
    }
`;

export function TargetGroupsGrid({
    scope,
    exportTargetGroupOptions,
}: {
    scope: ContentScope;
    exportTargetGroupOptions?: {
        additionalAttributesFragment: { name: string; fragment: DocumentNode };
        exportFields: { renderValue: (row: AdditionalContactAttributesType) => string; headerName: string }[];
    };
}): ReactElement {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("TargetGroupsGrid") };
    const [EditDialog, , editDialogApi] = useEditDialog();

    function TargetGroupsGridToolbar() {
        return (
            <DataGridToolbar>
                <ToolbarAutomaticTitleItem />
                <GridToolbarQuickFilter />
                <GridFilterButton />
                <ToolbarFillSpace />
                <Button
                    startIcon={<AddIcon />}
                    variant="primary"
                    onClick={() => {
                        editDialogApi.openAddDialog();
                    }}
                >
                    <FormattedMessage id="dextinity.targetGroup.newTargetGroup" defaultMessage="New target group" />
                </Button>
            </DataGridToolbar>
        );
    }

    const targetGroupContactsQuery = gql`
        query TargetGroupContacts($targetGroupId: ID!, $offset: Int!, $limit: Int!, $scope: EmailCampaignContentScopeInput!) {
            brevoContacts(targetGroupId: $targetGroupId, offset: $offset, limit: $limit, scope: $scope) {               
                 nodes {
                    ...TargetGroupContactItem
                    ${
                        exportTargetGroupOptions?.additionalAttributesFragment
                            ? "...".concat(exportTargetGroupOptions.additionalAttributesFragment?.name)
                            : ""
                    }
                }
                totalCount
            }
        }
        ${targetGroupContactItemFragment}
        ${exportTargetGroupOptions?.additionalAttributesFragment?.fragment ?? ""}
    `;

    const convertToCsv = (data: ContactWithAdditionalAttributes[]) => {
        const header = [
            intl.formatMessage({ id: "dextinity.targetGroup.export.brevoId", defaultMessage: "Brevo ID" }),
            intl.formatMessage({ id: "dextinity.targetGroup.export.email", defaultMessage: "Email" }),
            intl.formatMessage({ id: "dextinity.targetGroup.export.emailBlacklisted", defaultMessage: "Email blacklisted" }),
            intl.formatMessage({ id: "dextinity.targetGroup.export.smsBlacklisted", defaultMessage: "Sms blacklisted" }),
        ].concat(exportTargetGroupOptions?.exportFields.map((field) => field?.headerName ?? "") ?? []);

        const csvData = data.map((contact) => [
            `="${contact.id}"`,
            contact.email,
            contact.emailBlacklisted,
            contact.smsBlacklisted,
            exportTargetGroupOptions?.exportFields.map((field) => field.renderValue(contact)),
        ]);

        csvData.unshift(header);

        return csvData.map((row) => row.join(",")).join("\n");
    };

    async function downloadTargetGroupContactsExportFile({ id, title }: { id: string; title: string }) {
        let offset = 0;
        let shouldContinue = true;
        let allContacts: ContactWithAdditionalAttributes[] = [];

        while (shouldContinue) {
            const { data: newContactsData } = await client.query<GQLTargetGroupContactsQuery, GQLTargetGroupContactsQueryVariables>({
                query: targetGroupContactsQuery,
                variables: {
                    targetGroupId: id,
                    offset: offset,
                    limit: 100,
                    scope,
                },
            });

            allContacts = allContacts.concat(newContactsData.brevoContacts.nodes as ContactWithAdditionalAttributes[]);
            shouldContinue = allContacts.length < newContactsData.brevoContacts.totalCount;
            offset += 100;
        }

        const csvData = convertToCsv(allContacts);
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

        downloadFile(blob, `${title}.csv`);
    }

    const columns: GridColDef<GQLTargetGroupsListFragment>[] = [
        { field: "title", headerName: intl.formatMessage({ id: "dextinity.targetGroup.title", defaultMessage: "Title" }), flex: 1 },
        {
            field: "totalSubscribers",
            headerName: intl.formatMessage({ id: "dextinity.targetGroup.totalSubscribers", defaultMessage: "Total subscribers" }),
            type: "number",
            filterable: false,
            sortable: false,
            width: 200,
        },
        {
            field: "actions",
            headerName: "",
            sortable: false,
            filterable: false,
            type: "actions",
            renderCell: ({ row }) => {
                if (row.isMainList) {
                    return;
                }
                return (
                    <>
                        <IconButton component={StackLink} pageName="edit" payload={row.id}>
                            <Edit color="primary" />
                        </IconButton>
                        <IconButton onClick={() => downloadTargetGroupContactsExportFile({ id: row.id, title: row.title })}>
                            <Download color="primary" />
                        </IconButton>
                        <CrudContextMenu
                            copyData={() => {
                                return {
                                    title: row.title,
                                };
                            }}
                            onPaste={async ({ input }) => {
                                await client.mutate<GQLCreateTargetGroupMutation, GQLCreateTargetGroupMutationVariables>({
                                    mutation: createTargetGroupMutation,
                                    variables: { scope, input },
                                });
                            }}
                            onDelete={async () => {
                                await client.mutate<GQLDeleteTargetGroupMutation, GQLDeleteTargetGroupMutationVariables>({
                                    mutation: deleteTargetGroupMutation,
                                    variables: { id: row.id },
                                });
                            }}
                            refetchQueries={[targetGroupsQuery]}
                        />
                    </>
                );
            },
        },
    ];

    const { filter: gqlFilter, search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);

    const { data, loading, error } = useQuery<GQLTargetGroupsGridQuery, GQLTargetGroupsGridQueryVariables>(targetGroupsQuery, {
        variables: {
            scope,
            filter: gqlFilter,
            search: gqlSearch,
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            sort: muiGridSortToGql(dataGridProps.sortModel),
        },
    });
    const rowCount = useBufferedRowCount(data?.brevoTargetGroups.totalCount);
    if (error) {
        throw error;
    }
    const rows = data?.brevoTargetGroups.nodes ?? [];

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
                    toolbar: TargetGroupsGridToolbar,
                }}
                showToolbar
            />
            <EditDialog disableCloseAfterSave componentsProps={{ dialog: { maxWidth: "sm" } }}>
                <DialogContent>
                    <TargetGroupDialog scope={scope} />
                </DialogContent>
            </EditDialog>
        </MainContent>
    );
}
