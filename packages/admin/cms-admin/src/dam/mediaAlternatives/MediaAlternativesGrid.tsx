import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
    Button,
    DataGridToolbar,
    DeleteDialog,
    FillSpace,
    GridCellContent,
    type GridColDef,
    GridToolbarQuickFilter,
    messages,
    muiGridFilterToGql,
    muiGridSortToGql,
    ToolbarActions,
    ToolbarItem,
    useBufferedRowCount,
    useDataGridRemote,
    useEditDialog,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from "@dextinity/admin-icons";
import { DialogContent, IconButton } from "@mui/material";
import type { GridSlotsComponent, GridToolbarProps } from "@mui/x-data-grid";
import { type ReactElement, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { DataGrid } from "../../dataGrid/DataGrid";
import type { GQLDamMediaAlternativeType } from "../../graphql.generated";
import { VideoPreviewCaptionsQueryName } from "../FileForm/previews/VideoPreview";
import { MediaAlternativeForm } from "./MediaAlternativeForm";
import type {
    GQLDamMediaAlternativeGridFragment,
    GQLDamMediaAlternativesQuery,
    GQLDamMediaAlternativesQueryVariables,
    GQLDeleteDamMediaAlternativeMutation,
    GQLDeleteDamMediaAlternativeMutationVariables,
} from "./MediaAlternativesGrid.generated";

const damMediaAlternativeFragment = gql`
    fragment DamMediaAlternativeGrid on DamMediaAlternative {
        id
        language
        type
        for {
            id
            name
            damPath
        }
        alternative {
            id
            name
            damPath
        }
    }
`;

const damMediaAlternativesQuery = gql`
    query DamMediaAlternatives(
        $offset: Int!
        $limit: Int!
        $sort: [DamMediaAlternativeSort!]
        $search: String
        $for: ID
        $alternative: ID
        $type: DamMediaAlternativeType
    ) {
        damMediaAlternatives(offset: $offset, limit: $limit, sort: $sort, search: $search, for: $for, alternative: $alternative, type: $type) {
            nodes {
                ...DamMediaAlternativeGrid
            }
            totalCount
        }
    }
    ${damMediaAlternativeFragment}
`;

const deleteDamMediaAlternativeMutation = gql`
    mutation DeleteDamMediaAlternative($id: ID!) {
        deleteDamMediaAlternative(id: $id)
    }
`;

export const mediaAlternativesGridRefetchQueries = [damMediaAlternativesQuery, VideoPreviewCaptionsQueryName];

interface MediaAlternativesGridToolbarProps extends GridToolbarProps {
    handleAdd: () => void;
}

function MediaAlternativesGridToolbar({ handleAdd }: MediaAlternativesGridToolbarProps) {
    return (
        <DataGridToolbar>
            <ToolbarItem>
                <GridToolbarQuickFilter />
            </ToolbarItem>
            <FillSpace />
            <ToolbarActions>
                <Button responsive startIcon={<AddIcon />} onClick={handleAdd}>
                    <FormattedMessage {...messages.add} />
                </Button>
            </ToolbarActions>
        </DataGridToolbar>
    );
}

type Direction = "for" | "alternative";

interface MediaAlternativesGridProps {
    file: { id: string };
    type: GQLDamMediaAlternativeType;
    direction: Direction;
}

export function MediaAlternativesGrid({ file, type, direction }: MediaAlternativesGridProps): ReactElement {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("DamMediaAlternativesGrid") };
    const [EditDialog, selection, editDialogApi, selectionApi] = useEditDialog();
    const [deleteId, setDeleteId] = useState<string | undefined>();

    const columns: GridColDef<GQLDamMediaAlternativeGridFragment>[] = [
        {
            field: direction === "for" ? "alternative" : "for",
            headerName: intl.formatMessage({ id: "dextinity.damMediaAlternatives.title", defaultMessage: "File" }),
            flex: 1,
            minWidth: 150,
            renderCell: ({ row }) =>
                direction === "for" ? (
                    <GridCellContent primaryText={row.alternative.name} secondaryText={row.alternative.damPath} />
                ) : (
                    <GridCellContent primaryText={row.for.name} secondaryText={row.for.damPath} />
                ),
            filterable: false,
        },
        {
            field: "language",
            headerName: intl.formatMessage({ id: "dextinity.damMediaAlternatives.language", defaultMessage: "Language" }),
            flex: 1,
            minWidth: 50,
            filterable: false,
        },
        {
            field: "actions",
            headerName: "",
            sortable: false,
            filterable: false,
            type: "actions",
            align: "right",
            pinned: "right",
            width: 84,
            renderCell: (params) => {
                return (
                    <>
                        <IconButton
                            color="primary"
                            onClick={() => {
                                editDialogApi.openEditDialog(params.row.id);
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                setDeleteId(params.row.id);
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </>
                );
            },
        },
    ];

    const { search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);

    const { data, loading, error } = useQuery<GQLDamMediaAlternativesQuery, GQLDamMediaAlternativesQueryVariables>(damMediaAlternativesQuery, {
        variables: {
            search: gqlSearch,
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            sort: muiGridSortToGql(dataGridProps.sortModel),
            for: direction === "for" ? file.id : undefined,
            alternative: direction === "alternative" ? file.id : undefined,
            type: type,
        },
    });
    const rowCount = useBufferedRowCount(data?.damMediaAlternatives.totalCount);
    if (error) {
        throw error;
    }
    const rows = data?.damMediaAlternatives.nodes ?? [];

    return (
        <>
            <DataGrid
                {...dataGridProps}
                autoHeight={true}
                disableRowSelectionOnClick
                rows={rows}
                rowCount={rowCount}
                columns={columns}
                loading={loading}
                slots={{
                    toolbar: MediaAlternativesGridToolbar as GridSlotsComponent["toolbar"],
                }}
                slotProps={{
                    toolbar: { handleAdd: () => editDialogApi.openAddDialog(file.id) } as MediaAlternativesGridToolbarProps,
                }}
                showToolbar
            />
            <EditDialog>
                {selection.id && selection.mode ? (
                    <DialogContent>
                        <MediaAlternativeForm
                            mode={selection.mode}
                            id={selection.mode === "edit" ? selection.id : undefined}
                            fileId={file.id}
                            selectionApi={selectionApi}
                            type={type}
                            direction={direction}
                        />
                    </DialogContent>
                ) : null}
            </EditDialog>
            <DeleteDialog
                dialogOpen={deleteId !== undefined}
                onCancel={() => setDeleteId(undefined)}
                onDelete={async () => {
                    if (deleteId) {
                        await client.mutate<GQLDeleteDamMediaAlternativeMutation, GQLDeleteDamMediaAlternativeMutationVariables>({
                            mutation: deleteDamMediaAlternativeMutation,
                            variables: { id: deleteId },
                            refetchQueries: mediaAlternativesGridRefetchQueries,
                        });
                    }
                    setDeleteId(undefined);
                }}
            />
        </>
    );
}
