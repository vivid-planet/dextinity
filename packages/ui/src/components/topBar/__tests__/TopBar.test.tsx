import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShellContext } from "../../appShell/appShellContext";
import { TopBar } from "../TopBar";

afterEach(cleanup);

describe("TopBar render contract", () => {
    it("renders search, the app's actions, scope, and user menu in order", () => {
        render(
            <TopBar
                onSearchClick={vi.fn()}
                browseActions={<button type="button">Builds</button>}
                scope={<button type="button">Scope</button>}
                userMenu={<button type="button">User</button>}
            />,
        );

        const bar = screen.getByRole("banner");
        expect(bar.className).toContain("dextinityTopBar");
        expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label") ?? button.textContent)).toStrictEqual([
            "Search, jump, create …",
            "Builds",
            "Scope",
            "User",
        ]);
    });

    it("opens the AppShell's navigation drawer from the menu button", () => {
        const onNavDrawerOpen = vi.fn();
        render(
            <AppShellContext.Provider value={{ navCollapsed: false, onNavDrawerOpen }}>
                <TopBar />
            </AppShellContext.Provider>,
        );

        // jsdom's viewport is always 1024px wide, so the stylesheet hides the menu button that only narrow windows show
        screen.getByLabelText("Open navigation").click();
        expect(onNavDrawerOpen).toHaveBeenCalled();
    });
});
