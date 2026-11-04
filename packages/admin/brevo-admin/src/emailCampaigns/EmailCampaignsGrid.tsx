import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Button,
    CrudContextMenu,
    DataGridToolbar,
    type GridColDef,
    GridFilterButton,
    GridToolbarQuickFilter,
    MainContent,
    muiGridFilterToGql,
    muiGridSortToGql,
    StackLink,
    ToolbarActions,
    ToolbarAutomaticTitleItem,
    ToolbarFillSpace,
    ToolbarItem,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Add as AddIcon, Edit, Statistics, Visible } from "@dextinity/admin-icons";
import type { BlockInterface, ContentScope } from "@dextinity/cms-admin";
import { IconButton } from "@mui/material";
import { isBefore } from "date-fns";
import type { ReactElement } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { DataGrid } from "../dataGrid/DataGrid";
import type {
    GQLCreateEmailCampaignMutation,
    GQLCreateEmailCampaignMutationVariables,
    GQLDeleteEmailCampaignMutation,
    GQLDeleteEmailCampaignMutationVariables,
    GQLEmailCampaignsGridQuery,
    GQLEmailCampaignsGridQueryVariables,
    GQLEmailCampaignsListFragment,
} from "./EmailCampaignsGrid.generated";
import { SendingStateColumn } from "./SendingStateColumn";

const emailCampaignsFragment = gql`
    fragment EmailCampaignsList on BrevoEmailCampaign {
        id
        updatedAt
        createdAt
        title
        subject
        sendingState
        scheduledAt
        brevoId
        content
        brevoTargetGroups {
            id
            title
        }
    }
`;

const emailCampaignsQuery = gql`
    query EmailCampaignsGrid(
        $offset: Int
        $limit: Int
        $sort: [EmailCampaignSort!]
        $search: String
        $filter: EmailCampaignFilter
        $scope: EmailCampaignContentScopeInput!
    ) {
        brevoEmailCampaigns(offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter, scope: $scope) {
            nodes {
                ...EmailCampaignsList
            }
            totalCount
        }
    }
    ${emailCampaignsFragment}
`;

const deleteEmailCampaignMutation = gql`
    mutation DeleteEmailCampaign($id: ID!) {
        deleteBrevoEmailCampaign(id: $id)
    }
`;

const createEmailCampaignMutation = gql`
    mutation CreateEmailCampaign($scope: EmailCampaignContentScopeInput!, $input: EmailCampaignInput!) {
        createBrevoEmailCampaign(scope: $scope, input: $input) {
            id
        }
    }
`;

function EmailCampaignsGridToolbar() {
    return (
        <DataGridToolbar>
            <ToolbarAutomaticTitleItem />
            <ToolbarItem>
                <GridToolbarQuickFilter />
            </ToolbarItem>
            <ToolbarItem>
                <GridFilterButton />
            </ToolbarItem>
            <ToolbarFillSpace />
            <ToolbarActions>
                <Button startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add" variant="primary">
                    <FormattedMessage id="dextinity.emailCampaign.newEmailCampaign" defaultMessage="New email campaign" />
                </Button>
            </ToolbarActions>
        </DataGridToolbar>
    );
}

