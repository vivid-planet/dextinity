import type { ReactNode } from "react";
import { Link, Route, Routes, useParams, useResolvedPath } from "react-router";
import { cleanup, fireEvent, LocationSpy, render, waitFor } from "test-utils";
import { afterEach, expect, test } from "vitest";

import { useSelectionRoute } from "./SelectionRoute";
import { StackPage } from "./stack/Page";
import { Stack } from "./stack/Stack";
import { StackSwitch } from "./stack/Switch";
import { RouterTab, RouterTabs } from "./tabs/RouterTabs";

afterEach(cleanup);

function SelectedProduct() {
    const resolvedPath = useResolvedPath(".");
    const params = useParams();
    return (
        <>
            <p>
                selection url={resolvedPath.pathname} param id={params.id}
            </p>
            <Link to="stock">stock link</Link>
            <Routes>
                <Route path="stock/*" element={<p>stock content</p>} />
            </Routes>
        </>
    );
}

function Products() {
    const [SelectionRoute, selection, selectionApi] = useSelectionRoute();
    return (
        <SelectionRoute>
            <button type="button" onClick={() => selectionApi.handleSelectId("7")}>
                select product
            </button>
            {selection.id && <p>selected id={selection.id}</p>}
            {selection.id && <SelectedProduct />}
        </SelectionRoute>
    );
}

function ProductsStack({ initialPage }: { initialPage: ReactNode }) {
    return (
        <Stack topLevelTitle="Products">
            <StackSwitch>
                <StackPage name="grid">{initialPage}</StackPage>
                <StackPage name="edit">edit page</StackPage>
            </StackSwitch>
        </Stack>
    );
}

function renderInProductsRoute(element: ReactNode, initialEntry = "/products") {
    return render(
        <Routes>
            <Route path="products/*" element={element} />
        </Routes>,
        { initialEntries: [initialEntry] },
    );
}

test("native routes inside a SelectionRoute are relative to the selection", async () => {
    const rendered = renderInProductsRoute(<Products />);

    fireEvent.click(rendered.getByText("select product"));

    expect(await rendered.findByText("selection url=/products/7 param id=7")).toBeInTheDocument();
    expect(rendered.getByText("stock link")).toHaveAttribute("href", "/products/7/stock");

    fireEvent.click(rendered.getByText("stock link"));

    expect(await rendered.findByText("stock content")).toBeInTheDocument();
    expect(rendered.getByText("selected id=7")).toBeInTheDocument();
});

test("native routes inside a SelectionRoute on a StackSwitch initial page are relative to the selection", async () => {
    const rendered = renderInProductsRoute(<ProductsStack initialPage={<Products />} />);

    fireEvent.click(rendered.getByText("select product"));

    expect(await rendered.findByText("selection url=/products/index/7 param id=7")).toBeInTheDocument();
    expect(rendered.getByText("stock link")).toHaveAttribute("href", "/products/index/7/stock");

    fireEvent.click(rendered.getByText("stock link"));

    expect(await rendered.findByText("stock content")).toBeInTheDocument();
    expect(rendered.getByText("selected id=7")).toBeInTheDocument();
});

test("RouterTabs inside a SelectionRoute on a StackSwitch initial page build their URLs below the selection", async () => {
    function ProductsWithTabs() {
        const [SelectionRoute, selection, selectionApi] = useSelectionRoute();
        return (
            <SelectionRoute>
                <button type="button" onClick={() => selectionApi.handleSelectId("7")}>
                    select product
                </button>
                {selection.id && (
                    <>
                        <p>selected id={selection.id}</p>
                        <RouterTabs>
                            <RouterTab label="Details" path="">
                                details content
                            </RouterTab>
                            <RouterTab label="Variants" path="/variants">
                                variants content
                            </RouterTab>
                        </RouterTabs>
                    </>
                )}
            </SelectionRoute>
        );
    }

    let pathname: string | undefined;
    const rendered = renderInProductsRoute(
        <>
            <ProductsStack initialPage={<ProductsWithTabs />} />
            <LocationSpy
                onChange={(location) => {
                    pathname = location.pathname;
                }}
            />
        </>,
    );

    fireEvent.click(rendered.getByText("select product"));

    expect(await rendered.findByText("details content")).toBeInTheDocument();
    await waitFor(() => expect(pathname).toBe("/products/index/7"));

    fireEvent.click(rendered.getByRole("tab", { name: "Variants" }));

    expect(await rendered.findByText("variants content")).toBeInTheDocument();
    await waitFor(() => expect(pathname).toBe("/products/index/7/variants"));
    expect(rendered.getByText("selected id=7")).toBeInTheDocument();

    fireEvent.click(rendered.getByRole("tab", { name: "Details" }));

    expect(await rendered.findByText("details content")).toBeInTheDocument();
    await waitFor(() => expect(pathname).toBe("/products/index/7"));
});

test("a SelectionRoute rendered below a deeper SubRoute than its hook keeps the hook's selection as its route", async () => {
    function ProductsWithSelectionOnInitialPage() {
        const [SelectionRoute, selection, selectionApi] = useSelectionRoute();
        return (
            <>
                <button type="button" onClick={() => selectionApi.handleSelectId("7")}>
                    select product
                </button>
                <ProductsStack
                    initialPage={
                        <SelectionRoute>
                            {selection.id && <p>selected id={selection.id}</p>}
                            {selection.id && <SelectedProduct />}
                        </SelectionRoute>
                    }
                />
            </>
        );
    }

    const rendered = renderInProductsRoute(<ProductsWithSelectionOnInitialPage />);

    fireEvent.click(rendered.getByText("select product"));

    expect(await rendered.findByText("selection url=/products/7 param id=7")).toBeInTheDocument();
    expect(rendered.getByText("stock link")).toHaveAttribute("href", "/products/7/stock");

    fireEvent.click(rendered.getByText("stock link"));

    expect(await rendered.findByText("stock content")).toBeInTheDocument();
    expect(rendered.getByText("selected id=7")).toBeInTheDocument();
});
