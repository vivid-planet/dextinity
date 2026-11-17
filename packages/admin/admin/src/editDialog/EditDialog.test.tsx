import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { type Location, Route, Routes } from "react-router";
import { cleanup, LocationSpy, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Button } from "../common/buttons/Button";
import { FinalForm } from "../FinalForm";
import { Field } from "../form/Field";
import { FinalFormInput } from "../form/FinalFormInput";
import { StackPage } from "../stack/Page";
import { Stack } from "../stack/Stack";
import { StackSwitch } from "../stack/Switch";
import { useEditDialog } from "./EditDialog";

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

    describe("closing a dirty dialog", () => {
        afterEach(cleanup);

        function ProductsGrid() {
            const [EditDialog, , editDialogApi] = useEditDialog();
            return (
                <>
                    <Button onClick={() => editDialogApi.openAddDialog()}>Open dialog</Button>
                    <EditDialog>
                        <FinalForm
                            mode="add"
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

        async function expectCancelToAskBeforeDiscarding({
            productsElement,
            dialogUrl,
            productsUrl,
        }: {
            productsElement: ReactNode;
            dialogUrl: string;
            productsUrl: string;
        }) {
            const user = userEvent.setup();
            let currentLocation: Location | undefined;
            const rendered = render(
                <>
                    <Routes>
                        <Route path="products/*" element={productsElement} />
                    </Routes>
                    <LocationSpy
                        onChange={(location) => {
                            currentLocation = location;
                        }}
                    />
                </>,
                { initialEntries: ["/products"] },
            );

            await user.click(rendered.getByText("Open dialog"));
            await rendered.findByText("Add");
            expect(currentLocation?.pathname).toBe(dialogUrl);

            await user.keyboard("Test");
            await user.click(rendered.getByText("Cancel"));

            expect(await rendered.findByText("Discard")).toBeInTheDocument();
            expect(currentLocation?.pathname).toBe(dialogUrl);

            await user.click(rendered.getByText("Discard"));

            await waitFor(() => {
                expect(currentLocation?.pathname).toBe(productsUrl);
            });
        }

        test("asks before discarding the changes", async () => {
            await expectCancelToAskBeforeDiscarding({
                productsElement: <ProductsGrid />,
                dialogUrl: "/products/add",
                productsUrl: "/products",
            });
        });

        test("asks before discarding the changes on a StackSwitch initial page", async () => {
            await expectCancelToAskBeforeDiscarding({
                productsElement: (
                    <Stack topLevelTitle="Products">
                        <StackSwitch>
                            <StackPage name="grid">
                                <ProductsGrid />
                            </StackPage>
                            <StackPage name="edit">edit page</StackPage>
                        </StackSwitch>
                    </Stack>
                ),
                dialogUrl: "/products/index/add",
                productsUrl: "/products/index",
            });
        });
    });
});
