# useStackSwitch - Programmatic Navigation

`useStackSwitch` is a lower-level API that replaces `<StackSwitch>` with a hook, giving the **page component** direct access to `activatePage`. Prefer `StackSwitch` with `StackLink` for standard navigation.

> **`useStackSwitch` vs `useStackSwitchApi`:** Most redirect-after-create cases are handled inside the **form component** using `useStackSwitchApi()`, which accesses an existing parent `StackSwitch` (see pattern 03). Use `useStackSwitch()` only when you need programmatic navigation from the **page component** itself (e.g., passing an `onCreate` callback to the form).

Example from `demo/admin/src/products/ProductsPage.tsx`:

```tsx
import {
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

const ProductsPage = () => {
    const [ProductsStackSwitch, productsStackSwitchApi] = useStackSwitch();

    return (
        <Stack topLevelTitle={<FormattedMessage id="products.products" defaultMessage="Products" />}>
            <ProductsStackSwitch initialPage="grid">
                <StackPage name="grid">
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                        <ToolbarBackButton />
                        <ToolbarAutomaticTitleItem />
                    </StackToolbar>
                    <StackMainContent fullHeight>
                        <ProductsGrid />
                    </StackMainContent>
                </StackPage>
                <StackPage name="edit" title={<FormattedMessage id="products.editProduct" defaultMessage="Edit product" />}>
                    {(selectedProductId) => (
                        <SaveBoundary>
                            <FormToolbar />
                            <StackMainContent>
                                <RouterTabs>
                                    <RouterTab forceRender={true} path="" label="Product">
                                        <ProductForm id={selectedProductId} />
                                    </RouterTab>
                                    <RouterTab forceRender={true} path="/price" label="Price">
                                        <ProductPriceForm id={selectedProductId} />
                                    </RouterTab>
                                    <RouterTab path="/variants" label="Variants">
                                        <StackSwitch initialPage="table">
                                            <StackPage name="table">
                                                <FullHeightContent>
                                                    <ProductVariantsGrid productId={selectedProductId} />
                                                </FullHeightContent>
                                            </StackPage>
                                            <StackPage
                                                name="edit"
                                                title={<FormattedMessage id="products.editVariant" defaultMessage="Edit Variant" />}
                                            >
                                                {(variantId) => (
                                                    <SaveBoundary>
                                                        <FormToolbar />
                                                        <StackMainContent>
                                                            <ProductVariantForm productId={selectedProductId} id={variantId} />
                                                        </StackMainContent>
                                                    </SaveBoundary>
                                                )}
                                            </StackPage>
                                            <StackPage name="add" title={<FormattedMessage id="products.addVariant" defaultMessage="Add Variant" />}>
                                                <SaveBoundary>
                                                    <FormToolbar />
                                                    <StackMainContent>
                                                        <ProductVariantForm productId={selectedProductId} />
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
                <StackPage name="add" title={<FormattedMessage id="products.addProduct" defaultMessage="Add product" />}>
                    <SaveBoundary>
                        <FormToolbar />
                        <StackMainContent>
                            <ProductForm
                                onCreate={(id) => {
                                    productsStackSwitchApi.activatePage("edit", id);
                                }}
                            />
                        </StackMainContent>
                    </SaveBoundary>
                </StackPage>
            </ProductsStackSwitch>
        </Stack>
    );
};
```

Key takeaways:

- `useStackSwitch()` returns `[Component, api]` for programmatic navigation (e.g., redirect after create)
- `productsStackSwitchApi.activatePage("edit", id)` navigates programmatically — use this only when `StackLink` isn't possible (e.g., after a mutation)
- `forceRender={true}` on form tabs ensures form state persists when switching tabs within the same `SaveBoundary`
- Variants tab does NOT use `forceRender` because it contains a nested `StackSwitch` (not a form)
- Each nested `SaveBoundary` scope is independent (variant forms have their own save)
- `initialPage="grid"` or `initialPage="table"` sets the default page
