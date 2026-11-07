import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "../ConfirmDialog";

afterEach(cleanup);

describe("ConfirmDialog", () => {
    it("renders on the Dialog with both root classes and the tone", async () => {
        render(
            <ConfirmDialog
                open
                onOpenChange={vi.fn()}
                title="Delete?"
                confirmLabel="Delete"
                onConfirm={vi.fn()}
                tone="danger"
                className="consumer-class"
                labels={{ cancel: "Abbrechen" }}
            />,
        );

        const dialog = await screen.findByRole("alertdialog");
        expect(dialog.className).toContain("dextinityDialog");
        expect(dialog.className).toContain("dextinityConfirmDialog");
        expect(dialog.className).toContain("consumer-class");
        expect(dialog.dataset.tone).toBe("danger");
        expect(screen.getByRole("button", { name: "Abbrechen" })).toBeTruthy();
    });

    it("shows details between the description and the actions", async () => {
        render(
            <ConfirmDialog open onOpenChange={vi.fn()} title="Delete 3 pages?" confirmLabel="Delete" onConfirm={vi.fn()}>
                <p>2 published, 1 unpublished</p>
            </ConfirmDialog>,
        );

        const dialog = await screen.findByRole("alertdialog");
        expect(dialog.textContent).toContain("2 published, 1 unpublished");
    });
});
