import { RouterMemoryRouter, useCurrentRouteMatch } from "@dextinity/admin";
import type { PropsWithChildren } from "react";
import { type Location, type NavigationType, Route, Routes, useParams } from "react-router";
import { cleanup, LocationSpy, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AiModeToolsetsProvider, type AiModeToolsetsStore, useAiModeToolsetsStore } from "../aiMode/AiModeToolsets";
import { DextinityConfigProvider } from "../config/DextinityConfigContext";
import type { PageTreeConfig } from "../pages/pageTreeConfig";
import type { Permission } from "../userPermissions/hooks/currentUser";
import type { MasterMenuData, MasterMenuRoute } from "./MasterMenu";
import { MasterMenuRoutes, useRoutePropsFromMasterMenuData } from "./MasterMenuRoutes";

vi.mock("../userPermissions/hooks/currentUser", () => ({
    useUserPermissionCheck: () => (permission: string) => permission === "allowed" || permission === "pageTree",
}));

const permissions = {
    allowed: "allowed" as Permission,
    disallowed: "disallowed" as Permission,
    alsoDisallowed: "alsoDisallowed" as Permission,
};

const allowedRoute: MasterMenuRoute = { path: "/allowed", element: "Allowed" };
const disallowedRoute: MasterMenuRoute = { path: "/disallowed", element: "Disallowed" };

describe("useRoutePropsFromMasterMenuData", () => {
    it("should include item without requiredPermission", () => {
        const items: MasterMenuData = [
            {
                type: "route",
                route: allowedRoute,
                primary: "Test",
                icon: undefined,
            },
        ];

        const routes = useRoutePropsFromMasterMenuData(items);

        expect(routes).toEqual([allowedRoute]);
    });

    it("should filter item with missing permission", () => {
        const items: MasterMenuData = [
            {
                type: "route",
                route: allowedRoute,
                primary: "Allowed",
                icon: undefined,
                requiredPermission: permissions.allowed,
            },
            {
                type: "route",
                route: disallowedRoute,
                primary: "Disallowed",
                icon: undefined,
                requiredPermission: permissions.disallowed,
            },
        ];

        const routes = useRoutePropsFromMasterMenuData(items);

        expect(routes).toEqual([allowedRoute]);
    });

    it("should include item if ancestors are allowed", () => {
        const items: MasterMenuData = [
            {
                type: "collapsible",
                primary: "Allowed",
                icon: undefined,
                requiredPermission: permissions.allowed,
                items: [
                    {
                        type: "route",
                        route: allowedRoute,
                        primary: "Allowed",
                        icon: undefined,
                    },
                ],
            },
        ];

        const routes = useRoutePropsFromMasterMenuData(items);

        expect(routes).toEqual([allowedRoute]);
    });

    it("should include item if you have one ancestor permission", () => {
        const items: MasterMenuData = [
            {
                type: "collapsible",
                primary: "Allowed",
                icon: undefined,
                requiredPermission: [permissions.allowed, permissions.disallowed],
                items: [
                    {
                        type: "route",
                        route: allowedRoute,
                        primary: "Allowed",
                        icon: undefined,
                    },
                ],
            },
        ];

        const routes = useRoutePropsFromMasterMenuData(items);

        expect(routes).toEqual([allowedRoute]);
    });

    it("should filter item if ancestors aren't allowed", () => {
        const items: MasterMenuData = [
            {
                type: "collapsible",
                primary: "Disallowed",
                icon: undefined,
                requiredPermission: permissions.disallowed,
                items: [
                    {
                        type: "route",
                        route: allowedRoute,
                        primary: "Allowed",
                        requiredPermission: permissions.allowed,
                        icon: undefined,
                    },
                ],
            },
        ];

        const routes = useRoutePropsFromMasterMenuData(items);

        expect(routes).toEqual([]);
    });

    it("should filter item if you have no ancestor permission", () => {
        const items: MasterMenuData = [
            {
                type: "collapsible",
                primary: "Disallowed",
                icon: undefined,
                requiredPermission: [permissions.disallowed, permissions.alsoDisallowed],
                items: [
                    {
                        type: "route",
                        route: allowedRoute,
                        primary: "Allowed",
                        requiredPermission: permissions.allowed,
                        icon: undefined,
                    },
                ],
            },
        ];

        const routes = useRoutePropsFromMasterMenuData(items);

        expect(routes).toEqual([]);
    });
});

