import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Chip } from "./Chip";

afterEach(cleanup);

describe("Chip", () => {
    it("emits the variant, color, and size as data attributes, with their defaults when unset", () => {
        render(
            <>
                <Chip data-testid="plain">Flextime</Chip>
                <Chip data-testid="styled" variant="outlined" color="info" size="small">
                    Automatic
                </Chip>
            </>,
        );

        const plain = screen.getByTestId("plain");
        expect([plain.className.includes("dextinityChip"), plain.dataset.variant, plain.dataset.color, plain.dataset.size]).toStrictEqual([
            true,
            "filled",
            "default",
            "default",
        ]);
        const styled = screen.getByTestId("styled");
        expect([styled.dataset.variant, styled.dataset.color, styled.dataset.size]).toStrictEqual(["outlined", "info", "small"]);
    });

    it("renders a static chip without buttons", () => {
        render(<Chip data-testid="chip">Flextime</Chip>);

        expect(screen.queryAllByRole("button")).toHaveLength(0);
        expect(screen.getByTestId("chip").hasAttribute("data-clickable")).toBe(false);
    });

    it("marks a clickable chip as a toggle only when `selected` is set", () => {
        render(
            <>
                <Chip onClick={() => {}}>Action</Chip>
                <Chip onClick={() => {}} selected>
                    Published
                </Chip>
            </>,
        );

        expect(screen.getByRole("button", { name: "Action" }).hasAttribute("aria-pressed")).toBe(false);
        const toggle = screen.getByRole("button", { name: "Published" });
        expect(toggle.getAttribute("aria-pressed")).toBe("true");
        expect(toggle.closest(".dextinityChip")?.hasAttribute("data-selected")).toBe(true);
    });

    it("describes the delete button with the chip's text", () => {
        render(<Chip onDelete={() => {}}>Flextime</Chip>);

        const remove = screen.getByRole("button", { name: "Remove" });
        expect(remove.className).toContain("dextinityChip__delete");
        expect(document.getElementById(remove.getAttribute("aria-describedby") ?? "")?.textContent).toBe("Flextime");
    });
});
