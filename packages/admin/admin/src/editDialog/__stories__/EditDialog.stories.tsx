import { DialogContent } from "@mui/material";

import { Button } from "../../common/buttons/Button";
import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
import { useEditDialog } from "../EditDialog";

export default {
    title: "components/edit-dialog",
};

export const EditDialogStory = {
    render: () => {
        const [EditDialog, , editDialogApi] = useEditDialog();

        return (
            <>
                <h2>Plain Edit Dialog:</h2>
                <Button onClick={() => editDialogApi.openAddDialog()}>Open Edit Dialog</Button>
                <EditDialog>
                    <DialogContent>
                        <FinalForm
                            mode="add"
                            onSubmit={({ name }: { name: string }) => {
                                return new Promise<void>((resolve, reject) => {
                                    console.log("Loading ...");
                                    setTimeout(() => {
                                        console.log("Submitted name:", name);
                                        if (name === "error") {
                                            console.error("Error");
                                            reject(new Error("Simulated submission error"));
                                        } else {
                                            console.log("Success");
                                            resolve();
                                        }
                                    }, 3_000);
                                });
                            }}
                        >
                            <Field
                                label="Name"
                                name="name"
                                component={FinalFormInput}
                                fullWidth
                                autoFocus
                                required
                                helperText="Type 'error' to make the request fail"
                            />
                        </FinalForm>
                    </DialogContent>
                </EditDialog>
            </>
        );
    },
    name: "Plain Edit Dialog",
};
