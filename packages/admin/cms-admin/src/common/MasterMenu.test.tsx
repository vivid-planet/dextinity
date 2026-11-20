import { RouterMemoryRouter } from "@dextinity/admin";
import { Route, Routes } from "react-router";
import { cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Permission } from "../userPermissions/hooks/currentUser";
import { MasterMenu, type MasterMenuData } from "./MasterMenu";

vi.mock("../userPermissions/hooks/currentUser", () => ({
    useUserPermissionCheck: () => (permission: string) => permission === "allowed",
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

function renderMasterMenu(menu: MasterMenuData) {
    return render(
        <RouterMemoryRouter>
            <MasterMenu menu={menu} />
        </RouterMemoryRouter>,
    );
}

describe("MasterMenu", () => {
    beforeEach(() => {
        vi.stubGlobal(
            "ResizeObserver",
            class {
                observe() {}
                unobserve() {}
                disconnect() {}
            },
        );
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
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

    it("renders the navigation when all visible items are inside a single group", () => {
        renderMasterMenu([
            {
                type: "group",
                title: "Group",
                items: [
                    { type: "route", primary: "First", icon: undefined, to: "/first" },
                    { type: "route", primary: "Second", icon: undefined, to: "/second" },
                ],
            },
        ]);

        expect(screen.getByText("First")).toBeTruthy();
        expect(screen.getByText("Second")).toBeTruthy();
    });

    it("hides the navigation when only a single item is visible", () => {
        renderMasterMenu([
            {
                type: "group",
                title: "Group",
                items: [
                    { type: "route", primary: "Allowed", icon: undefined, to: "/allowed", requiredPermission: "allowed" as Permission },
                    { type: "route", primary: "Disallowed", icon: undefined, to: "/disallowed", requiredPermission: "disallowed" as Permission },
                ],
            },
        ]);

        expect(screen.queryByText("Allowed")).toBeNull();
    });
});
