import { DialogContent } from "@mui/material";
import type { StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, waitFor, within } from "storybook/test";

import { Alert } from "../../alert/Alert";
import { Button } from "../../common/buttons/Button";
import { FinalForm } from "../../FinalForm";
import { NumberField } from "../../form/fields/NumberField";
import { TextAreaField } from "../../form/fields/TextAreaField";
import { TextField } from "../../form/fields/TextField";
import { useEditDialog } from "../EditDialog";
import { EditDialogActions } from "../EditDialogActions";

export default {
    title: "components/edit-dialog",
};

interface FormValues {
    title?: string;
    quantity?: number;
    description?: string;
}

const EditDialogWithActionsInFormPage = () => {
    const [EditDialog, , editDialogApi] = useEditDialog();
    const [submittedValues, setSubmittedValues] = useState<FormValues>();

    return (
        <>
            <Button onClick={() => editDialogApi.openAddDialog()}>Open Edit Dialog</Button>
            <EditDialog disableDialogActions>
                <FinalForm<FormValues> mode="add" onSubmit={async (values) => setSubmittedValues(values)}>
                    <DialogContent>
                        <TextField name="title" label="Title" fullWidth autoFocus />
                        <NumberField name="quantity" label="Quantity" fullWidth />
                        <TextAreaField name="description" label="Description" fullWidth />
                    </DialogContent>
                    <EditDialogActions />
                </FinalForm>
            </EditDialog>
            <Alert title="Submitted values" sx={{ mt: 2 }}>
                <pre data-testid="submitted-values">{JSON.stringify(submittedValues ?? null, null, 2)}</pre>
            </Alert>
        </>
    );
};

// The labels rendered by Field aren't associated with their inputs, so getByLabelText can't find them
function getFieldInput(name: string) {
    const input = document.querySelector<HTMLElement>(`[role="dialog"] [name="${name}"]`);
    if (!input) {
        throw new Error(`Input "${name}" not found`);
    }
    return input;
}

/**
 * `EditDialogActions` inside the form makes the save button the form's submit button.
 * Pressing Enter in a single-line field saves and closes the dialog. In the multiline field, Enter inserts a line break.
 */
export const EditDialogWithActionsInForm: StoryObj<typeof EditDialogWithActionsInFormPage> = {
    render: EditDialogWithActionsInFormPage,
    play: async ({ canvas, userEvent, step }) => {
        const body = within(document.body);

        await step("Open dialog", async () => {
            await userEvent.click(canvas.getByText("Open Edit Dialog"));
            await body.findByRole("dialog");
        });

        await step("Fill in the fields", async () => {
            await userEvent.type(getFieldInput("quantity"), "42");
            await userEvent.type(getFieldInput("description"), "Line 1{Enter}Line 2");
            await userEvent.type(getFieldInput("title"), "Apples");
        });

        await step("Press Enter to save and close the dialog", async () => {
            await userEvent.keyboard("{Enter}");

            await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument(), { timeout: 3000 });
            await expect(JSON.parse(canvas.getByTestId("submitted-values").textContent ?? "null")).toEqual({
                title: "Apples",
                quantity: 42,
                description: "Line 1\nLine 2",
            });
        });
    },
};
