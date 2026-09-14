import { Edit } from "@dextinity/admin-icons";
import { DialogContent, IconButton, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { MainContent } from "../../common/MainContent";
import { FinalForm } from "../../FinalForm";
import { TextField } from "../../form/fields/TextField";
import { StackBreadcrumbs } from "../../stack/breadcrumbs/StackBreadcrumbs";
import { StackPage } from "../../stack/Page";
import { Stack } from "../../stack/Stack";
import { StackLink } from "../../stack/StackLink";
import { StackSwitch } from "../../stack/Switch";
import { useEditDialog } from "../EditDialog";

export default {
    title: "components/edit-dialog",
};

const products = [
    { id: "1", name: "Product 1" },
    { id: "2", name: "Product 2" },
    { id: "3", name: "Product 3" },
    { id: "4", name: "Product 4" },
    { id: "5", name: "Product 5" },
];

function ProductDetail({ id: stackSelectionId }: { id: string }) {
    const [EditDialog, { id: editDialogSelectionId }, editDialogApi] = useEditDialog();

    return (
        <>
            <MainContent fullHeight disablePadding>
                <Typography variant="h6" py={2}>
                    Stack selection ID: {stackSelectionId}
                </Typography>
                <DataGrid
                    columns={[
                        { field: "id", headerName: "ID", width: 90 },
                        { field: "name", headerName: "Name", flex: 1 },
                        {
                            field: "actions",
                            type: "actions",
                            headerName: "",
                            width: 52,
                            renderCell: ({ row }) => (
                                <IconButton
                                    onClick={() => {
                                        editDialogApi.openEditDialog(row.id);
                                    }}
                                >
                                    <Edit color="primary" />
                                </IconButton>
                            ),
                        },
                    ]}
                    rows={products}
                />
            </MainContent>
            <EditDialog>
                <DialogContent>
                    <Typography variant="h6" py={2}>
                        EditDialog selection ID: {editDialogSelectionId}
                    </Typography>
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
        </>
    );
}

export const NestedEditDialogInStack = function Story() {
    return (
        <Stack topLevelTitle="Products">
            <StackBreadcrumbs />
            <StackSwitch initialPage="grid">
                <StackPage name="grid">
                    <MainContent fullHeight disablePadding>
                        <DataGrid
                            columns={[
                                { field: "id", headerName: "ID", width: 90 },
                                { field: "name", headerName: "Name", flex: 1 },
                                {
                                    field: "actions",
                                    type: "actions",
                                    headerName: "",
                                    renderCell: ({ row }) => (
                                        <StackLink pageName="detail" payload={row.id}>
                                            Edit
                                        </StackLink>
                                    ),
                                },
                            ]}
                            rows={products}
                        />
                    </MainContent>
                </StackPage>
                <StackPage name="detail" title="Edit product detail">
                    {(productId: string) => <ProductDetail id={productId} />}
                </StackPage>
            </StackSwitch>
        </Stack>
    );
};

NestedEditDialogInStack.storyName = "Nested Edit Dialog in Stack";
