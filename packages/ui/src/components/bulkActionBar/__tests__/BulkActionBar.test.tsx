import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { BulkActionBar } from "../BulkActionBar";

afterEach(cleanup);

function noop() {}

describe("BulkActionBar", () => {
    it("emits the root class and the open state while items are selected", () => {
        render(<BulkActionBar count={3} actions={[{ label: "Archive", onClick: noop }]} onClear={noop} />);

        const root = screen.getByRole("toolbar", { name: "Bulk actions" });
        expect(root.className).toContain("dextinityBulkActionBar");
        expect(root.hasAttribute("data-open")).toBe(true);
        expect(screen.getByText("3 selected").className).toContain("dextinityBulkActionBar__count");
    });

    it("marks destructive actions with their color", () => {
        render(<BulkActionBar count={1} actions={[{ label: "Delete", color: "error", onClick: noop }]} onClear={noop} />);

        expect(screen.getByRole("button", { name: "Delete" }).dataset.color).toBe("error");
    });

    it("explains a disabled action and keeps it reachable", () => {
        render(
            <BulkActionBar
                count={1}
                actions={[
                    { label: "Delete", disabled: true, disabledReason: "Select the subpages too", onClick: noop },
                    { label: "Archive", disabledReason: "Not shown while enabled", onClick: noop },
                ]}
                onClear={noop}
            />,
        );

        const deleteButton = screen.getByRole("button", { name: "Delete" });
        const description = document.getElementById(deleteButton.getAttribute("aria-describedby") ?? "");
        expect(description?.textContent).toBe("Select the subpages too");
        expect(deleteButton.getAttribute("aria-disabled")).toBe("true");
        expect(screen.getByRole("button", { name: "Archive" }).hasAttribute("aria-describedby")).toBe(false);
    });

    it("is closed and inert without a selection", () => {
        const { container } = render(<BulkActionBar count={0} actions={[]} onClear={noop} />);

        const root = container.firstElementChild as HTMLElement;
        expect(root.hasAttribute("data-open")).toBe(false);
        expect(root.hasAttribute("inert")).toBe(true);
    });
});
