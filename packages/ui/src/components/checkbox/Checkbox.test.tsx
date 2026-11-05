import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Checkbox } from "./Checkbox";

afterEach(cleanup);

describe("Checkbox", () => {
    it("emits the checked, indeterminate, and disabled state on the root", () => {
        const { container } = render(
            <Checkbox checked onChange={vi.fn()} indeterminate disabled>
                Select all
            </Checkbox>,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityCheckbox");
        expect([root.dataset.checked, root.dataset.indeterminate, root.dataset.disabled]).toStrictEqual(["", "", ""]);
    });

    it("reports a partial selection as mixed", () => {
        render(<Checkbox checked={false} onChange={vi.fn()} indeterminate aria-label="Select all" />);

        const control = screen.getByRole("checkbox", { name: "Select all" });
        expect(control.getAttribute("aria-checked")).toBe("mixed");
        expect(control.className).toContain("dextinityCheckbox__control");
    });
});
