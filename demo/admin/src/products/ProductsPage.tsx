import {
    FieldSet,
    FillSpace,
    FullHeightContent,
    RouterTab,
    RouterTabs,
    SaveBoundary,
    SaveBoundarySaveButton,
    Stack,
    StackMainContent,
    StackPage,
    StackSwitch,
    StackToolbar,
    ToolbarActions,
    ToolbarAutomaticTitleItem,
    ToolbarBackButton,
    useStackSwitch,
} from "@comet/admin";
import { ActionLogButton, ContentScopeIndicator } from "@comet/cms-admin";
import type { GQLQuery } from "@src/graphql.generated";
import { useIntl } from "react-intl";

import { ProductForm } from "./ProductForm";
import { ProductPriceForm } from "./ProductPriceForm";
import { ProductsGrid } from "./ProductsGrid";
import { ProductVariantForm } from "./ProductVariantForm";
import { ProductVariantsGrid } from "./ProductVariantsGrid";

const FormToolbar = ({ id }: { id?: string }) => (
    <StackToolbar>
        <ToolbarBackButton />
        <ToolbarAutomaticTitleItem />
        <FillSpace />
        <ToolbarActions>
            {id && <ActionLogButton<GQLQuery> entityId={id} queryName="productActionLogs" />}
            <SaveBoundarySaveButton />
        </ToolbarActions>
    </StackToolbar>
);

const ProductsPage = () => {
    const intl = useIntl();

    const [ProductsStackSwitch, productsStackSwitchApi] = useStackSwitch();

    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "products.products", defaultMessage: "Products" })}>
            <ProductsStackSwitch initialPage="grid">
                <StackPage name="grid">
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />} />
                    <StackMainContent fullHeight>
                        <ProductsGrid />
                    </StackMainContent>
                </StackPage>
                <StackPage name="edit" title={intl.formatMessage({ id: "products.editProduct", defaultMessage: "Edit product" })}>
                    {(selectedProductId) => (
                        <SaveBoundary>
                            <FormToolbar id={selectedProductId} />
                            <StackMainContent>
                                <RouterTabs>
                                    <RouterTab
                                        forceRender={true}
                                        path=""
                                        label={intl.formatMessage({ id: "products.product", defaultMessage: "Product" })}
                                    >
                                        <FieldSet>
                                            <ProductForm id={selectedProductId} />
                                        </FieldSet>
                                    </RouterTab>
                                    <RouterTab
                                        forceRender={true}
                                        path="/price"
                                        label={intl.formatMessage({ id: "products.price", defaultMessage: "Price" })}
                                    >
                                        <FieldSet>
                                            <ProductPriceForm id={selectedProductId} />
                                        </FieldSet>
                                    </RouterTab>
                                    <RouterTab path="/variants" label={intl.formatMessage({ id: "products.variants", defaultMessage: "Variants" })}>
                                        <StackSwitch initialPage="table">
                                            <StackPage name="table">
                                                <FullHeightContent>
                                                    <ProductVariantsGrid productId={selectedProductId} />
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
                                                                <ProductVariantForm productId={selectedProductId} id={selectedProductVariantId} />
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
                                                            <ProductVariantForm productId={selectedProductId} />
                                                        </FieldSet>
                                                    </StackMainContent>
                                                </SaveBoundary>
                                            </StackPage>
                                        </StackSwitch>
                                    </RouterTab>
                                </RouterTabs>
                            </StackMainContent>
                        </SaveBoundary>
                    )}
                </StackPage>
                <StackPage name="add" title={intl.formatMessage({ id: "products.addProduct", defaultMessage: "Add product" })}>
                    <SaveBoundary>
                        <FormToolbar />
                        <StackMainContent>
                            <FieldSet>
                                <ProductForm
                                    onCreate={(id) => {
                                        productsStackSwitchApi.activatePage("edit", id);
                                    }}
                                />
                            </FieldSet>
                        </StackMainContent>
                    </SaveBoundary>
                </StackPage>
            </ProductsStackSwitch>
        </Stack>
    );
};

export default ProductsPage;
