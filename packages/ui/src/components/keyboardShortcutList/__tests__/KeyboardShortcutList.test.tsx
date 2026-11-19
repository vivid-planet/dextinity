import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { KeyboardShortcutProvider } from "../../keyboardShortcut/keyboardShortcutPlatform";
import { KeyboardShortcutList } from "../KeyboardShortcutList";

afterEach(cleanup);

describe("KeyboardShortcutList", () => {
    it("renders the contract classes and one key cap per shortcut", () => {
        render(
            <KeyboardShortcutList
                className="consumer-class"
                keyboardShortcuts={[{ keyboardShortcut: ["mod+x", "mod+v"], description: "Cut and paste" }]}
            />,
        );

        const table = screen.getByRole("table");
        expect(table.className).toContain("dextinityKeyboardShortcutList");
        expect(table.className).toContain("consumer-class");
        expect(table.querySelector(".dextinityKeyboardShortcutList__keys")?.querySelectorAll(":scope > kbd")).toHaveLength(2);
        expect(screen.getByRole("cell", { name: "Control X , Control V" })).toBeInTheDocument();
    });

    it("shows the shortcuts for the platform of the provider", () => {
        render(
            <KeyboardShortcutProvider platform="apple">
                <KeyboardShortcutList keyboardShortcuts={[{ keyboardShortcut: "shift+mod+n", description: "New folder" }]} />
            </KeyboardShortcutProvider>,
        );

        expect(screen.getByRole("table").querySelector("[aria-hidden]")?.textContent).toBe("⇧⌘N");
        expect(screen.getByRole("cell", { name: "Shift Command N" })).toBeInTheDocument();
    });

    it("shows fixed key caps", () => {
        render(<KeyboardShortcutList keyboardShortcuts={[{ keys: ["Right-click"], description: "Move to" }]} />);

        expect(screen.getByText("Right-click").tagName).toBe("KBD");
    });
});
