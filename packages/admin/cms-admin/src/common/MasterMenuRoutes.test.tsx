import { describe, expect, it, vi } from "vitest";

import type { Permission } from "../userPermissions/hooks/currentUser";
import type { MasterMenuData } from "./MasterMenu";
import { useRoutePropsFromMasterMenuData } from "./MasterMenuRoutes";

vi.mock("../userPermissions/hooks/currentUser", () => ({
    useUserPermissionCheck: () => (permission: string) => permission === "allowed",
}));

const permissions = {
    allowed: "allowed" as Permission,
    disallowed: "disallowed" as Permission,
    alsoDisallowed: "alsoDisallowed" as Permission,
};

describe("useRoutePropsFromMasterMenuData", () => {
    it("should include item without requiredPermission", () => {
        const items: MasterMenuData = [
            {
                type: "route",
                route: { path: "/allowed" },
                primary: "Test",
                icon: undefined,
            },
        ];

        const routes = useRoutePropsFromMasterMenuData(items);

        expect(routes).toEqual([{ path: "/allowed" }]);
    });

    it("should filter item with missing permission", () => {
        const items: MasterMenuData = [
            {
                type: "route",
                route: { path: "/allowed" },
                primary: "Allowed",
                icon: undefined,
                requiredPermission: permissions.allowed,
            },
            {
                type: "route",
                route: { path: "/disallowed" },
                primary: "Disallowed",
                icon: undefined,
                requiredPermission: permissions.disallowed,
            },
        ];

        const routes = useRoutePropsFromMasterMenuData(items);

        expect(routes).toEqual([{ path: "/allowed" }]);
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
                        route: { path: "/allowed" },
                        primary: "Allowed",
                        icon: undefined,
                    },
                ],
            },
        ];

        const routes = useRoutePropsFromMasterMenuData(items);

        expect(routes).toEqual([{ path: "/allowed" }]);
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
                        route: { path: "/allowed" },
                        primary: "Allowed",
                        icon: undefined,
                    },
                ],
            },
        ];

        const routes = useRoutePropsFromMasterMenuData(items);

        expect(routes).toEqual([{ path: "/allowed" }]);
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
                        route: { path: "/allowed" },
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
                        route: { path: "/allowed" },
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
