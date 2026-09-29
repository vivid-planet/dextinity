import { useMutation, useQuery } from "@apollo/client";
import {
    Button,
    CrudMoreActionsMenu,
    dataGridDateTimeColumn,
    DataGridToolbar,
    DeleteDialog,
    FillSpace,
    type GridColDef,
    GridFilterButton,
    GridToolbarQuickFilter,
    LocalErrorScopeApolloContext,
    MainContent,
    muiGridFilterToGql,
    muiGridPagingToGql,
    muiGridSortToGql,
    StackLink,
    TableDeleteButton,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Add as AddIcon, Delete as DeleteIcon, Edit } from "@dextinity/admin-icons";
import { IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
    type DataGridProps,
    getGridSingleSelectOperators,
    type GridRowSelectionModel,
    type GridSlotsComponent,
    type GridToolbarProps,
} from "@mui/x-data-grid";
import { type JSX, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { BlockPreviewContent } from "../blocks/common/blockRow/BlockPreviewContent";
import type { BlockInterface } from "../blocks/types";
import { DataGrid } from "../dataGrid/DataGrid";
import RedirectActiveness from "./RedirectActiveness";
import { deleteRedirectMutation, deleteRedirectsMutation, paginatedRedirectsQuery } from "./RedirectsGrid.gql";
import {
    type GQLDeleteRedirectsMutation,
    type GQLDeleteRedirectsMutationVariables,
    type GQLPaginatedRedirectsQuery,
    type GQLPaginatedRedirectsQueryVariables,
    namedOperations,
} from "./RedirectsGrid.gql.generated";

interface Props {
    linkBlock: BlockInterface;
    scope: Record<string, unknown>;
}

interface RedirectsGridToolbarProps extends GridToolbarProps {
    selectedIds?: string[];
    onDeleteSelected?: () => void;
}

function RedirectsGridToolbar({ selectedIds = [], onDeleteSelected }: RedirectsGridToolbarProps) {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <GridFilterButton />
            <FillSpace />
            <CrudMoreActionsMenu
                selectionSize={selectedIds.length}
                selectiveActions={[
                    {
                        label: <FormattedMessage id="dextinity.pages.redirects.deleteSelected" defaultMessage="Delete" />,
                        icon: <DeleteIcon />,
                        onClick: onDeleteSelected,
                    },
                ]}
            />
            <Button startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add">
                <FormattedMessage id="dextinity.pages.redirects.add" defaultMessage="New redirect" />
            </Button>
        </DataGridToolbar>
    );
}

