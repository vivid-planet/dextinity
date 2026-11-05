import userEvent from "@testing-library/user-event";
import { cleanup, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Button } from "../common/buttons/Button";
import { FinalForm } from "../FinalForm";
import { Field } from "../form/Field";
import { FinalFormInput } from "../form/FinalFormInput";
import { useEditDialog } from "./EditDialog";
import { EditDialogActions } from "./EditDialogActions";

describe("EditDialog", () => {
    describe("onAfterSave", () => {
        afterEach(cleanup);

        test("Should call onAfterSave when clicking save button", async () => {
            const user = userEvent.setup();
            const onAfterSave = vi.fn();

            function Story() {
                const [EditDialog, , editDialogApi] = useEditDialog();

                return (
                    <>
                        <Button variant="textDark" onClick={() => editDialogApi.openAddDialog()}>
                            Open dialog
                        </Button>
                        <EditDialog onAfterSave={onAfterSave}>
                            <FinalForm
                                mode="edit"
                                onSubmit={async () => {
                                    // noop
                                }}
                            >
                                <Field name="name" component={FinalFormInput} autoFocus />
                            </FinalForm>
                        </EditDialog>
                    </>
                );
            }

            const rendered = render(<Story />);

            await user.click(rendered.getByText("Open dialog"));

            // Edit dialog title -> dialog is open
            await rendered.findByText("Add");

            await user.keyboard("Test");

            await user.click(screen.getByText("Save"));

            await waitFor(() => expect(onAfterSave).toHaveBeenCalledTimes(1));
        });

        test("Should call onAfterSave when pressing Enter", async () => {
            const user = userEvent.setup();
            const onAfterSave = vi.fn();

            function Story() {
                const [EditDialog, , editDialogApi] = useEditDialog();

                return (
                    <>
                        <Button onClick={() => editDialogApi.openAddDialog()}>Open dialog</Button>
                        <EditDialog onAfterSave={onAfterSave}>
                            <FinalForm
                                mode="edit"
                                onSubmit={async () => {
                                    // noop
                                }}
                            >
                                <Field name="name" component={FinalFormInput} autoFocus />
                            </FinalForm>
                        </EditDialog>
                    </>
                );
            }

            const rendered = render(<Story />);

            await user.click(rendered.getByText("Open dialog"));

            // Edit dialog title -> dialog is open
            await rendered.findByText("Add");

            await user.keyboard("Test");

            await user.keyboard("{Enter}");

            await waitFor(() => expect(onAfterSave).toHaveBeenCalledTimes(1));
        });
    });

    describe("EditDialogActions", () => {
        afterEach(cleanup);

        function renderStory({ onSubmit, onAfterSave }: { onSubmit: () => Promise<void>; onAfterSave?: () => void }) {
            function Story() {
                const [EditDialog, , editDialogApi] = useEditDialog();

                return (
                    <>
                        <Button onClick={() => editDialogApi.openAddDialog()}>Open dialog</Button>
                        <EditDialog onAfterSave={onAfterSave} disableDialogActions>
                            <FinalForm mode="edit" onSubmit={onSubmit}>
                                <Field name="firstName" component={FinalFormInput} autoFocus />
                                <Field name="lastName" component={FinalFormInput} />
                                <EditDialogActions />
                            </FinalForm>
                        </EditDialog>
                    </>
                );
            }

            return render(<Story />);
        }

        test("Should save once when pressing Enter in a form with multiple fields", async () => {
            const user = userEvent.setup();
            const onSubmit = vi.fn(async () => {
                // noop
            });
            const onAfterSave = vi.fn();

            const rendered = renderStory({ onSubmit, onAfterSave });

            await user.click(rendered.getByText("Open dialog"));
            await rendered.findByText("Add");

            await user.keyboard("Test");
            await user.keyboard("{Enter}");

            await waitFor(() => expect(onAfterSave).toHaveBeenCalledTimes(1));
            expect(onSubmit).toHaveBeenCalledTimes(1);
        });

        test("Should save once when clicking save button", async () => {
            const user = userEvent.setup();
            const onSubmit = vi.fn(async () => {
                // noop
            });
            const onAfterSave = vi.fn();

            const rendered = renderStory({ onSubmit, onAfterSave });

            await user.click(rendered.getByText("Open dialog"));
            await rendered.findByText("Add");

            await user.keyboard("Test");
            await user.click(screen.getByText("Save"));

            await waitFor(() => expect(onAfterSave).toHaveBeenCalledTimes(1));
            expect(onSubmit).toHaveBeenCalledTimes(1);
        });

        test("Should render the actions only once", async () => {
            const user = userEvent.setup();

            const rendered = renderStory({
                onSubmit: async () => {
                    // noop
                },
            });

            await user.click(rendered.getByText("Open dialog"));
            await rendered.findByText("Add");

            expect(screen.getAllByRole("button", { name: "Save" })).toHaveLength(1);
            expect(screen.getAllByRole("button", { name: "Cancel" })).toHaveLength(1);
        });

        test("Should close the dialog when clicking cancel button", async () => {
            const user = userEvent.setup();

            const rendered = renderStory({
                onSubmit: async () => {
                    // noop
                },
            });

            await user.click(rendered.getByText("Open dialog"));
            await rendered.findByText("Add");

            await user.click(screen.getByRole("button", { name: "Cancel" }));

            await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        });
    });
});