describe("MasterMenuRoutes", () => {
    let aiModeToolsetsStore: AiModeToolsetsStore | undefined;

    function CaptureAiModeToolsetsStore() {
        aiModeToolsetsStore = useAiModeToolsetsStore();
        return null;
    }

    function Providers({ pageTree, children }: PropsWithChildren<{ pageTree?: PageTreeConfig }>) {
        return (
            <DextinityConfigProvider apiUrl="" graphQLApiUrl="" adminUrl="" pageTree={pageTree}>
                <AiModeToolsetsProvider>
                    <CaptureAiModeToolsetsStore />
                    {children}
                </AiModeToolsetsProvider>
            </DextinityConfigProvider>
        );
    }

    afterEach(() => {
        cleanup();
    });

    function CurrentRoute({ name }: { name: string }) {
        const routeMatch = useCurrentRouteMatch();
        const params = useParams();
        return (
            <div>
                {name}: {routeMatch?.url} {routeMatch?.pattern} {params.category}
            </div>
        );
    }

    const menu: MasterMenuData = [
        { type: "route", primary: "Dashboard", icon: undefined, route: { path: "/dashboard", element: <CurrentRoute name="Dashboard" /> } },
        {
            type: "collapsible",
            primary: "Page tree",
            icon: undefined,
            items: [{ type: "route", primary: "Main navigation", to: "/pages/pagetree/main-navigation" }],
            route: { path: "/pages/pagetree/:category", element: <CurrentRoute name="Page tree" /> },
        },
        {
            type: "collapsible",
            primary: "Products",
            icon: undefined,
            items: [
                { type: "route", primary: "Products", route: { path: "/products", element: <CurrentRoute name="Products" /> } },
                {
                    type: "route",
                    primary: "Products handmade",
                    route: { path: "/products-handmade", element: <CurrentRoute name="Products handmade" /> },
                },
            ],
        },
        {
            type: "route",
            primary: "Disallowed",
            icon: undefined,
            route: { path: "/disallowed", element: <CurrentRoute name="Disallowed" /> },
            requiredPermission: permissions.disallowed,
        },
    ];

    let location: Location | undefined;
    let navigationType: NavigationType | undefined;

    function handleLocationChange(newLocation: Location, newNavigationType: NavigationType) {
        location = newLocation;
        navigationType = newNavigationType;
    }

    function renderInScope(initialEntry: string, { pageTree }: { pageTree?: PageTreeConfig } = {}) {
        return render(
            <Providers pageTree={pageTree}>
                <RouterMemoryRouter initialEntries={[initialEntry]}>
                    <LocationSpy onChange={handleLocationChange} />
                    <Routes>
                        <Route path="/:domain/:language/*" element={<MasterMenuRoutes menu={menu} />} />
                    </Routes>
                </RouterMemoryRouter>
            </Providers>,
        );
    }

    it("should redirect from the current route to the first route", async () => {
        renderInScope("/main/en");

        expect(await screen.findByText("Dashboard: /main/en/dashboard /:domain/:language/dashboard")).toBeTruthy();
        expect(location?.pathname).toBe("/main/en/dashboard");
        expect(navigationType).toBe("REPLACE");
    });

    it("should render the route matching the URL or a URL below it", async () => {
        renderInScope("/main/en/products/5/edit");

        expect(await screen.findByText("Products: /main/en/products /:domain/:language/products")).toBeTruthy();
        expect(location?.pathname).toBe("/main/en/products/5/edit");
    });

    it("should only match whole segments of a route path", async () => {
        renderInScope("/main/en/products-handmade");

        expect(await screen.findByText("Products handmade: /main/en/products-handmade /:domain/:language/products-handmade")).toBeTruthy();
        expect(screen.queryByText(/^Products:/)).toBeNull();
    });

    it("should provide the params of a route", async () => {
        renderInScope("/main/en/pages/pagetree/main-navigation/1/edit");

        expect(
            await screen.findByText("Page tree: /main/en/pages/pagetree/main-navigation /:domain/:language/pages/pagetree/:category main-navigation"),
        ).toBeTruthy();
    });

    it("should not render routes without permission", async () => {
        renderInScope("/main/en/disallowed");

        await waitFor(() => {
            expect(location?.pathname).toBe("/main/en/disallowed");
        });
        expect(screen.queryByText(/Disallowed:/)).toBeNull();
        expect(screen.queryByText(/Dashboard:/)).toBeNull();
    });

    it("should catch errors of a route in an error boundary", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        function FailingPage(): never {
            throw new Error("Failing page");
        }

        render(
            <Providers>
                <RouterMemoryRouter initialEntries={["/failing"]}>
                    <MasterMenuRoutes
                        menu={[{ type: "route", primary: "Failing", icon: undefined, route: { path: "/failing", element: <FailingPage /> } }]}
                    />
                    <div>Outside of the routes</div>
                </RouterMemoryRouter>
            </Providers>,
        );

        expect(await screen.findByText("An error has occurred")).toBeTruthy();
        expect(screen.getByText("Outside of the routes")).toBeTruthy();

        consoleError.mockRestore();
    });

    it("should register the AI Mode toolset of the admin, which opens the pages of the menu", async () => {
        renderInScope("/main/en/products/5/edit");

        await screen.findByText(/^Products:/);
        const toolset = aiModeToolsetsStore?.getToolsets().find(({ id }) => id === "admin");
        expect(toolset?.context).toEqual({ openPage: { path: "/products", label: "Products › Products" } });
        expect(toolset?.tools?.map(({ name }) => name)).toEqual(["open_admin_page"]);
    });

    it("should let the AI Mode open the editor of a page tree node if the page tree config has its path", async () => {
        renderInScope("/main/en/dashboard", {
            pageTree: {
                categories: [{ category: "mainNavigation", label: "Main navigation" }],
                documentTypes: {},
                getNodeEditPath: ({ id }) => `/pages/pagetree/main-navigation/${id}/edit`,
            },
        });

        await screen.findByText(/^Dashboard:/);
        const tool = aiModeToolsetsStore?.getTool("open_page_tree_node");
        tool?.handler({ id: "aaf2b62f-0bd9-4c7e-bb5a-2d1fd5bcc7d0", category: "mainNavigation" }, { clearTextSelection: vi.fn() });

        await waitFor(() => {
            expect(location?.pathname).toBe("/main/en/pages/pagetree/main-navigation/aaf2b62f-0bd9-4c7e-bb5a-2d1fd5bcc7d0/edit");
        });
    });
});
