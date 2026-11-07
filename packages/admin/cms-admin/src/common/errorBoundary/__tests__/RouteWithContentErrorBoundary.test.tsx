import { RouterMemoryRouter } from "@dextinity/admin";
import userEvent from "@testing-library/user-event";
import { Link } from "react-router-dom";
import { cleanup, render, screen } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RouteWithContentErrorBoundary } from "../RouteWithContentErrorBoundary";

const crash = vi.hoisted(() => ({ current: true }));

function Screen() {
    if (crash.current) {
        throw new Error("Test crash");
    }
    return <p>Screen content</p>;
}

afterEach(() => {
    cleanup();
    crash.current = true;
    vi.restoreAllMocks();
});

function renderRoute() {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
        <RouterMemoryRouter initialEntries={["/products/1"]}>
            <Link to="/products">All products</Link>
            <RouteWithContentErrorBoundary path="/products">
                <Screen />
            </RouteWithContentErrorBoundary>
        </RouterMemoryRouter>,
    );
}

describe("RouteWithContentErrorBoundary", () => {
    it("shows the error and recovers with Try again", async () => {
        renderRoute();
        const user = userEvent.setup();

        expect(screen.getByRole("alert").textContent).toContain("Something went wrong");
        crash.current = false;
        await user.click(screen.getByRole("button", { name: "Try again" }));

        expect(screen.getByText("Screen content")).toBeTruthy();
    });

    it("shows the content again after navigating within the route", async () => {
        renderRoute();
        const user = userEvent.setup();

        expect(screen.getByRole("alert")).toBeTruthy();
        crash.current = false;
        await user.click(screen.getByRole("link", { name: "All products" }));

        expect(screen.getByText("Screen content")).toBeTruthy();
    });
});
