import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Picker } from "./Picker";

afterEach(cleanup);

describe("Picker", () => {
    it("names the trigger by the label and the rendered value and opens the picker", () => {
        const onOpen = vi.fn();
        const { container } = render(<Picker label="Link target" value={{ name: "About us" }} renderValue={(page) => page.name} onOpen={onOpen} />);

        expect((container.firstElementChild as HTMLElement).className).toContain("dextinityPicker");
        fireEvent.click(screen.getByRole("button", { name: "Link target About us" }));
        expect(onOpen).toHaveBeenCalledOnce();
    });

    it("treats null and an empty list as empty and offers clearing only with a value", () => {
        const { rerender, container } = render(<Picker label="Files" value={[]} renderValue={() => "x"} onOpen={vi.fn()} onClear={vi.fn()} />);
        expect((container.firstElementChild as HTMLElement).dataset.empty).toBe("");
        expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();

        rerender(<Picker label="Files" value={["a.jpg"]} renderValue={(files) => files.join(", ")} onOpen={vi.fn()} onClear={vi.fn()} />);
        expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
    });

    it("doesn't open while read-only", () => {
        const onOpen = vi.fn();
        render(<Picker label="Link target" value="About us" renderValue={(page) => page} onOpen={onOpen} readOnly />);

        fireEvent.click(screen.getByRole("button", { name: "Link target About us" }));
        expect(onOpen).not.toHaveBeenCalled();
    });
});
