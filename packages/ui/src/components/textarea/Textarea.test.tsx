import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Textarea } from "./Textarea";

afterEach(cleanup);

describe("Textarea", () => {
    it("composes the field root with its own root class and marks auto-resizing", () => {
        const { container } = render(<Textarea name="intro" label="Intro" value="" onChange={vi.fn()} />);

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityField");
        expect(root.className).toContain("dextinityTextarea");
        expect(root.dataset.autoresize).toBe("");
        expect(screen.getByRole("textbox", { name: "Intro" }).className).toContain("dextinityTextarea__control");
    });

    it("omits the auto-resize attribute when the user resizes the field", () => {
        const { container } = render(<Textarea name="intro" label="Intro" value="" onChange={vi.fn()} autoResize={false} />);

        expect((container.firstElementChild as HTMLElement).hasAttribute("data-autoresize")).toBe(false);
    });
});
