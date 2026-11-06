import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ListDetailLayout } from "./ListDetailLayout";

afterEach(cleanup);

describe("ListDetailLayout", () => {
    it("renders the side panel as a named complementary region only while open", () => {
        const { container, rerender } = render(
            <ListDetailLayout header="Header" toolbar="Toolbar" sidePanel="Form" sidePanelLabel="Edit redirect" open onOpenChange={() => {}}>
                List
            </ListDetailLayout>,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityListDetailLayout");
        expect([root.dataset.open, root.dataset.toolbar]).toStrictEqual(["", ""]);
        expect(screen.getByText("Toolbar").className).toContain("dextinityListDetailLayout__toolbar");
        expect(screen.getByText("List").className).toContain("dextinityListDetailLayout__content");
        expect(screen.getByRole("complementary", { name: "Edit redirect" }).className).toContain("dextinityListDetailLayout__sidePanel");

        rerender(
            <ListDetailLayout header="Header" sidePanel="Form" sidePanelLabel="Edit redirect" open={false} onOpenChange={() => {}}>
                List
            </ListDetailLayout>,
        );
        expect(root.hasAttribute("data-open")).toBe(false);
        expect(root.hasAttribute("data-toolbar")).toBe(false);
        expect(screen.queryByRole("complementary")).toBeNull();
    });

    it("asks to close when Escape is pressed in the side panel", () => {
        const onOpenChange = vi.fn();
        render(
            <ListDetailLayout
                header="Header"
                sidePanel={<input aria-label="Source" />}
                sidePanelLabel="Edit redirect"
                open
                onOpenChange={onOpenChange}
            >
                List
            </ListDetailLayout>,
        );

        fireEvent.keyDown(screen.getByRole("textbox", { name: "Source" }), { key: "Enter" });
        expect(onOpenChange).not.toHaveBeenCalled();
        fireEvent.keyDown(screen.getByRole("textbox", { name: "Source" }), { key: "Escape" });
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("returns the focus to the element that had it before the side panel when the panel closes", () => {
        function renderLayout(open: boolean) {
            return (
                <ListDetailLayout
                    header="Header"
                    sidePanel={<input aria-label="Source" />}
                    sidePanelLabel="Edit redirect"
                    open={open}
                    onOpenChange={() => {}}
                >
                    <button type="button">Row</button>
                </ListDetailLayout>
            );
        }
        const { rerender } = render(renderLayout(false));

        screen.getByRole("button", { name: "Row" }).focus();
        rerender(renderLayout(true));
        screen.getByRole("textbox", { name: "Source" }).focus();
        rerender(renderLayout(false));

        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Row" }));
    });
});
