import { Add, Edit } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import { DataGrid, type GridSlotsComponent } from "@mui/x-data-grid";
import { createMemoryHistory } from "history";
import { type ReactNode, type RefObject, useRef } from "react";
import { useIntl } from "react-intl";
import { Router } from "react-router";
import { render, screen, waitFor, within } from "test-utils";
import { describe, expect, it } from "vitest";

import { Button } from "../common/buttons/Button";
import { FillSpace } from "../common/FillSpace";
import { MainContent } from "../common/MainContent";
import { ToolbarActions } from "../common/toolbar/actions/ToolbarActions";
import { ToolbarAutomaticTitleItem } from "../common/toolbar/automatictitleitem/ToolbarAutomaticTitleItem";
import { ToolbarBackButton } from "../common/toolbar/backbutton/ToolbarBackButton";
import { DataGridToolbar } from "../common/toolbar/DataGridToolbar";
import { ToolbarFillSpace } from "../common/toolbar/fillspace/ToolbarFillSpace";
import { StackToolbar } from "../common/toolbar/StackToolbar";
import { FinalForm } from "../FinalForm";
import { TextField } from "../form/fields/TextField";
import { SaveBoundary } from "../saveBoundary/SaveBoundary";
import { SaveBoundarySaveButton } from "../saveBoundary/SaveBoundarySaveButton";
import { StackPage } from "../stack/Page";
import { Stack } from "../stack/Stack";
import { StackLink } from "../stack/StackLink";
import { StackSwitch } from "../stack/Switch";
import { RouterTab, RouterTabs } from "../tabs/RouterTabs";
import { EditDialog } from "./EditDialog";
import type { IEditDialogApi } from "./EditDialogApiContext";

describe("EditDialog with Stack, Router Tabs and Grid", () => {
    type DialogProps = {
        dialogApiRef: RefObject<IEditDialogApi | null>;
    };

    const AddProductDialog = ({ dialogApiRef }: DialogProps) => {
        const intl = useIntl();

        return (
            <EditDialog
                ref={dialogApiRef}
                title={intl.formatMessage({ id: "addProductDialog.title", defaultMessage: "Add a new product" })}
                componentsProps={{ dialog: { scroll: "paper", fullWidth: true } }}
            >
                {() => {
                    return (
                        <FinalForm
                            mode="add"
                            onSubmit={() => {
                                // console.log("Submitted!");
                            }}
                        >
                            <TextField name="name" label="Name" fullWidth />
                        </FinalForm>
                    );
                }}
            </EditDialog>
        );
    };

    type ToolbarProps = {
        toolbarAction?: ReactNode;
    };

    function Toolbar({ toolbarAction }: ToolbarProps) {
        return (
            <DataGridToolbar>
                <FillSpace />
                {toolbarAction}
            </DataGridToolbar>
        );
    }

    function EditDialogInStackTabs() {
        const editDialogApi = useRef<IEditDialogApi>(null);

        return (
            <Stack topLevelTitle="Nested Stack">
                <StackSwitch>
                    <StackPage name="products">
                        <RouterTabs>
                            <RouterTab label="Customers" path="">
                                Customers Page
                            </RouterTab>
                            <RouterTab label="Products" path="/products">
                                <AddProductDialog dialogApiRef={editDialogApi} />

                                <DataGrid
                                    columns={[
                                        { field: "id", headerName: "ID", width: 90 },
                                        {
                                            field: "actions",
                                            type: "actions",
                                            headerName: "",
                                            sortable: false,
                                            filterable: false,
                                            align: "right",
                                            width: 86,
                                            renderCell: (params) => {
                                                return (
                                                    <IconButton
                                                        data-testid="edit.row"
                                                        color="primary"
                                                        component={StackLink}
                                                        pageName="productEdit"
                                                        payload={params.row.id}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                );
                                            },
                                        },
                                    ]}
                                    rows={[
                                        { id: "0", productId: "0" },
                                        { id: "1", productId: "0" },
                                        { id: "2", productId: "0" },
                                        { id: "3", productId: "1" },
                                        { id: "4", productId: "1" },
                                        { id: "5", productId: "1" },
                                    ]}
                                    slots={{
                                        toolbar: Toolbar as GridSlotsComponent["toolbar"],
                                    }}
                                    slotProps={{
                                        toolbar: {
                                            toolbarAction: (
                                                <Button startIcon={<Add />} onClick={() => editDialogApi.current?.openAddDialog()}>
                                                    Add product
                                                </Button>
                                            ),
                                        } as ToolbarProps,
                                    }}
                                    disableVirtualization
                                    showToolbar
                                />
                            </RouterTab>
                        </RouterTabs>
                    </StackPage>
                    <StackPage name="productEdit" title="Product">
                        {() => (
                            <MainContent fullHeight disablePadding>
                                <SaveBoundary>
                                    <StackToolbar>
                                        <ToolbarBackButton data-testid="editPage.backButton" />
                                        <ToolbarAutomaticTitleItem />
                                        <ToolbarFillSpace />
                                        <ToolbarActions>
                                            <SaveBoundarySaveButton />
                                        </ToolbarActions>
                                    </StackToolbar>
                                    <div>Product Edit Page</div>
                                </SaveBoundary>
                            </MainContent>
                        )}
                    </StackPage>
                </StackSwitch>
            </Stack>
        );
    }

    it("should not open edit dialog when navigating back to products page", async () => {
        const history = createMemoryHistory();

        const rendered = render(
            <Router history={history}>
                <EditDialogInStackTabs />
            </Router>,
        );

        rendered.getByText("Products").click();

        await waitFor(() => {
            expect(rendered.queryAllByTestId("edit.row")).toHaveLength(6);
        });
        rendered.queryAllByTestId("edit.row")[5].click();

        expect(history.location.pathname).toBe("/5/productEdit");
        await waitFor(() => {
            expect(rendered.getByTestId("editPage.backButton")).toBeInTheDocument();
        });
        within(rendered.getByTestId("editPage.backButton")).getByRole("link").click();
        await waitFor(() => {
            expect(screen.getByText("Products")).toBeInTheDocument();
        });
        expect(history.location.pathname).toBe("/index/products");

        // Check that the Edit Dialog is not open, there was a bug that was fixed
        // where the edit dialog was open when navigating to a page
        // with an edit dialog component
        expect(screen.queryByText("Add a new product")).not.toBeInTheDocument();
    });
});
