import { useMutation, useQuery } from "@apollo/client";
import {
    Button,
    CancelButton,
    CrudMoreActionsMenu,
    DataGridToolbar,
    Dialog,
    Field,
    FinalForm,
    type GridColDef,
    GridToolbarQuickFilter,
    ToolbarFillSpace,
    ToolbarItem,
    ToolbarTitleItem,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Add, Close, Remove, Save } from "@dextinity/admin-icons";
import type { ContentScope } from "@dextinity/cms-admin";
import { DialogActions, DialogTitle, IconButton, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import type { GridSlotsComponent } from "@mui/x-data-grid";
import { type ReactElement, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { MemoryRouter } from "react-router";

import { useContactImportFromCsv } from "../../common/contactImport/useContactImportFromCsv";
import { DataGrid } from "../../dataGrid/DataGrid";
import type { GQLEmailCampaignContentScopeInput } from "../../graphql.generated";
import { targetGroupFormNamedOperations } from "../TargetGroupForm";
import {
    addBrevoContactsToTargetGroupMutation,
    brevoContactsQuery,
    manuallyAssignedBrevoContactsGridQuery,
    removeBrevoContactFromTargetGroupMutation,
} from "./AddContactsGridSelect.gql";
import {
    type GQLAddBrevoContactsToTargetGroupMutation,
    type GQLAddBrevoContactsToTargetGroupMutationVariables,
    type GQLAllBrevoContactsGridQuery,
    type GQLAllBrevoContactsGridQueryVariables,
    type GQLManuallyAssignedBrevoContactsGridQuery,
    type GQLManuallyAssignedBrevoContactsGridQueryVariables,
    type GQLRemoveBrevoContactFromTargetGroupMutation,
    type GQLRemoveBrevoContactFromTargetGroupMutationVariables,
    type GQLTargetGroupBrevoContactsListFragment,
    namedOperations,
} from "./AddContactsGridSelect.gql.generated";

type AddContactsGridSelectToolbarProps = {
    onOpenDialog: () => void;
    scope: GQLEmailCampaignContentScopeInput;
    targetGroupId: string;
    sendDoubleOptIn: boolean;
};

const AssignedContactsGridToolbar = ({ onOpenDialog, scope, targetGroupId, sendDoubleOptIn }: AddContactsGridSelectToolbarProps) => {
    const intl = useIntl();

    const [moreActionsMenuItem, component] = useContactImportFromCsv({
        scope,
        targetGroupId,
        sendDoubleOptIn,
        refetchQueries: [namedOperations.Query.ManuallyAssignedBrevoContactsGrid],
    });

    return (
        <>
            <DataGridToolbar>
                <ToolbarTitleItem>
                    <FormattedMessage id="dextinity.targetGroup.manuallyAssignedContacts.title" defaultMessage="Manually assigned contacts" />
                </ToolbarTitleItem>
                <GridToolbarQuickFilter
                    placeholder={intl.formatMessage({
                        id: "dextinity.targetGroup.assignedContacts.searchEmail",
                        defaultMessage: "Search email address",
                    })}
                />
                <ToolbarFillSpace />
                <CrudMoreActionsMenu overallActions={[moreActionsMenuItem]} />
                <Button startIcon={<Add />} variant="primary" onClick={onOpenDialog}>
                    <FormattedMessage id="dextinity.targetGroup.assignedContacts.addContact" defaultMessage="Add contacts" />
                </Button>
            </DataGridToolbar>
            {component}
        </>
    );
};

const AssignableContactsGridToolbar = () => {
    const intl = useIntl();

    return (
        <DataGridToolbar>
            <ToolbarTitleItem>
                <FormattedMessage id="dextinity.targetGroup.assignableContacts.title" defaultMessage="Assignable contacts" />
            </ToolbarTitleItem>
            <ToolbarItem>
                <GridToolbarQuickFilter
                    placeholder={intl.formatMessage({
                        id: "dextinity.targetGroup.assignableContacts.searchEmail",
                        defaultMessage: "Search email address",
                    })}
                />
            </ToolbarItem>
        </DataGridToolbar>
    );
};

interface FormProps {
    brevoContactIds: Array<number>;
}

const useSubmitMutation = (id: string) => {
    const [addContactsToTargetGroup] = useMutation<GQLAddBrevoContactsToTargetGroupMutation, GQLAddBrevoContactsToTargetGroupMutationVariables>(
        addBrevoContactsToTargetGroupMutation,
        {
            refetchQueries: [namedOperations.Query.ManuallyAssignedBrevoContactsGrid, targetGroupFormNamedOperations.Query.TargetGroupForm],
        },
    );
    return ({ brevoContactIds }: FormProps) => {
        return addContactsToTargetGroup({
            variables: {
                id,
                input: {
                    brevoContactIds,
                },
            },
        });
    };
};

interface AddContactsGridSelectProps {
    scope: ContentScope;
    id: string;
    assignedContactsTargetGroupBrevoId?: number;
}

export function AddContactsGridSelect({ id, scope, assignedContactsTargetGroupBrevoId }: AddContactsGridSelectProps): ReactElement {
    const intl = useIntl();
    const submit = useSubmitMutation(id);
    const theme = useTheme();
    const dataGridAssignedContactsProps = { ...useDataGridRemote(), ...usePersistentColumnState("TargetGroupAssignedBrevoContactsGrid") };
    const dataGridAssignableContactsProps = { ...useDataGridRemote(), ...usePersistentColumnState("TargetGroupAssignableBrevoContactsGrid") };

    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const [removeContacts, { loading: removeLoading }] = useMutation<
        GQLRemoveBrevoContactFromTargetGroupMutation,
        GQLRemoveBrevoContactFromTargetGroupMutationVariables
    >(removeBrevoContactFromTargetGroupMutation, {
        refetchQueries: [namedOperations.Query.ManuallyAssignedBrevoContactsGrid],
        awaitRefetchQueries: true,
    });

    const onDeleteClick = (contactId: number) => {
        if (!id) {
            return;
        }
        removeContacts({ variables: { id, input: { brevoContactId: contactId } } });
    };

    const {
        data: assignableContactsData,
        loading: assignableContactsLoading,
        error: assignableContactsError,
    } = useQuery<GQLAllBrevoContactsGridQuery, GQLAllBrevoContactsGridQueryVariables>(brevoContactsQuery, {
        variables: {
            offset: dataGridAssignableContactsProps.paginationModel.page * dataGridAssignableContactsProps.paginationModel.pageSize,
            limit: dataGridAssignableContactsProps.paginationModel.pageSize,
            email: dataGridAssignableContactsProps.filterModel?.quickFilterValues
                ? dataGridAssignableContactsProps.filterModel?.quickFilterValues[0]
                : undefined,
            scope,
        },
    });

    const {
        data: assignedContactsData,
        loading: assignedContactsLoading,
        error: assignedContactsError,
    } = useQuery<GQLManuallyAssignedBrevoContactsGridQuery, GQLManuallyAssignedBrevoContactsGridQueryVariables>(
        manuallyAssignedBrevoContactsGridQuery,
        {
            variables: {
                offset: dataGridAssignedContactsProps.paginationModel.page * dataGridAssignedContactsProps.paginationModel.pageSize,
                limit: dataGridAssignedContactsProps.paginationModel.pageSize,
                email: dataGridAssignedContactsProps.filterModel?.quickFilterValues
                    ? dataGridAssignedContactsProps.filterModel?.quickFilterValues[0]
                    : undefined,
                targetGroupId: id,
            },
            skip: !assignedContactsTargetGroupBrevoId,
        },
    );

    const assignableContactsColumns: GridColDef<GQLTargetGroupBrevoContactsListFragment>[] = [
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
    ];

    const assignedContactsColumns = assignableContactsColumns.concat([
        {
            field: "actions",
            width: 50,
            disableColumnMenu: true,
            resizable: false,
            filterable: false,
            sortable: false,
            renderHeader: () => null,
            renderCell: ({ id }) => (
                <IconButton onClick={() => onDeleteClick(Number(id))} disabled={removeLoading}>
                    <Remove />
                </IconButton>
            ),
        },
    ]);

    const assignedContactsRowCount = useBufferedRowCount(assignedContactsData?.manuallyAssignedBrevoContacts.totalCount);
    const assignableContactsRowCount = useBufferedRowCount(assignableContactsData?.brevoContacts.totalCount);

    if (assignedContactsError || assignableContactsError) {
        throw assignedContactsError ?? assignableContactsError;
    }

    return (
        <>
            <DataGrid
                {...dataGridAssignedContactsProps}
                disableRowSelectionOnClick
                rows={assignedContactsData?.manuallyAssignedBrevoContacts.nodes ?? []}
                rowCount={assignedContactsRowCount}
                columns={assignedContactsColumns}
                autoHeight
                loading={assignedContactsLoading}
                slots={{
                    toolbar: AssignedContactsGridToolbar as GridSlotsComponent["toolbar"],
                }}
                slotProps={{
                    toolbar: {
                        onOpenDialog: () => setIsDialogOpen(true),
                        scope,
                        targetGroupId: id,
                    } as AddContactsGridSelectToolbarProps,
                }}
                showToolbar
            />
            <FinalForm<FormProps> mode="edit" onSubmit={submit}>
                {({ handleSubmit, submitting }) => {
                    return (
                        <MemoryRouter>
                            <Dialog open={isDialogOpen} maxWidth="lg" onClose={() => setIsDialogOpen(false)}>
                                <DialogTitle display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                                    <ToolbarFillSpace />
                                    <IconButton onClick={() => setIsDialogOpen(false)}>
                                        <Close htmlColor={theme.palette.common.white} />
                                    </IconButton>
                                </DialogTitle>
                                <Box>
                                    <Field<number[]> name="brevoContactIds" fullWidth>
                                        {(props) => (
                                            <DataGrid
                                                {...dataGridAssignableContactsProps}
                                                rows={assignableContactsData?.brevoContacts.nodes ?? []}
                                                rowCount={assignableContactsRowCount}
                                                columns={assignableContactsColumns}
                                                autoHeight
                                                loading={assignableContactsLoading || submitting}
                                                slots={{
                                                    toolbar: AssignableContactsGridToolbar,
                                                }}
                                                rowSelectionModel={{ type: "include", ids: new Set(props.input.value) }}
                                                onRowSelectionModelChange={(newSelectionModel) => {
                                                    props.input.onChange(Array.from(newSelectionModel.ids));
                                                }}
                                                disableRowSelectionExcludeModel
                                                checkboxSelection
                                                keepNonExistentRowsSelected
                                                showToolbar
                                            />
                                        )}
                                    </Field>
                                </Box>
                                <DialogActions>
                                    <CancelButton onClick={() => setIsDialogOpen(false)} />
                                    <Button
                                        startIcon={<Save />}
                                        onClick={async () => {
                                            await handleSubmit();
                                            setIsDialogOpen(false);
                                        }}
                                        variant="primary"
                                    >
                                        <FormattedMessage id="dextinity.targetGroup.addBrevoContacts.dialog.save" defaultMessage="Save" />
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </MemoryRouter>
                    );
                }}
            </FinalForm>
        </>
    );
}
