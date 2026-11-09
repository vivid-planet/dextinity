import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, expect, test } from "vitest";

import { MobileBreadcrumbs } from "./MobileBreadcrumbs";

const items = [
    { url: "/", title: "Home" },
    { url: "/products", title: "Products" },
    { url: "/products/1", title: "Product 1" },
];

afterEach(cleanup);

async function renderOpenMenu() {
    render(
        <>
            <MobileBreadcrumbs items={items} separatorIcon=">" openMenuIcon="open" closeMenuIcon="close" />
            <p>Outside</p>
        </>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Products")).toBeTruthy();

    // ClickAwayListener ignores clicks until it has activated in a timeout after mounting.
    await act(() => new Promise((resolve) => setTimeout(resolve)));
}

test("closes the menu on Escape and moves focus back to the toggle button", async () => {
    await renderOpenMenu();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

    expect(screen.queryByText("Products")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button"));
});

test("closes the menu on a click outside", async () => {
    await renderOpenMenu();

    fireEvent.click(screen.getByText("Outside"));

    expect(screen.queryByText("Products")).toBeNull();
});

test("keeps the menu open on a click inside", async () => {
    await renderOpenMenu();

    fireEvent.click(screen.getByText("Product 1", { selector: "*:not(button *)" }));

    expect(screen.getByText("Products")).toBeTruthy();
});

test("returns focus to the toggle button on Escape when a custom ref is passed", async () => {
    const customRef = createRef<HTMLButtonElement>();
    render(
        <MobileBreadcrumbs
            items={items}
            separatorIcon=">"
            openMenuIcon="open"
            closeMenuIcon="close"
            slotProps={{ mobileRootButton: { ref: customRef } }}
        />,
    );
    fireEvent.click(screen.getByRole("button"));

    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(customRef.current).toBe(screen.getByRole("button"));
    expect(document.activeElement).toBe(screen.getByRole("button"));
});
