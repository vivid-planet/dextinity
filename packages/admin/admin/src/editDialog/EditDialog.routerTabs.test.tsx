import { Add, Edit } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import { DataGrid, type GridSlotsComponent } from "@mui/x-data-grid";
import { createMemoryHistory } from "history";
import { type ReactNode, type RefObject, useRef } from "react";
import { useIntl } from "react-intl";
import { Router } from "react-router";
import { cleanup, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { Button } from "../common/buttons/Button";
import { FillSpace } from "../common/FillSpace";
import { DataGridToolbar } from "../common/toolbar/DataGridToolbar";
import { FinalForm } from "../FinalForm";
import { TextField } from "../form/fields/TextField";
import { StackLink } from "../stack/StackLink";
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

    function EditDialogInRouterTabs() {
        const editDialogApi = useRef<IEditDialogApi>(null);

        return (
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
        );
    }

    afterEach(cleanup);

    it("should not open edit dialog when navigating to the products page", async () => {
        const history = createMemoryHistory({
            initialEntries: ["/", "/products"],
            initialIndex: 0,
        });

        const rendered = render(
            <Router history={history}>
                <EditDialogInRouterTabs />
            </Router>,
        );

        expect(history.location.pathname).toBe("/");
        rendered.getByText("Products").click();
        expect(screen.getByText("Products")).toBeInTheDocument();
        expect(history.location.pathname).toBe("/products");

        // Check that the Edit Dialog is not open, there was a bug that was fixed
        // where the edit dialog was open when navigating to a different tab
        expect(screen.queryByText("Add a new product")).not.toBeInTheDocument();
    });

    it("should open product add dialog when clicking on Add product button in grid toolbar", async () => {
        const history = createMemoryHistory({
            initialEntries: ["/", "/products"],
            initialIndex: 0,
        });

        const rendered = render(
            <Router history={history}>
                <EditDialogInRouterTabs />
            </Router>,
        );

        rendered.getByText("Products").click();
        await waitFor(() => {
            expect(screen.getByText("Products")).toBeInTheDocument();
        });

        expect(rendered.getByText("Add product")).toBeInTheDocument();
        rendered.getByText("Add product").click();
        await waitFor(() => {
            expect(screen.getByText("Add a new product")).toBeInTheDocument();
        });
    });

    it("should stay on the products page when closing the edit dialog", async () => {
        const history = createMemoryHistory({
            initialEntries: ["/", "/products"],
            initialIndex: 0,
        });

        const rendered = render(
            <Router history={history}>
                <EditDialogInRouterTabs />
            </Router>,
        );

        expect(history.location.pathname).toBe("/");
        expect(screen.getByText("Customers Page")).toBeInTheDocument();

        rendered.getByText("Products").click();
        await waitFor(() => {
            expect(rendered.getByText("Add product")).toBeInTheDocument();
        });
        expect(history.location.pathname).toBe("/products");

        rendered.getByText("Add product").click();
        await waitFor(() => {
            expect(screen.getByText("Add a new product")).toBeInTheDocument();
        });
        expect(history.location.pathname).toBe("/products/add");

        rendered.getByText("Cancel").click();

        // Check that the Edit Dialog is not open and user is still on
        // the products page, there was a bug where the user was navigated
        // back to the first tab after closing the edit dialog
        await waitFor(() => {
            expect(screen.queryByText("Add a new product")).not.toBeInTheDocument();
        });

        expect(history.location.pathname).toBe("/products");
        expect(screen.queryByText("Customers Page")).not.toBeInTheDocument();
    });
});
