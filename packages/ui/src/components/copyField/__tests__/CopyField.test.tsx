import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyField } from "../CopyField";

afterEach(cleanup);

describe("CopyField", () => {
    it("renders the contract classes and marks the copied state", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
        const { container } = render(<CopyField value="example.com/careers" className="consumer-class" />);

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityCopyField");
        expect(root.className).toContain("consumer-class");
        expect(screen.getByText("example.com/careers").className).toContain("dextinityCopyField__value");
        expect(root.hasAttribute("data-copied")).toBe(false);

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "Copy" }));
        });

        expect(writeText).toHaveBeenCalledWith("example.com/careers");
        expect(root.dataset.copied).toBe("");
    });
});
