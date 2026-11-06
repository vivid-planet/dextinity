import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Theme } from "../../theme/Theme";
import { Drawer } from "../Drawer";

afterEach(cleanup);

describe("Drawer", () => {
    it("renders the contract classes and the owner state", async () => {
        render(
            <Theme colorScheme="dark" data-testid="theme">
                <Drawer
                    open
                    onOpenChange={vi.fn()}
                    title="Edit redirect"
                    description="Old address"
                    width="large"
                    modal
                    footer={<button type="button">Save</button>}
                    className="consumer-class"
                >
                    <p>Content</p>
                </Drawer>
            </Theme>,
        );

        const drawer = await screen.findByRole("dialog");
        expect(drawer.className).toContain("dextinityDrawer");
        expect(drawer.className).toContain("consumer-class");
        expect(drawer.dataset.width).toBe("large");
        expect(drawer).toHaveProperty("dataset.modal", "");
        expect(screen.getByTestId("theme").contains(drawer)).toBe(true);
        expect(screen.getByText("Edit redirect").className).toContain("dextinityDrawer__title");
        expect(screen.getByText("Old address").className).toContain("dextinityDrawer__description");
        expect(screen.getByText("Content").parentElement?.className).toContain("dextinityDrawer__body");
        expect(screen.getByRole("button", { name: "Save" }).parentElement?.className).toContain("dextinityDrawer__footer");
        expect(screen.getByRole("button", { name: "Close" }).className).toContain("dextinityDrawer__closeButton");
    });
});
