import { MemoryRouter, Route } from "react-router-dom";
import { render, screen } from "test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Permission } from "../userPermissions/hooks/currentUser";
import { MasterMenu, type MasterMenuData } from "./MasterMenu";

vi.mock("../userPermissions/hooks/currentUser", () => ({
    useUserPermissionCheck: () => (permission: string) => permission === "allowed",
}));

function renderMasterMenu(menu: MasterMenuData) {
    return render(
        <MemoryRouter>
            <Route path="/">
                <MasterMenu menu={menu} />
            </Route>
        </MemoryRouter>,
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
        return () => vi.unstubAllGlobals();
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
