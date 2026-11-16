import { RouterBrowserRouter, RouterMemoryRouter, Stack, StackPage, StackSwitch, SubRoute } from "@dextinity/admin";
import type { ReactNode } from "react";
import { Route, Routes } from "react-router";
import { cleanup, render, screen } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { HiddenInSubroute } from "./HiddenInSubroute";

function renderOnEditPage(initialEntry: string, children: ReactNode = <HiddenInSubroute>Visible content</HiddenInSubroute>) {
    return render(
        <RouterMemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/page/edit/*" element={<Stack topLevelTitle="Page">{children}</Stack>} />
            </Routes>
        </RouterMemoryRouter>,
    );
}

describe("HiddenInSubroute", () => {
    afterEach(() => {
        cleanup();
    });

    it("should show its children at the URL of the route", () => {
        renderOnEditPage("/page/edit");

        expect(screen.getByText("Visible content")).toBeTruthy();
    });

    it("should show its children at the URL of the route with a trailing slash", () => {
        renderOnEditPage("/page/edit/");

        expect(screen.getByText("Visible content")).toBeTruthy();
    });

    it("should hide its children below the URL of the route", () => {
        renderOnEditPage("/page/edit/link/edit");

        expect(screen.queryByText("Visible content")).toBeNull();
    });

    it("should hide its children below the URL of the route in a sub-route", () => {
        renderOnEditPage(
            "/page/edit/link",
            <SubRoute path="/page/edit/link">
                <HiddenInSubroute>Visible content</HiddenInSubroute>
            </SubRoute>,
        );

        expect(screen.queryByText("Visible content")).toBeNull();
    });

    it("should hide its children on the initial page of a stack switch while a sub-route of the page is shown", () => {
        const stackSwitch = (
            <StackSwitch>
                <StackPage name="initial">
                    <HiddenInSubroute>Visible content</HiddenInSubroute>
                    <div>Initial page</div>
                </StackPage>
                <StackPage name="blocks">Nested page</StackPage>
            </StackSwitch>
        );

        renderOnEditPage("/page/edit", stackSwitch);
        expect(screen.getByText("Visible content")).toBeTruthy();
        cleanup();

        renderOnEditPage("/page/edit/link", stackSwitch);
        expect(screen.getByText("Initial page")).toBeTruthy();
        expect(screen.queryByText("Visible content")).toBeNull();
    });

    it("should show its children at an encoded URL of the route", () => {
        const routes = (
            <Routes>
                <Route path="/:page/edit/*" element={<HiddenInSubroute>Visible content</HiddenInSubroute>} />
            </Routes>
        );

        render(<RouterMemoryRouter initialEntries={["/p%C3%A4ge/edit"]}>{routes}</RouterMemoryRouter>);
        expect(screen.getByText("Visible content")).toBeTruthy();
        cleanup();

        render(<RouterMemoryRouter initialEntries={["/p%C3%A4ge/edit/link/edit"]}>{routes}</RouterMemoryRouter>);
        expect(screen.queryByText("Visible content")).toBeNull();
    });

    describe("in browser history", () => {
        afterEach(() => {
            window.history.replaceState(null, "", "/");
        });

        it.each(["/p%c3%a4ge/edit", "/p%61ge/edit"])("should show its children at the URL of the route encoded as %s", async (url) => {
            window.history.replaceState(null, "", url);

            render(
                <RouterBrowserRouter>
                    <Routes>
                        <Route path="/:page/edit/*" element={<HiddenInSubroute>Visible content</HiddenInSubroute>} />
                    </Routes>
                </RouterBrowserRouter>,
            );

            expect(await screen.findByText("Visible content")).toBeTruthy();
        });
    });
});
