import { cleanup, fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, expect, test } from "vitest";

import { MobileBreadcrumbs } from "./MobileBreadcrumbs";

const items = [
    { url: "/", title: "Home" },
    { url: "/products", title: "Products" },
    { url: "/products/1", title: "Product 1" },
];

afterEach(cleanup);

function renderOpenMenu() {
    render(
        <>
            <MobileBreadcrumbs items={items} separatorIcon=">" openMenuIcon="open" closeMenuIcon="close" />
            <p>Outside</p>
        </>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Products")).toBeTruthy();
}

test("closes the menu on Escape and moves focus back to the toggle button", () => {
    renderOpenMenu();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

    expect(screen.queryByText("Products")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button"));
});

test("closes the menu on a click outside", async () => {
    renderOpenMenu();

    // ClickAwayListener ignores clicks until it has activated after mounting.
    await waitFor(() => {
        fireEvent.click(screen.getByText("Outside"));
        expect(screen.queryByText("Products")).toBeNull();
    });
});

test("keeps the menu open on a click inside", () => {
    renderOpenMenu();

    fireEvent.click(screen.getByText("Product 1", { selector: "*:not(button *)" }));

    expect(screen.getByText("Products")).toBeTruthy();
});
