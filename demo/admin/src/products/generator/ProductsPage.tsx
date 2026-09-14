import {
    Button,
    FieldSet,
    FillSpace,
    FullHeightContent,
    MainContent,
    RouterTab,
    RouterTabs,
    SaveBoundary,
    SaveBoundarySaveButton,
    Stack,
    StackLink,
    StackMainContent,
    StackPage,
    StackToolbar,
    ToolbarActions,
    ToolbarAutomaticTitleItem,
    ToolbarBackButton,
    useStackSwitch,
} from "@dextinity/admin";
import { Add as AddIcon, Edit } from "@dextinity/admin-icons";
import { ContentScopeIndicator } from "@dextinity/cms-admin";
import { IconButton } from "@mui/material";
import { ProductVariantsGrid } from "@src/products/generator/generated/ProductVariantsGrid";
import { FormattedMessage, useIntl } from "react-intl";

import { ProductForm } from "./generated/ProductForm";
import { ProductPriceForm } from "./generated/ProductPriceForm";
import { ProductsGrid } from "./generated/ProductsGrid";
import { ProductVariantForm } from "./generated/ProductVariantForm";

const FormToolbar = () => (
    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
        <ToolbarBackButton />
        <ToolbarAutomaticTitleItem />
        <FillSpace />
        <ToolbarActions>
            <SaveBoundarySaveButton />
        </ToolbarActions>
    </StackToolbar>
);

export function ProductsPage() {
    const intl = useIntl();
    const [ProductsStackSwitch, productsStackSwitchApi] = useStackSwitch();
    const [ProductVariantsStackSwitch, productVariantsStackSwitchApi] = useStackSwitch();

    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "products.products", defaultMessage: "Products" })}>
            <ProductsStackSwitch>
                <StackPage name="grid">
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />} />
                    <StackMainContent fullHeight>
                        <ProductsGrid
                            toolbarAction={
                                <Button responsive startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add">
                                    <FormattedMessage id="product.newProduct" defaultMessage="New Product" />
                                </Button>
                            }
                            rowAction={(params) => (
                                <IconButton color="primary" component={StackLink} pageName="edit" payload={params.row.id}>
                                    <Edit />
                                </IconButton>
                            )}
                            actionsColumnWidth={116}
                            onRowClick={(params) => {
                                productsStackSwitchApi.activatePage("edit", params.row.id);
                            }}
                        />
                    </StackMainContent>
                </StackPage>
                <StackPage name="edit" title={intl.formatMessage({ id: "products.editProduct", defaultMessage: "Edit product" })}>
                    {(selectedProductId) => (
                        <SaveBoundary>
                            <>
                                <FormToolbar />
                                <StackMainContent>
                                    <RouterTabs>
                                        <RouterTab
                                            forceRender={true}
                                            path=""
                                            label={intl.formatMessage({ id: "products.product", defaultMessage: "Product" })}
                                        >
                                            <ProductForm id={selectedProductId} manufacturerCountry="DE" />
                                        </RouterTab>
                                        <RouterTab
                                            forceRender={true}
                                            path="/price"
                                            label={intl.formatMessage({ id: "products.price", defaultMessage: "Price" })}
                                        >
                                            <ProductPriceForm id={selectedProductId} />
                                        </RouterTab>
                                        <RouterTab
                                            path="/variants"
                                            label={intl.formatMessage({ id: "products.variants", defaultMessage: "Variants" })}
                                        >
                                            <ProductVariantsStackSwitch initialPage="table">
                                                <StackPage name="table">
                                                    <FullHeightContent>
                                                        <ProductVariantsGrid product={selectedProductId} />
                                                    </FullHeightContent>
                                                </StackPage>
                                                <StackPage
                                                    name="edit"
                                                    title={intl.formatMessage({
                                                        id: "products.editProductVariant",
                                                        defaultMessage: "Edit Product Variant",
                                                    })}
                                                >
                                                    {(selectedProductVariantId) => (
                                                        <SaveBoundary>
                                                            <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                                                                <ToolbarBackButton />
                                                                <ToolbarAutomaticTitleItem />
                                                                <FillSpace />
                                                                <ToolbarActions>
                                                                    <SaveBoundarySaveButton />
                                                                </ToolbarActions>
                                                            </StackToolbar>
                                                            <StackMainContent>
                                                                <FieldSet>
                                                                    <ProductVariantForm product={selectedProductId} id={selectedProductVariantId} />
                                                                </FieldSet>
                                                            </StackMainContent>
                                                        </SaveBoundary>
                                                    )}
                                                </StackPage>
                                                <StackPage
                                                    name="add"
                                                    title={intl.formatMessage({
                                                        id: "products.addProductVariant",
                                                        defaultMessage: "Add Product Variant",
                                                    })}
                                                >
                                                    <SaveBoundary>
                                                        <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                                                            <ToolbarBackButton />
                                                            <ToolbarAutomaticTitleItem />
                                                            <FillSpace />
                                                            <ToolbarActions>
                                                                <SaveBoundarySaveButton />
                                                            </ToolbarActions>
                                                        </StackToolbar>
                                                        <StackMainContent>
                                                            <FieldSet>
                                                                <ProductVariantForm
                                                                    product={selectedProductId}
                                                                    onCreate={(id) => {
                                                                        productVariantsStackSwitchApi.activatePage("edit", id);
                                                                    }}
                                                                />
                                                            </FieldSet>
                                                        </StackMainContent>
                                                    </SaveBoundary>
                                                </StackPage>
                                            </ProductVariantsStackSwitch>
                                        </RouterTab>
                                    </RouterTabs>
                                </StackMainContent>
                            </>
                        </SaveBoundary>
                    )}
                </StackPage>
                <StackPage name="add" title={intl.formatMessage({ id: "products.addProduct", defaultMessage: "Add product" })}>
                    <SaveBoundary>
                        <FormToolbar />
                        <MainContent>
                            <ProductForm
                                manufacturerCountry="DE"
                                initialValues={{
                                    lastCheckedAt: new Date(),
                                }}
                                onCreate={(id) => {
                                    productsStackSwitchApi.activatePage("edit", id);
                                }}
                            />
                        </MainContent>
                    </SaveBoundary>
                </StackPage>
            </ProductsStackSwitch>
        </Stack>
    );
}