export function RedirectsGrid({ linkBlock, scope }: Props): JSX.Element {
    const intl = useIntl();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [deleteRedirects] = useMutation<GQLDeleteRedirectsMutation, GQLDeleteRedirectsMutationVariables>(deleteRedirectsMutation, {
        refetchQueries: [namedOperations.Query.PaginatedRedirects],
    });

    const handleDeleteSelected = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        await deleteRedirects({ variables: { ids: selectedIds } });
        setSelectedIds([]);
        setDeleteDialogOpen(false);
    };

    const typeOptions = [
        {
            label: intl.formatMessage({
                id: "dextinity.redirects.redirect.generationType.manual",
                defaultMessage: "Manual",
            }),
            value: "manual",
        },
        {
            label: intl.formatMessage({
                id: "dextinity.redirects.redirect.generationType.automatic",
                defaultMessage: "Automatic",
            }),
            value: "automatic",
        },
    ];

    const columns: GridColDef[] = [
        {
            field: "source",
            headerName: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.source", defaultMessage: "Source" }),
            sortable: true,
            flex: 4,
        },
        {
            field: "target",
            headerName: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.target", defaultMessage: "Target" }),
            renderCell: (params) => {
                return (
                    <TargetWrapper>
                        <BlockPreviewContent block={linkBlock} input={params.value} showIcon />
                    </TargetWrapper>
                );
            },
            sortable: false,
            flex: 2,
        },
        {
            field: "comment",
            headerName: intl.formatMessage({ id: "dextinity.pages.redirects.redirect.comment", defaultMessage: "Comment" }),
            renderCell: (params) => <div>{params.value}</div>,
            sortable: false,
            flex: 2,
            filterable: false,
        },
        {
            field: "generationType",
            headerName: intl.formatMessage({
                id: "dextinity.pages.redirects.redirect.generationType",
                defaultMessage: "Generation Type",
            }),
            renderCell: (params) => (
                <Typography>
                    {params.value === "manual" ? (
                        <FormattedMessage id="dextinity.redirects.redirect.generationType.manual" defaultMessage="Manual" />
                    ) : (
                        <FormattedMessage id="dextinity.redirects.redirect.generationType.automatic" defaultMessage="Automatic" />
                    )}
                </Typography>
            ),
            sortable: false,
            filterOperators: getGridSingleSelectOperators(),
            type: "singleSelect",
            valueOptions: typeOptions,
            width: 130,
        },
        {
            field: "active",
            headerName: intl.formatMessage({
                id: "dextinity.pages.redirects.redirect.activation",
                defaultMessage: "Activation",
            }),
            renderCell: (params) => <RedirectActiveness redirect={params.row} />,
            sortable: false,
            type: "boolean",
            width: 130,
        },
        {
            ...dataGridDateTimeColumn,
            field: "activatedAt",
            headerName: intl.formatMessage({
                id: "dextinity.pages.redirects.redirect.activatedAt",
                defaultMessage: "Activation Date",
            }),
            sortable: false,
            width: 170,
        },
        {
            field: "actions",
            type: "actions",
            headerName: "",
            renderCell: (params) => (
                <IconWrapper>
                    <IconButton color="primary" component={StackLink} pageName="edit" payload={params.id.toString()}>
                        <Edit />
                    </IconButton>
                    <TableDeleteButton
                        icon={<DeleteIcon />}
                        mutation={deleteRedirectMutation}
                        refetchQueries={[namedOperations.Query.PaginatedRedirects]}
                        selectedId={params.id.toString()}
                        text=""
                    />
                </IconWrapper>
            ),
            sortable: false,
            disableColumnMenu: true,
            filterable: false,
        },
    ];

    const dataGridProps = {
        ...useDataGridRemote(),
        ...usePersistentColumnState("RedirectsGrid"),
        rowSelectionModel: { type: "include", ids: new Set(selectedIds) } as DataGridProps["rowSelectionModel"],
        onRowSelectionModelChange: (model: GridRowSelectionModel) => setSelectedIds([...model.ids] as string[]),
        checkboxSelection: true,
        keepNonExistentRowsSelected: true,
        disableRowSelectionExcludeModel: true,
    };
    const sortModel = dataGridProps.sortModel;

    const { data, loading, error } = useQuery<GQLPaginatedRedirectsQuery, GQLPaginatedRedirectsQueryVariables>(paginatedRedirectsQuery, {
        variables: {
            scope,
            ...muiGridFilterToGql(columns, dataGridProps.filterModel),
            ...muiGridPagingToGql({ page: dataGridProps.paginationModel.page, pageSize: dataGridProps.paginationModel.pageSize }),
            sort: muiGridSortToGql(sortModel),
        },
        context: LocalErrorScopeApolloContext,
        fetchPolicy: "cache-and-network",
    });

    if (error) {
        throw error;
    }
    const rows = data?.paginatedRedirects.nodes ?? [];
    const rowCount = useBufferedRowCount(data?.paginatedRedirects.totalCount);

    return (
        <MainContent fullHeight>
            <DataGrid
                {...dataGridProps}
                rows={rows}
                rowCount={rowCount}
                columns={columns}
                loading={loading}
                slots={{ toolbar: RedirectsGridToolbar as GridSlotsComponent["toolbar"] }}
                slotProps={{
                    toolbar: {
                        selectedIds,
                        onDeleteSelected: handleDeleteSelected,
                    } as RedirectsGridToolbarProps,
                }}
                showToolbar
            />
            <DeleteDialog
                dialogOpen={deleteDialogOpen}
                deleteCount={selectedIds.length}
                onDelete={handleDeleteConfirm}
                onCancel={() => setDeleteDialogOpen(false)}
            />
        </MainContent>
    );
}

const TargetWrapper = styled("div")`
    max-width: 25vw;
`;

const IconWrapper = styled("div")`
    display: flex;
    flex-direction: row;
`;
