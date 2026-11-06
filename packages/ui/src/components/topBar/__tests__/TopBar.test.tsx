import { act, cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShellContext } from "../../appShell/appShellContext";
import { TopBar } from "../TopBar";
import { type TopBarEdit, TopBarEditProvider, useTopBarEdit } from "../topBarEdit";

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

    it("switches to the edit mode a page sets, and back when the page unmounts", () => {
        function Editor(props: TopBarEdit) {
            useTopBarEdit(props);
            return null;
        }
        let showEditor: (show: boolean) => void = () => undefined;
        function App() {
            const [editing, setEditing] = useState(true);
            showEditor = setEditing;
            return (
                <TopBarEditProvider>
                    <TopBar onSearchClick={vi.fn()} />
                    {editing && (
                        <Editor back={{ label: "Back to pages", onClick: vi.fn() }} title="Home" actions={<button type="button">Save</button>} />
                    )}
                </TopBarEditProvider>
            );
        }
        render(<App />);

        const bar = screen.getByRole("banner");
        expect(bar.dataset.mode).toBe("edit");
        expect(bar.querySelector(".dextinityTopBar__title")?.textContent).toBe("Home");
        expect(screen.getByRole("button", { name: "Back to pages" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();

        act(() => showEditor(false));

        expect(bar.dataset.mode).toBe("browse");
        expect(screen.getByRole("button", { name: "Search, jump, create …" })).toBeTruthy();
    });
});
