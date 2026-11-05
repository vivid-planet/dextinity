import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Theme } from "../theme/Theme";
import { Dialog } from "./Dialog";

afterEach(cleanup);

describe("Dialog", () => {
    it("renders the contract classes and the owner state", async () => {
        render(
            <Theme colorScheme="dark" data-testid="theme">
                <Dialog
                    open
                    onOpenChange={vi.fn()}
                    title="Unsaved changes"
                    description="They go live."
                    size="small"
                    footer={<button type="button">Save</button>}
                    className="consumer-class"
                    labels={{ close: "Schließen" }}
                >
                    <p>Content</p>
                </Dialog>
            </Theme>,
        );

        const dialog = await screen.findByRole("dialog");
        expect(dialog.className).toContain("dextinityDialog");
        expect(dialog.className).toContain("consumer-class");
        expect(dialog.dataset.size).toBe("small");
        expect(screen.getByTestId("theme").contains(dialog)).toBe(true);
        expect(screen.getByText("Unsaved changes").className).toContain("dextinityDialog__title");
        expect(screen.getByText("They go live.").className).toContain("dextinityDialog__description");
        expect(screen.getByText("Content").parentElement?.className).toContain("dextinityDialog__body");
        expect(screen.getByRole("button", { name: "Save" }).parentElement?.className).toContain("dextinityDialog__footer");
        expect(screen.getByRole("button", { name: "Schließen" }).className).toContain("dextinityDialog__closeButton");
    });
});
