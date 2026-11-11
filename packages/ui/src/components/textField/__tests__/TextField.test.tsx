import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TextField } from "../TextField";

afterEach(cleanup);

describe("TextField", () => {
    it("composes the field root with its own root class and emits the type", () => {
        const { container } = render(<TextField name="email" label="Email" type="email" value="" onChange={vi.fn()} state="error" />);

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityField");
        expect(root.className).toContain("dextinityTextField");
        expect([root.dataset.type, root.dataset.state]).toStrictEqual(["email", "error"]);
        expect(screen.getByRole("textbox").className).toContain("dextinityTextField__control");
    });

    it("renders a date input with its value", () => {
        const { container } = render(<TextField name="date" label="Date" type="date" value="2026-10-02" onChange={vi.fn()} />);

        const input = screen.getByLabelText("Date") as HTMLInputElement;
        expect((container.firstElementChild as HTMLElement).dataset.type).toBe("date");
        expect([input.type, input.value]).toStrictEqual(["date", "2026-10-02"]);
    });

    it("passes unknown props and the ref to the input, keeping a consumer description next to its own", () => {
        const ref = { current: null as HTMLInputElement | null };
        render(
            <>
                <span id="extra">Extra</span>
                <TextField
                    ref={ref}
                    name="title"
                    label="Title"
                    value=""
                    onChange={vi.fn()}
                    helperText="Help"
                    aria-describedby="extra"
                    placeholder="Title"
                />
            </>,
        );

        const input = screen.getByRole("textbox", { name: "Title" });
        expect(ref.current).toBe(input);
        expect(input.getAttribute("name")).toBe("title");
        expect(input.getAttribute("aria-describedby")?.split(" ")).toContain("extra");
        expect(input.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
    });
});
