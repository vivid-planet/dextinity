import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Menu } from "./Menu";
import { MenuItem } from "./MenuItem";

afterEach(cleanup);

describe("MenuItem", () => {
    it("describes a disabled item by the reason it is disabled", async () => {
        render(
            <Menu open onOpenChange={vi.fn()} trigger={<button type="button">Actions</button>}>
                <MenuItem label="Delete" disabled disabledReason="Only admins can delete pages" />
                <MenuItem label="Duplicate" disabledReason="Not shown while enabled" />
            </Menu>,
        );

        const deleteItem = await screen.findByRole("menuitem", { name: "Delete" });
        const description = document.getElementById(deleteItem.getAttribute("aria-describedby") ?? "");
        expect(description?.textContent).toBe("Only admins can delete pages");
        expect(screen.getByRole("menuitem", { name: "Duplicate" }).hasAttribute("aria-describedby")).toBe(false);
    });
});
