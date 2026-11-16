import { Link, type Location, Route, Routes } from "react-router";
import { cleanup, fireEvent, LocationSpy, render, waitFor } from "test-utils";
import { afterEach, expect, test, vi } from "vitest";

import { StackPage } from "./Page";
import { Stack } from "./Stack";
import { StackLink } from "./StackLink";
import { useStackSwitch } from "./Switch";

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

function ProductsWithLinkOutsideTheStack() {
    const [StackSwitch, switchApi] = useStackSwitch();
    return (
        <>
            <StackLink pageName="edit" payload="5" switchApi={switchApi}>
                edit link
            </StackLink>
            <StackLink pageName="list" payload="" switchApi={switchApi}>
                list link
            </StackLink>
            <Link to="/categories/hats">other category link</Link>
            <Stack topLevelTitle="Products">
                <StackSwitch>
                    <StackPage name="list">product list</StackPage>
                    <StackPage name="edit">edit page</StackPage>
                </StackSwitch>
            </Stack>
        </>
    );
}

function renderProductsAt(initialEntry: string) {
    let currentLocation: Location | undefined;
    const rendered = render(
        <>
            <Routes>
                <Route path="categories/:category/*" element={<ProductsWithLinkOutsideTheStack />} />
            </Routes>
            <LocationSpy
                onChange={(location) => {
                    currentLocation = location;
                }}
            />
        </>,
        { initialEntries: [initialEntry] },
    );
    return { rendered, getPathname: () => currentLocation?.pathname };
}

test("StackLink with the switchApi of a StackSwitch rendered after it", async () => {
    const consoleError = vi.spyOn(console, "error");
    const { rendered, getPathname } = renderProductsAt("/categories/shoes");

    await waitFor(() => {
        expect(rendered.getByText("edit link")).toHaveAttribute("href", "/categories/shoes/5/edit");
    });
    expect(rendered.getByText("list link")).toHaveAttribute("href", "/categories/shoes");

    fireEvent.click(rendered.getByText("edit link"));

    expect(await rendered.findByText("edit page")).toBeInTheDocument();
    expect(getPathname()).toBe("/categories/shoes/5/edit");

    fireEvent.click(rendered.getByText("list link"));

    expect(await rendered.findByText("product list")).toBeInTheDocument();
    expect(getPathname()).toBe("/categories/shoes");
    expect(consoleError).not.toHaveBeenCalledWith("apiRef is not attached to a StackSwitch component");
});

test("StackLink with an external switchApi follows URL changes of its StackSwitch", async () => {
    const { rendered, getPathname } = renderProductsAt("/categories/shoes");

    await waitFor(() => {
        expect(rendered.getByText("edit link")).toHaveAttribute("href", "/categories/shoes/5/edit");
    });

    fireEvent.click(rendered.getByText("other category link"));

    await waitFor(() => {
        expect(rendered.getByText("edit link")).toHaveAttribute("href", "/categories/hats/5/edit");
    });

    fireEvent.click(rendered.getByText("edit link"));

    expect(await rendered.findByText("edit page")).toBeInTheDocument();
    expect(getPathname()).toBe("/categories/hats/5/edit");
});
