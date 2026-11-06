import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EditLayout } from "./EditLayout";

afterEach(cleanup);

function rootOf(container: HTMLElement) {
    return container.firstElementChild as HTMLElement;
}

describe("EditLayout", () => {
    it("emits the variant and the narrow pane, with their defaults when unset", () => {
        const { container } = render(<EditLayout header="Header">Fields</EditLayout>);

        const root = rootOf(container);
        expect(root.className).toContain("dextinityEditLayout");
        expect([root.dataset.variant, root.dataset.pane]).toStrictEqual(["form", "editor"]);
        expect(screen.getByText("Header").className).toContain("dextinityEditLayout__header");
        expect(screen.getByText("Fields").className).toContain("dextinityEditLayout__editor");
    });

    it("renders the preview before the editor for a page, with the pane switch", () => {
        const { container } = render(
            <EditLayout variant="page" header="Header" preview="Preview" paneSwitch="Switch" pane="preview">
                Blocks
            </EditLayout>,
        );

        const root = rootOf(container);
        expect([root.dataset.variant, root.dataset.pane, root.dataset.preview]).toStrictEqual(["page", "preview", ""]);
        expect(screen.getByText("Switch").className).toContain("dextinityEditLayout__paneSwitch");
        const preview = screen.getByText("Preview");
        expect(preview.className).toContain("dextinityEditLayout__preview");
        expect(preview.nextElementSibling).toBe(screen.getByText("Blocks"));
    });

    it("shows the side column only for a form, and the preview only for the other variants", () => {
        const { container, rerender } = render(
            <EditLayout header="Header" preview="Preview" aside="Status" asideLabel="Status">
                Fields
            </EditLayout>,
        );

        const root = rootOf(container);
        expect(root.dataset.aside).toBe("");
        expect(root.hasAttribute("data-preview")).toBe(false);
        expect(screen.queryByText("Preview")).toBeNull();
        expect(screen.getByRole("complementary", { name: "Status" }).className).toContain("dextinityEditLayout__aside");

        rerender(
            <EditLayout variant="formWithPreview" header="Header" preview="Preview" aside="Status">
                Fields
            </EditLayout>,
        );
        expect(root.hasAttribute("data-aside")).toBe(false);
        expect(screen.queryByText("Status")).toBeNull();
        expect(screen.getByText("Preview").className).toContain("dextinityEditLayout__preview");
    });
});
