import { Add, Edit } from "@dextinity/admin-icons";
import { Stack, Typography } from "@mui/material";

import { Button } from "../../common/buttons/Button";
import { SubRoute } from "../../router/SubRoute";
import { useEditDialog } from "../EditDialog";

const FirstComponent = () => {
    const [EditDialog, selection, editDialogApi] = useEditDialog();
    return (
        <div style={{ padding: "20px", backgroundColor: "lightBlue" }}>
            First Component that uses an useEditDialog Hook
            <Stack direction="row" spacing={2} style={{ marginTop: "10px" }}>
                <Button
                    startIcon={<Edit />}
                    variant="textDark"
                    onClick={() => {
                        editDialogApi.openEditDialog("1235");
                    }}
                >
                    Edit
                </Button>
                <Button
                    startIcon={<Add />}
                    variant="textDark"
                    onClick={() => {
                        editDialogApi.openAddDialog();
                    }}
                >
                    Add
                </Button>
            </Stack>
            <EditDialog>
                <div style={{ padding: "20px", backgroundColor: "blue" }}>
                    <pre>{JSON.stringify(selection)}</pre>
                </div>
            </EditDialog>
        </div>
    );
};
const SecondComponent = () => {
    const [EditDialog, selection, editDialogApi] = useEditDialog();

    return (
        <div style={{ padding: "20px", backgroundColor: "lightGreen" }}>
            Second Component that uses an useEditDialog Hook
            <Stack direction="row" spacing={2} style={{ marginTop: "10px" }}>
                <Button
                    startIcon={<Edit />}
                    variant="textDark"
                    onClick={() => {
                        editDialogApi.openEditDialog("654321");
                    }}
                >
                    Edit
                </Button>
                <Button
                    startIcon={<Add />}
                    variant="textDark"
                    onClick={() => {
                        editDialogApi.openAddDialog();
                    }}
                >
                    Add
                </Button>
            </Stack>
            <EditDialog>
                <div style={{ padding: "20px", backgroundColor: "green" }}>
                    <pre>{JSON.stringify(selection)}</pre>
                </div>
            </EditDialog>
        </div>
    );
};
export const MultipleEditDialogs = () => {
    return (
        <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>
            <Typography variant="h3">MutipleEditDialogs2</Typography>

            <SubRoute path="./first">
                <FirstComponent />
            </SubRoute>
            <SubRoute path="./second">
                <SecondComponent />
            </SubRoute>
        </div>
    );
};

export default {
    title: "components/edit-dialog",
};
