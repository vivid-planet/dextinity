import { Add as AddIcon } from "@dextinity/admin-icons";
import { DialogContent } from "@mui/material";
import { DataGrid, type GridToolbarProps } from "@mui/x-data-grid";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { useLocation } from "react-router";

import { Button } from "../../common/buttons/Button";
import { FillSpace } from "../../common/FillSpace";
import { MainContent } from "../../common/MainContent";
import { DataGridToolbar } from "../../common/toolbar/DataGridToolbar";
import { useDataGridRemote } from "../../dataGrid/useDataGridRemote";
import { FinalForm } from "../../FinalForm";
import { TextField } from "../../form/fields/TextField";
import { useEditDialog } from "../EditDialog";

export default {
    title: "components/edit-dialog",
};

interface ToolbarProps extends GridToolbarProps {
    toolbarAction?: ReactNode;
}

function Toolbar({ toolbarAction }: ToolbarProps) {
    return (
        <DataGridToolbar>
            <FillSpace />
            {toolbarAction}
        </DataGridToolbar>
    );
}

export const EditDialogInDataGrid = {
    render: () => {
        const [EditDialog, , editDialogApi] = useEditDialog();
        const location = useLocation();

        const dataGridProps = useDataGridRemote({
            initialSort: [{ field: "name", sort: "asc" }],
            queryParamsPrefix: "products",
        });

        return (
            <MainContent fullHeight>
                <p>
                    Current Path: {location.pathname}
                    {location.search}
                </p>
                <DataGrid
                    columns={[
                        { field: "id", headerName: "ID", width: 90 },
                        { field: "name", headerName: "Name", flex: 1 },
                    ]}
                    rows={Array.from({ length: 200 }, (row, index) => ({ id: String(index + 1), name: `Product ${index + 1}` }))}
                    rowCount={200}
                    sortingMode="server"
                    sortModel={dataGridProps.sortModel}
                    onSortModelChange={dataGridProps.onSortModelChange}
                    slots={{
                        toolbar: Toolbar,
                    }}
                    slotProps={{
                        toolbar: {
                            toolbarAction: (
                                <Button responsive startIcon={<AddIcon />} onClick={() => editDialogApi?.openAddDialog()}>
                                    <FormattedMessage id="devStories.editDailogBug.newProduct" defaultMessage="New Product" />
                                </Button>
                            ),
                        } as ToolbarProps,
                    }}
                    showToolbar
                />
                <EditDialog>
                    <DialogContent>
                        <FinalForm
                            mode="edit"
                            onSubmit={() => {
                                console.log("Submitted!");
                            }}
                            onAfterSubmit={() => {
                                editDialogApi.closeDialog();
                            }}
                        >
                            <TextField name="name" label="Name" fullWidth />
                        </FinalForm>
                    </DialogContent>
                </EditDialog>
            </MainContent>
        );
    },
    name: "EditDialog in DataGrid",
};
