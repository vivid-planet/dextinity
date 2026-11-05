import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Switch } from "./Switch";

afterEach(cleanup);

describe("Switch", () => {
    it("emits the size, checked, and disabled state on the root", () => {
        const { container } = render(
            <Switch checked onChange={vi.fn()} size="small" disabled>
                Hide in menu
            </Switch>,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinitySwitch");
        expect([root.dataset.size, root.dataset.checked, root.dataset.disabled]).toStrictEqual(["small", "", ""]);
    });

    it("names the switch by its label and describes it by the description", () => {
        render(
            <Switch checked={false} onChange={vi.fn()} description="The page stays reachable.">
                Hide in menu
            </Switch>,
        );

        const control = screen.getByRole("switch", { name: "Hide in menu" });
        expect(control.className).toContain("dextinitySwitch__control");
        expect(document.getElementById(control.getAttribute("aria-describedby") ?? "")?.textContent).toBe("The page stays reachable.");
    });

    it("takes its accessible name from aria-label without a visible label", () => {
        render(<Switch checked={false} onChange={vi.fn()} aria-label="AI assistant" />);

        expect(screen.getByRole("switch", { name: "AI assistant" })).toBeTruthy();
    });
});
