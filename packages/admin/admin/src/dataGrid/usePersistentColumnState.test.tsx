import type { ReactNode } from "react";
import { Route, Routes } from "react-router";
import { cleanup, render } from "test-utils";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { useEditDialog } from "../editDialog/EditDialog";
import { StackPage } from "../stack/Page";
import { Stack } from "../stack/Stack";
import { StackSwitch } from "../stack/Switch";
import { RouterTab, RouterTabs } from "../tabs/RouterTabs";
import { usePersistentColumnState } from "./usePersistentColumnState";

function PersistedGrid({ stateKey }: { stateKey: string }) {
    usePersistentColumnState(stateKey);
    return null;
}

function getStoredColumnVisibilityKeys() {
    return Object.keys(window.localStorage)
        .filter((key) => key.endsWith("ColumnVisibility"))
        .map((key) => key.slice(0, -"ColumnVisibility".length));
}

function ProductsGridWithEditDialog() {
    const [EditDialog] = useEditDialog();
    return (
        <EditDialog>
            <PersistedGrid stateKey="DialogGrid" />
        </EditDialog>
    );
}

function ProductsStack() {
    return (
        <Stack topLevelTitle="Products">
            <StackSwitch>
                <StackPage name="list">
                    <PersistedGrid stateKey="ListGrid" />
                    <ProductsGridWithEditDialog />
                </StackPage>
                <StackPage name="edit">
                    <PersistedGrid stateKey="EditGrid" />
                    <RouterTabs>
                        <RouterTab label="Variants" path="">
                            <StackSwitch>
                                <StackPage name="variants">
                                    <PersistedGrid stateKey="VariantsGrid" />
                                </StackPage>
                                <StackPage name="variant">
                                    <PersistedGrid stateKey="VariantGrid" />
                                </StackPage>
                            </StackSwitch>
                        </RouterTab>
                        <RouterTab label="Stock" path="/stock">
                            <PersistedGrid stateKey="StockGrid" />
                        </RouterTab>
                    </RouterTabs>
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}

function renderAt(initialEntry: string, element: ReactNode) {
    return render(<Routes>{element}</Routes>, { initialEntries: [initialEntry] });
}

describe("usePersistentColumnState storage keys", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(cleanup);

    test("grid directly in a route uses the route's pattern", () => {
        renderAt("/categories/shoes", <Route path="categories/:category/*" element={<PersistedGrid stateKey="Grid" />} />);

        expect(getStoredColumnVisibilityKeys()).toEqual(["/categories/:categoryGrid"]);
    });

    test.each([
        { url: "/products", expectedKeys: ["/productsListGrid"] },
        { url: "/products/5/edit", expectedKeys: ["/products/:id/editEditGrid", "/products/5/editVariantsGrid"] },
        { url: "/products/5/edit/7/variant", expectedKeys: ["/products/:id/editEditGrid", "/products/5/edit/:id/variantVariantGrid"] },
        { url: "/products/5/edit/stock", expectedKeys: ["/products/:id/editEditGrid", "/products/5/edit/stockStockGrid"] },
    ])("grids in a Stack at $url keep the React Router v5 keys", ({ url, expectedKeys }) => {
        renderAt(url, <Route path="products/*" element={<ProductsStack />} />);

        expect(getStoredColumnVisibilityKeys().sort()).toEqual([...expectedKeys].sort());
    });

    test("grid in an EditDialog on a StackSwitch initial page uses the pattern of the selection URL, which includes the initial page's /index", () => {
        renderAt("/products/index/7", <Route path="products/*" element={<ProductsStack />} />);

        expect(getStoredColumnVisibilityKeys().sort()).toEqual(["/products/index/:idDialogGrid", "/productsListGrid"]);
    });

    test.each([
        { url: "/categories/shoes", expectedKeys: ["/categories/shoesListGrid"] },
        { url: "/categories/shoes/5/edit", expectedKeys: ["/categories/shoes/:id/editEditGrid", "/categories/shoes/5/editVariantsGrid"] },
        {
            url: "/categories/shoes/5/edit/7/variant",
            expectedKeys: ["/categories/shoes/:id/editEditGrid", "/categories/shoes/5/edit/:id/variantVariantGrid"],
        },
        { url: "/categories/shoes/5/edit/stock", expectedKeys: ["/categories/shoes/:id/editEditGrid", "/categories/shoes/5/edit/stockStockGrid"] },
    ])("grids in a Stack below a route with params at $url keep the React Router v5 keys", ({ url, expectedKeys }) => {
        renderAt(url, <Route path="categories/:category/*" element={<ProductsStack />} />);

        expect(getStoredColumnVisibilityKeys().sort()).toEqual([...expectedKeys].sort());
    });
});
