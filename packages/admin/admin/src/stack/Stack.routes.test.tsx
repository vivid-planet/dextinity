import { Link, Navigate, Route, Routes, useNavigate, useParams, useResolvedPath } from "react-router";
import { cleanup, fireEvent, render } from "test-utils";
import { afterEach, expect, test } from "vitest";

import { StackPage } from "./Page";
import { Stack } from "./Stack";
import { StackLink } from "./StackLink";
import { StackSwitch } from "./Switch";

afterEach(cleanup);

function ProductEditPage({ id }: { id: string }) {
    const params = useParams();
    const resolvedPath = useResolvedPath(".");
    const navigate = useNavigate();
    return (
        <>
            <p>
                page id={id} param id={params.id} url={resolvedPath.pathname}
            </p>
            <Link to="details">details link</Link>
            <button type="button" onClick={() => navigate("..")}>
                back to list
            </button>
            <Routes>
                <Route index element={<p>overview content</p>} />
                <Route path="details/*" element={<p>details content</p>} />
                <Route path="old-details" element={<Navigate to="../details" replace />} />
            </Routes>
        </>
    );
}

function ProductsStack() {
    return (
        <Stack topLevelTitle="Products">
            <StackSwitch>
                <StackPage name="list">
                    <p>product list</p>
                    <StackLink pageName="edit" payload="5">
                        edit link
                    </StackLink>
                </StackPage>
                <StackPage name="edit">{(id) => <ProductEditPage id={id} />}</StackPage>
            </StackSwitch>
        </Stack>
    );
}

function renderProductsStack(initialEntry: string) {
    return render(
        <Routes>
            <Route path="products/*" element={<ProductsStack />} />
        </Routes>,
        { initialEntries: [initialEntry] },
    );
}

test("native routes inside a StackPage are relative to the page", async () => {
    const rendered = renderProductsStack("/products");

    expect(rendered.getByText("edit link")).toHaveAttribute("href", "/products/5/edit");

    fireEvent.click(rendered.getByText("edit link"));

    expect(await rendered.findByText("page id=5 param id=5 url=/products/5/edit")).toBeInTheDocument();
    expect(rendered.getByText("overview content")).toBeInTheDocument();
    expect(rendered.getByText("details link")).toHaveAttribute("href", "/products/5/edit/details");

    fireEvent.click(rendered.getByText("details link"));

    expect(await rendered.findByText("details content")).toBeInTheDocument();
    expect(rendered.queryByText("overview content")).not.toBeInTheDocument();
    expect(rendered.getByText("page id=5 param id=5 url=/products/5/edit")).toBeInTheDocument();
});

test("relative navigation inside a StackPage resolves against the page", async () => {
    const rendered = renderProductsStack("/products/5/edit/old-details");

    expect(await rendered.findByText("details content")).toBeInTheDocument();

    fireEvent.click(rendered.getByText("back to list"));

    expect(await rendered.findByText("product list")).toBeInTheDocument();
});
