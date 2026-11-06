import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Input } from "../Input";

afterEach(cleanup);

describe("Input", () => {
    it("composes the field root with its own root class and emits the type", () => {
        const { container } = render(<Input name="email" label="Email" type="email" value="" onChange={vi.fn()} state="error" />);

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityField");
        expect(root.className).toContain("dextinityInput");
        expect([root.dataset.type, root.dataset.state]).toStrictEqual(["email", "error"]);
        expect(screen.getByRole("textbox").className).toContain("dextinityInput__control");
    });

    it("passes unknown props and the ref to the input, keeping a consumer description next to its own", () => {
        const ref = { current: null as HTMLInputElement | null };
        render(
            <>
                <span id="extra">Extra</span>
                <Input
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
