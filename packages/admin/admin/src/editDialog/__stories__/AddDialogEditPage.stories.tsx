import { Add, Edit } from "@dextinity/admin-icons";
import { DialogContent, Typography } from "@mui/material";
import type { StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

import { Button } from "../../common/buttons/Button";
import { FieldSet } from "../../common/FieldSet";
import { StackMainContent } from "../../common/MainContent";
import { Tooltip } from "../../common/Tooltip";
import { SaveBoundary } from "../../saveBoundary/SaveBoundary";
import { StackBackButton } from "../../stack/backbutton/StackBackButton";
import { StackPage } from "../../stack/Page";
import { StackLink } from "../../stack/StackLink";
import { StackSwitch } from "../../stack/Switch";
import { useEditDialog } from "../EditDialog";

export default {
    title: "components/edit-dialog",
    parameters: {
        stack: { topLevelTitle: "Example Page" },
    },
};

const Form = ({ id }: { id?: string }) => {
    return (
        <Typography variant="h4">
            Form:{" "}
            {id === undefined ? (
                "Adding a new item"
            ) : (
                <>
                    Editing existing item with id: <code>{id}</code>
                </>
            )}
        </Typography>
    );
};

const Page = () => {
    const [EditDialog, , editDialogApi] = useEditDialog();

    return (
        <StackSwitch>
            <StackPage name="grid">
                <StackMainContent fullHeight>
                    <Tooltip title="Open the add dialog">
                        <Button sx={{ m: 2 }} startIcon={<Add />} onClick={() => editDialogApi.openAddDialog()}>
                            Add new item
                        </Button>
                    </Tooltip>
                    <Tooltip title="Open the edit page">
                        <Button sx={{ m: 2 }} startIcon={<Edit />} variant="secondary" component={StackLink} pageName="edit" payload="example-id">
                            Edit existing item
                        </Button>
                    </Tooltip>
                </StackMainContent>
                <EditDialog title="Add new item">
                    <DialogContent>
                        <Form />
                    </DialogContent>
                </EditDialog>
            </StackPage>
            <StackPage name="edit">
                {(id: string) => (
                    <SaveBoundary>
                        <StackMainContent>
                            <FieldSet title="Edit form" endAdornment={<StackBackButton />}>
                                <Form id={id} />
                            </FieldSet>
                        </StackMainContent>
                    </SaveBoundary>
                )}
            </StackPage>
        </StackSwitch>
    );
};

export const AddDialogEditPage: StoryObj<typeof Page> = {
    render: Page,
    play: async ({ canvas, userEvent, step }) => {
        await step("Open Add Dialog", async () => {
            const addButton = canvas.getByText(/add new item/i);
            await userEvent.click(addButton);

            await waitFor(
                async () => {
                    const addText = within(document.body).queryByText(/form: adding a new item/i);
                    expect(addText).toBeInTheDocument();

                    const editText = within(document.body).queryByText(/form: editing existing item/i);
                    expect(editText).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Open Edit Page", async () => {
            const editButton = canvas.getByText(/edit existing item/i);
            await userEvent.click(editButton);

            await waitFor(
                async () => {
                    const editText = within(document.body).queryByText(/form: editing existing item/i);
                    expect(editText).toBeInTheDocument();
                    expect(editText).toHaveTextContent("example-id");

                    const addText = within(document.body).queryByText(/form: adding a new item/i);
                    expect(addText).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });
    },
};
