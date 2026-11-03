import type { ReactNode } from "react";
import { Link, Route, Routes, useParams, useResolvedPath } from "react-router";
import { cleanup, fireEvent, render } from "test-utils";
import { afterEach, expect, test } from "vitest";

import { useSelectionRoute } from "./SelectionRoute";
import { StackPage } from "./stack/Page";
import { Stack } from "./stack/Stack";
import { StackSwitch } from "./stack/Switch";

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
