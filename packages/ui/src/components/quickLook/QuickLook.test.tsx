import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QuickLook } from "./QuickLook";

afterEach(cleanup);

const items = [
    { src: "a.png", title: "a.png", description: "PNG" },
    { src: "b.png", title: "b.png" },
];

describe("QuickLook", () => {
    it("renders the contract classes, the position, and the owner state", async () => {
        render(
            <QuickLook
                open
                onOpenChange={vi.fn()}
                items={items}
                index={1}
                onIndexChange={vi.fn()}
                actions={<button type="button">Edit</button>}
                className="consumer-class"
            />,
        );

        const quickLook = await screen.findByRole("dialog", { name: "b.png" });
        expect(quickLook.className).toContain("dextinityQuickLook");
        expect(quickLook.className).toContain("consumer-class");
        expect(quickLook).toHaveProperty("dataset.last", "");
        expect(quickLook.dataset.first).toBeUndefined();
        expect(screen.getByRole("img", { name: "b.png" }).parentElement?.className).toContain("dextinityQuickLook__preview");
        expect(screen.getByRole("button", { name: "Edit" }).parentElement?.className).toContain("dextinityQuickLook__actions");
        expect(screen.getByText("2 / 2").className).toContain("dextinityQuickLook__position");
    });
});
