import { Add, Edit } from "@dextinity/admin-icons";
import { DialogContent, IconButton, Typography } from "@mui/material";
import { DataGrid, type GridToolbarProps } from "@mui/x-data-grid";
import { type ReactNode, type RefObject, useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "../../common/buttons/Button";
import { FillSpace } from "../../common/FillSpace";
import { MainContent } from "../../common/MainContent";
import { ToolbarActions } from "../../common/toolbar/actions/ToolbarActions";
import { ToolbarAutomaticTitleItem } from "../../common/toolbar/automatictitleitem/ToolbarAutomaticTitleItem";
import { ToolbarBackButton } from "../../common/toolbar/backbutton/ToolbarBackButton";
import { DataGridToolbar } from "../../common/toolbar/DataGridToolbar";
import { StackToolbar } from "../../common/toolbar/StackToolbar";
import { FinalForm } from "../../FinalForm";
import { TextField } from "../../form/fields/TextField";
import { messages } from "../../messages";
import { SaveBoundary } from "../../saveBoundary/SaveBoundary";
import { SaveBoundarySaveButton } from "../../saveBoundary/SaveBoundarySaveButton";
import { StackPage } from "../../stack/Page";
import { Stack } from "../../stack/Stack";
import { StackLink } from "../../stack/StackLink";
import { StackSwitch } from "../../stack/Switch";
import { RouterTab, RouterTabs } from "../../tabs/RouterTabs";
import { EditDialog } from "../EditDialog";
import type { IEditDialogApi } from "../EditDialogApiContext";

export default {
    title: "components/edit-dialog",
};

const products = [
    { id: "0", name: "Product 1" },
    { id: "1", name: "Product 2" },
    { id: "2", name: "Product 3" },
    { id: "3", name: "Product 4" },
    { id: "4", name: "Product 5" },
];

const stocks = [
    { id: "0", productId: "0", amount: "1" },
    { id: "1", productId: "0", amount: "1" },
    { id: "2", productId: "0", amount: "1" },
    { id: "3", productId: "1", amount: "1" },
    { id: "4", productId: "1", amount: "1" },
    { id: "5", productId: "1", amount: "2" },
    { id: "6", productId: "1", amount: "2" },
    { id: "7", productId: "2", amount: "2" },
    { id: "8", productId: "2", amount: "2" },
    { id: "9", productId: "2", amount: "3" },
    { id: "10", productId: "3", amount: "3" },
    { id: "11", productId: "3", amount: "3" },
    { id: "12", productId: "3", amount: "3" },
    { id: "13", productId: "4", amount: "4" },
    { id: "14", productId: "4", amount: "4" },
    { id: "15", productId: "4", amount: "4" },
    { id: "16", productId: "4", amount: "4" },
    { id: "17", productId: "5", amount: "5" },
    { id: "18", productId: "5", amount: "5" },
    { id: "19", productId: "5", amount: "5" },
    { id: "20", productId: "5", amount: "5" },
];

type DialogProps = {
    dialogApiRef: RefObject<IEditDialogApi | null>;
};

const AddProductDialog = ({ dialogApiRef }: DialogProps) => {
    const intl = useIntl();

    return (
        <EditDialog
            ref={dialogApiRef}
            title={intl.formatMessage({ id: "addProductDialog.title", defaultMessage: "Add a new Product" })}
            componentsProps={{ dialog: { scroll: "paper", fullWidth: true } }}
        >
            {() => {
                return (
                    <DialogContent>
                        <FinalForm
                            mode="edit"
                            onSubmit={() => {
                                console.log("Submitted!");
                            }}
                            onAfterSubmit={() => {
                                dialogApiRef.current?.closeDialog();
                            }}
                        >
                            <TextField name="name" label="Name" fullWidth />
                        </FinalForm>
                    </DialogContent>
                );
            }}
        </EditDialog>
    );
};

const AddStocksDialog = ({ dialogApiRef }: DialogProps) => {
    const intl = useIntl();

    return (
        <EditDialog
            ref={dialogApiRef}
            title={intl.formatMessage({ id: "addStocksDialog.title", defaultMessage: "Add a new Stock entry" })}
            componentsProps={{ dialog: { scroll: "paper", fullWidth: true } }}
        >
            {() => {
                return (
                    <DialogContent>
                        <FinalForm
                            mode="edit"
                            onSubmit={() => {
                                console.log("Submitted!");
                            }}
                            onAfterSubmit={() => {
                                dialogApiRef.current?.closeDialog();
                            }}
                        >
                            <TextField name="amount" label="Amount" fullWidth />
                        </FinalForm>
                    </DialogContent>
                );
            }}
        </EditDialog>
    );
};

interface ToolbarProps extends GridToolbarProps {
    toolbarAction?: ReactNode;
}

function Toolbar({ toolbarAction }: ToolbarProps) {
    return (
        <DataGridToolbar>
            <Typography>
                <FormattedMessage
                    id="toolbar.helperText"
                    defaultMessage="Navigate to the Router Tabs with the edit button. Try to add new Stocks there."
                />
            </Typography>
            <FillSpace />
            {toolbarAction}
        </DataGridToolbar>
    );
}

type ProductDetailsProps = {
    productId: string;
};

const ProductDetailsPage = ({ productId }: ProductDetailsProps) => {
    const intl = useIntl();
    const editDialogApi = useRef<IEditDialogApi>(null);

    const rows: { id: string; productId: string; amount: string }[] = [];
    stocks.forEach((row) => {
        if (row.productId === productId) {
            rows.push(row);
        }
    });

    return (
        <RouterTabs>
            <RouterTab forceRender={true} path="" label={intl.formatMessage({ id: "products.details", defaultMessage: "Details" })}>
                <MainContent fullHeight disablePadding>
                    <FinalForm
                        mode="edit"
                        onSubmit={() => {
                            console.log("Submitted!");
                        }}
                        initialValues={{ name: products[Number(productId)].name }}
                    >
                        <TextField name="name" label="Name" fullWidth />
                    </FinalForm>
                </MainContent>
            </RouterTab>
            <RouterTab forceRender={true} path="/stocks" label={intl.formatMessage({ id: "products.stocks", defaultMessage: "Stocks" })}>
                <StackSwitch initialPage="stocks">
                    <StackPage name="stocks">
                        <AddStocksDialog dialogApiRef={editDialogApi} />
                        <MainContent fullHeight>
                            <DataGrid
                                columns={[
                                    { field: "id", headerName: "ID", width: 90 },
                                    { field: "amount", headerName: "Amount", flex: 1 },
                                    {
                                        field: "actions",
                                        headerName: "",
                                        sortable: false,
                                        filterable: false,
                                        type: "actions",
                                        align: "right",
                                        width: 86,
                                        renderCell: (params) => {
                                            return (
                                                <IconButton color="primary" component={StackLink} pageName="stocksEdit" payload={params.row.id}>
                                                    <Edit />
                                                </IconButton>
                                            );
                                        },
                                    },
                                ]}
                                rows={rows}
                                slots={{
                                    toolbar: Toolbar,
                                }}
                                slotProps={{
                                    toolbar: {
                                        toolbarAction: (
                                            <Button startIcon={<Add />} onClick={() => editDialogApi.current?.openAddDialog()}>
                                                <FormattedMessage {...messages.add} />
                                            </Button>
                                        ),
                                    } as ToolbarProps,
                                }}
                                showToolbar
                            />
                        </MainContent>
                    </StackPage>
                    <StackPage name="stocksEdit" title={intl.formatMessage({ id: "products.editStocks", defaultMessage: "Edit Stocks" })}>
                        {(selectedStockId: string) => (
                            <SaveBoundary>
                                <MainContent fullHeight disablePadding>
                                    <StackToolbar>
                                        <ToolbarBackButton />
                                        <ToolbarAutomaticTitleItem />
                                        <FillSpace />
                                        <ToolbarActions>
                                            <SaveBoundarySaveButton />
                                        </ToolbarActions>
                                    </StackToolbar>
                                    <FinalForm
                                        mode="edit"
                                        onSubmit={() => {
                                            console.log("Submitted!");
                                        }}
                                        initialValues={{ amount: stocks[Number(selectedStockId)].amount }}
                                    >
                                        <TextField name="amount" label="Amount" fullWidth />
                                    </FinalForm>
                                </MainContent>
                            </SaveBoundary>
                        )}
                    </StackPage>
                </StackSwitch>
            </RouterTab>
        </RouterTabs>
    );
};

export function EditDialogInRouterTabsWithinStack() {
    const editDialogApi = useRef<IEditDialogApi>(null);

    return (
        <>
            <Stack topLevelTitle="Products Page">
                <StackSwitch initialPage="productsGrid">
                    <StackPage name="productsGrid">
                        <MainContent fullHeight disablePadding>
                            <DataGrid
                                columns={[
                                    { field: "id", headerName: "ID", width: 90 },
                                    { field: "name", headerName: "Name", flex: 1 },
                                    {
                                        field: "actions",
                                        headerName: "",
                                        sortable: false,
                                        filterable: false,
                                        type: "actions",
                                        align: "right",
                                        width: 86,
                                        renderCell: (params) => {
                                            return (
                                                <IconButton color="primary" component={StackLink} pageName="productEdit" payload={params.row.id}>
                                                    <Edit />
                                                </IconButton>
                                            );
                                        },
                                    },
                                ]}
                                rows={products}
                                slots={{
                                    toolbar: Toolbar,
                                }}
                                slotProps={{
                                    toolbar: {
                                        toolbarAction: (
                                            <Button startIcon={<Add />} onClick={() => editDialogApi.current?.openAddDialog()}>
                                                <FormattedMessage {...messages.add} />
                                            </Button>
                                        ),
                                    } as ToolbarProps,
                                }}
                                showToolbar
                            />
                        </MainContent>
                    </StackPage>
                    <StackPage name="productEdit" title="Product">
                        {(productId: string) => (
                            <MainContent fullHeight disablePadding>
                                <SaveBoundary>
                                    <StackToolbar>
                                        <ToolbarBackButton />
                                        <ToolbarAutomaticTitleItem />
                                        <FillSpace />
                                        <ToolbarActions>
                                            <SaveBoundarySaveButton />
                                        </ToolbarActions>
                                    </StackToolbar>
                                    <ProductDetailsPage productId={productId} />
                                </SaveBoundary>
                            </MainContent>
                        )}
                    </StackPage>
                </StackSwitch>
            </Stack>
            <AddProductDialog dialogApiRef={editDialogApi} />
        </>
    );
}
