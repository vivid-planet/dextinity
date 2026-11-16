import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Menu } from "../Menu";
import { MenuLinkItem } from "../MenuLinkItem";

afterEach(cleanup);

describe("MenuLinkItem", () => {
    it("renders a link menu item with the contract classes", async () => {
        render(
            <Menu open onOpenChange={vi.fn()} trigger={<button type="button">Go to</button>}>
                <MenuLinkItem label="Careers" href="/careers" icon={<span />} />
            </Menu>,
        );

        const link = await screen.findByRole("menuitem", { name: "Careers" });
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/careers");
        expect(link.className).toContain("dextinityMenuLinkItem");
        expect(link.querySelector(".dextinityMenuLinkItem__icon")).not.toBeNull();
        expect(link.querySelector(".dextinityMenuLinkItem__label")?.textContent).toBe("Careers");
    });
});
