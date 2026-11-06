import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Theme } from "../theme/Theme";
import { Menu } from "./Menu";
import { MenuCheckboxItem } from "./MenuCheckboxItem";
import { MenuGroup } from "./MenuGroup";
import { MenuItem } from "./MenuItem";
import { MenuRadioGroup } from "./MenuRadioGroup";
import { MenuRadioItem } from "./MenuRadioItem";
import { MenuSeparator } from "./MenuSeparator";
import { MenuSubmenu } from "./MenuSubmenu";

afterEach(cleanup);

describe("Menu", () => {
    it("renders the contract classes and the owner state", async () => {
        render(
            <Theme colorScheme="dark" data-testid="theme">
                <Menu open onOpenChange={vi.fn()} placement="bottom-end" className="consumer-class" trigger={<button type="button">Trigger</button>}>
                    <MenuGroup label="Row">
                        <MenuItem label="Duplicate" icon={<span>i</span>} shortcut="⌘D" onClick={vi.fn()} />
                        <MenuSeparator />
                        <MenuItem label="Delete" color="error" disabled onClick={vi.fn()} />
                    </MenuGroup>
                    <MenuRadioGroup value="dark" onChange={vi.fn()}>
                        <MenuRadioItem value="dark" label="Dark" />
                    </MenuRadioGroup>
                    <MenuCheckboxItem label="Location" checked={false} onChange={vi.fn()} />
                    <MenuSubmenu label="Move to" open={false} onOpenChange={vi.fn()}>
                        <MenuItem label="Images" onClick={vi.fn()} />
                    </MenuSubmenu>
                </Menu>
            </Theme>,
        );

        const menu = await screen.findByRole("menu");
        expect(menu.className).toContain("dextinityMenu");
        expect(menu.className).toContain("consumer-class");
        expect(menu.dataset.placement).toBe("bottom-end");
        expect(screen.getByTestId("theme").contains(menu)).toBe(true);

        const duplicate = screen.getByRole("menuitem", { name: /Duplicate/ });
        expect(duplicate.className).toContain("dextinityMenuItem");
        expect(duplicate.dataset.color).toBe("default");
        expect(screen.getByText("i").parentElement?.className).toContain("dextinityMenuItem__icon");
        expect(screen.getByText("⌘D").className).toContain("dextinityMenuItem__shortcut");

        const remove = screen.getByRole("menuitem", { name: "Delete" });
        expect(remove.dataset.color).toBe("error");
        expect(remove).toHaveProperty("dataset.disabled", "");

        expect(screen.getByRole("separator").className).toContain("dextinityMenuSeparator");
        expect(screen.getByRole("group", { name: "Row" }).className).toContain("dextinityMenuGroup");
        expect(screen.getByText("Row").className).toContain("dextinityMenuGroup__label");
        expect(screen.getByRole("menuitemradio", { name: "Dark" }).className).toContain("dextinityMenuRadioItem");
        const location = screen.getByRole("menuitemcheckbox", { name: "Location" });
        expect(location.className).toContain("dextinityMenuCheckboxItem");
        expect(location).toHaveProperty("dataset.unchecked", "");
        expect(screen.getByRole("menuitem", { name: "Move to" }).className).toContain("dextinityMenuSubmenu");
    });
});