export function EmailCampaignsGrid({
    scope,
    EmailCampaignContentBlock,
}: {
    scope: ContentScope;
    EmailCampaignContentBlock: BlockInterface;
}): ReactElement {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = {
        ...useDataGridRemote({ initialSort: [{ field: "updatedAt", sort: "desc" }] }),
        ...usePersistentColumnState("EmailCampaignsGrid"),
    };

    const sendingStateOptions: { label: string; value: string }[] = [
        {
            value: "SENT",
            label: intl.formatMessage({ id: "dextinity.emailCampaign.sent", defaultMessage: "Sent" }),
        },
        { value: "DRAFT", label: intl.formatMessage({ id: "dextinity.emailCampaign.draft", defaultMessage: "Draft" }) },
        { value: "SCHEDULED", label: intl.formatMessage({ id: "dextinity.emailCampaign.scheduled", defaultMessage: "Scheduled" }) },
    ];

    const columns: GridColDef<GQLEmailCampaignsListFragment>[] = [
        {
            field: "updatedAt",
            headerName: intl.formatMessage({ id: "dextinity.emailCampaign.updatedAt", defaultMessage: "Updated At" }),
            type: "dateTime",
            valueGetter: (params, row) => row.updatedAt && new Date(row.updatedAt),
            width: 150,
            filterable: false,
        },
        {
            field: "createdAt",
            headerName: intl.formatMessage({ id: "dextinity.emailCampaign.createdAt", defaultMessage: "Created At" }),
            type: "dateTime",
            valueGetter: (params, row) => row.updatedAt && new Date(row.updatedAt),
            width: 150,
            filterable: false,
        },
        { field: "title", headerName: intl.formatMessage({ id: "dextinity.emailCampaign.title", defaultMessage: "Title" }), flex: 2 },
        {
            field: "subject",
            headerName: intl.formatMessage({ id: "dextinity.emailCampaign.subject", defaultMessage: "Subject" }),
            flex: 1,
        },
        {
            field: "sendingState",
            headerName: intl.formatMessage({ id: "dextinity.emailCampaign.sendingState", defaultMessage: "Sending State" }),
            renderCell: ({ value }) => <SendingStateColumn sendingState={value} />,
            width: 150,
            sortable: false,
            type: "singleSelect",
            valueOptions: sendingStateOptions,
        },
        {
            field: "scheduledAt",
            headerName: intl.formatMessage({ id: "dextinity.emailCampaign.scheduledAt", defaultMessage: "Scheduled At" }),
            type: "dateTime",
            valueGetter: (params, row) => row.updatedAt && new Date(row.updatedAt),
            width: 200,
        },
        {
            field: "brevoTargetGroups",
            headerName: intl.formatMessage({ id: "dextinity.emailCampaign.targetGroups", defaultMessage: "Target groups" }),
            width: 150,
            renderCell: ({ value }) => value.map((value: { title: string }) => value.title).join(", "),
            filterable: false,
            sortable: false,
        },
        {
            field: "actions",
            headerName: "",
            sortable: false,
            filterable: false,
            align: "right",
            type: "actions",
            renderCell: ({ row }) => {
                const isScheduledDateInPast = row.scheduledAt != undefined && isBefore(new Date(row.scheduledAt), new Date());

                return (
                    <>
                        {row.sendingState !== "SENT" && !isScheduledDateInPast && (
                            <IconButton component={StackLink} pageName="edit" payload={row.id}>
                                <Edit color="primary" />
                            </IconButton>
                        )}
                        {row.sendingState === "SENT" && (
                            <IconButton component={StackLink} pageName="statistics" payload={row.id}>
                                <Statistics color="primary" />
                            </IconButton>
                        )}
                        {(row.sendingState === "SENT" || (row.sendingState == "SCHEDULED" && isScheduledDateInPast)) && (
                            <IconButton component={StackLink} pageName="view" payload={row.id}>
                                <Visible color="primary" />
                            </IconButton>
                        )}
                        <CrudContextMenu
                            copyData={() => {
                                return {
                                    title: row.title,
                                    subject: row.subject,
                                    content: EmailCampaignContentBlock.state2Output(EmailCampaignContentBlock.input2State(row.content)),
                                    brevoTargetGroups: row.brevoTargetGroups.map((brevoTargetGroup) => brevoTargetGroup.id),
                                };
                            }}
                            onPaste={async ({ input }) => {
                                await client.mutate<GQLCreateEmailCampaignMutation, GQLCreateEmailCampaignMutationVariables>({
                                    mutation: createEmailCampaignMutation,
                                    variables: { scope, input: { ...input } },
                                });
                            }}
                            onDelete={
                                !row.brevoId
                                    ? async () => {
                                          await client.mutate<GQLDeleteEmailCampaignMutation, GQLDeleteEmailCampaignMutationVariables>({
                                              mutation: deleteEmailCampaignMutation,
                                              variables: { id: row.id },
                                          });
                                      }
                                    : undefined
                            }
                            refetchQueries={[emailCampaignsQuery]}
                        />
                    </>
                );
            },
        },
    ];

    const { filter: gqlFilter, search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);

    const { data, loading, error } = useQuery<GQLEmailCampaignsGridQuery, GQLEmailCampaignsGridQueryVariables>(emailCampaignsQuery, {
        variables: {
            scope,
            filter: gqlFilter,
            search: gqlSearch,
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            sort: muiGridSortToGql(dataGridProps.sortModel),
        },
    });
    const rowCount = useBufferedRowCount(data?.brevoEmailCampaigns.totalCount);
    if (error) {
        throw error;
    }
    const rows = data?.brevoEmailCampaigns.nodes ?? [];

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
                    toolbar: EmailCampaignsGridToolbar,
                }}
                showToolbar
            />
        </MainContent>
    );
}
