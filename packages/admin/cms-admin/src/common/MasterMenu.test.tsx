import { RouterMemoryRouter } from "@dextinity/admin";
import { Route, Routes } from "react-router";
import { cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MasterMenu, type MasterMenuData } from "./MasterMenu";

vi.mock("../userPermissions/hooks/currentUser", () => ({
    useUserPermissionCheck: () => () => true,
}));

const menu: MasterMenuData = [
    { type: "route", primary: "Dashboard", icon: undefined, route: { path: "/dashboard", element: "Dashboard" } },
    {
        type: "collapsible",
        primary: "Page tree",
        icon: undefined,
        items: [{ type: "route", primary: "Main navigation", to: "/pages/pagetree/main-navigation" }],
        route: { path: "/pages/pagetree/:category", element: "Page tree" },
    },
];

describe("MasterMenu", () => {
    afterEach(() => {
        cleanup();
    });

    it("should link to the routes relative to the current route", async () => {
        render(
            <RouterMemoryRouter initialEntries={["/main/en/dashboard"]}>
                <Routes>
                    <Route path="/:domain/:language/*" element={<MasterMenu menu={menu} />} />
                </Routes>
            </RouterMemoryRouter>,
        );

        expect((await screen.findByText("Dashboard")).closest("a")?.getAttribute("href")).toBe("/main/en/dashboard");
        fireEvent.mouseOver(screen.getByText("Page tree"));
        expect((await screen.findByText("Main navigation")).closest("a")?.getAttribute("href")).toBe("/main/en/pages/pagetree/main-navigation");
    });

    it("should link to the routes at the root", async () => {
        render(
            <RouterMemoryRouter initialEntries={["/dashboard"]}>
                <MasterMenu menu={menu} />
            </RouterMemoryRouter>,
        );

        expect((await screen.findByText("Dashboard")).closest("a")?.getAttribute("href")).toBe("/dashboard");
    });
});
