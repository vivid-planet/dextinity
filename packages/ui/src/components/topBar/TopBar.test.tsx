import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShellContext } from "../appShell/appShellContext";
import { TopBar } from "./TopBar";

afterEach(cleanup);

describe("TopBar render contract", () => {
    it("emits the mode and the AI state, and reflects the AI state on the toggle", () => {
        render(<TopBar onSearchClick={vi.fn()} aiOpen onAiOpenChange={vi.fn()} />);

        const bar = screen.getByRole("banner");
        expect(bar.className).toContain("dextinityTopBar");
        expect([bar.dataset.mode, bar.dataset.aiopen]).toStrictEqual(["browse", ""]);
        expect(screen.getByRole("switch", { name: "AI assistant" }).getAttribute("aria-checked")).toBe("true");
    });

    it("shows the back button instead of the search in edit mode", () => {
        render(<TopBar mode="edit" onSearchClick={vi.fn()} back={{ label: "Back to job ads", onClick: vi.fn() }} />);

        expect(screen.queryByRole("button", { name: "Search, jump, create …" })).toBeNull();
        expect(screen.getByRole("button", { name: "Back to job ads" })).toBeTruthy();
    });

    it("opens the AppShell's navigation drawer from the menu button", () => {
        const onNavDrawerOpen = vi.fn();
        render(
            <AppShellContext.Provider value={{ navCollapsed: false, onNavDrawerOpen }}>
                <TopBar />
            </AppShellContext.Provider>,
        );

        screen.getByRole("button", { name: "Open navigation" }).click();
        expect(onNavDrawerOpen).toHaveBeenCalled();
    });
});
