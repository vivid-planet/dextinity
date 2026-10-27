import { Button, Dialog, type GridColDef, useBufferedRowCount } from "@dextinity/admin";
import { ArrowLeft, Search } from "@dextinity/admin-icons";
import { Breadcrumbs, DialogContent, InputAdornment, InputBase, Link } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DataGrid, type GridPaginationModel } from "@mui/x-data-grid";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { type DamItem, damQueryKeys } from "../damApi.types.js";
import { useDamApi } from "../DamApiProvider.js";
import { DamItemLabel } from "../DamItemLabel.js";
import { FormattedFileSize } from "../FormattedFileSize.js";
import type { DamBlockFile } from "./damBlockFile.js";

interface ChooseDamFileDialogProps {
    onClose: () => void;
    onChooseFile: (file: DamBlockFile) => void;
    /** Only files of these types are listed, e.g. `["image/png", "image/jpeg"]` */
    allowedMimetypes?: string[];
}

const pageSize = 20;

/** Browses the folders of the DAM in the current scope, choosing a file closes the dialog */
export function ChooseDamFileDialog({ onClose, onChooseFile, allowedMimetypes }: ChooseDamFileDialogProps) {
    const intl = useIntl();
    const { client, scope } = useDamApi();
    const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([]);
    const [searchText, setSearchText] = useState("");
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize });
    const folderId = folders.at(-1)?.id;

    const query = {
        ...scope,
        ...(folderId && { folderId }),
        ...(searchText && { searchText }),
        ...(allowedMimetypes && { mimetypes: allowedMimetypes }),
        offset: String(paginationModel.page * paginationModel.pageSize),
        limit: String(paginationModel.pageSize),
    };
    const { data, isFetching } = useQuery({
        queryKey: damQueryKeys.items(query),
        // The client is typed with the generic scope, whose index signature doesn't allow the array of mimetypes
        queryFn: () => parseResponse(client.items.$get({ query: query as typeof query & Record<string, string> })),
        placeholderData: keepPreviousData,
    });
    const rowCount = useBufferedRowCount(data?.totalCount);

    const openFolder = (folders: Array<{ id: string; name: string }>) => {
        setFolders(folders);
        setPaginationModel({ page: 0, pageSize });
    };

    const columns = useMemo<GridColDef<DamItem>[]>(
        () => [
            {
                field: "name",
                headerName: intl.formatMessage({ id: "dextinity.dam.name", defaultMessage: "Name" }),
                flex: 1,
                sortable: false,
                renderCell: ({ row }) => <DamItemLabel item={row} />,
            },
            {
                field: "size",
                headerName: intl.formatMessage({ id: "dextinity.dam.size", defaultMessage: "Size" }),
                width: 120,
                sortable: false,
                renderCell: ({ row }) => (row.__typename === "DamFile" ? <FormattedFileSize bytes={row.size} /> : null),
            },
        ],
        [intl],
    );

    return (
        <Dialog
            open
            onClose={onClose}
            maxWidth="md"
            fullWidth
            title={intl.formatMessage({ id: "dextinity.dam.chooseFile", defaultMessage: "Choose file" })}
        >
            <Content>
                <Header>
                    {folders.length > 0 && (
                        <Button variant="textDark" startIcon={<ArrowLeft />} onClick={() => openFolder(folders.slice(0, -1))}>
                            <FormattedMessage id="dextinity.dam.back" defaultMessage="Back" />
                        </Button>
                    )}
                    <Breadcrumbs>
                        <Link component="button" type="button" onClick={() => openFolder([])}>
                            <FormattedMessage id="dextinity.dam.assetManager" defaultMessage="Asset Manager" />
                        </Link>
                        {folders.map((folder, index) => (
                            <Link key={folder.id} component="button" type="button" onClick={() => openFolder(folders.slice(0, index + 1))}>
                                {folder.name}
                            </Link>
                        ))}
                    </Breadcrumbs>
                    <SearchInput
                        value={searchText}
                        onChange={(event) => {
                            setSearchText(event.target.value);
                            setPaginationModel({ page: 0, pageSize });
                        }}
                        placeholder={intl.formatMessage({ id: "dextinity.dam.search", defaultMessage: "Search" })}
                        startAdornment={
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        }
                    />
                </Header>
                <GridWrapper>
                    <DataGrid
                        rows={data?.nodes ?? []}
                        rowCount={rowCount}
                        loading={isFetching}
                        columns={columns}
                        rowHeight={58}
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[pageSize]}
                        disableColumnMenu
                        disableRowSelectionOnClick
                        onRowClick={({ row }: { row: DamItem }) => {
                            if (row.__typename === "DamFolder") {
                                openFolder([...folders, { id: row.id, name: row.name }]);
                            } else {
                                const { __typename, ...file } = row;
                                onChooseFile(file);
                            }
                        }}
                    />
                </GridWrapper>
            </Content>
        </Dialog>
    );
}

const Content = styled(DialogContent)`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(2)};
`;

const Header = styled("div")`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
`;

const SearchInput = styled(InputBase)`
    margin-left: auto;
`;

const GridWrapper = styled("div")`
    height: 60vh;

    .MuiDataGrid-row {
        cursor: pointer;
    }
`;
