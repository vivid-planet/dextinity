import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { Picker } from "../Picker";

afterEach(cleanup);

describe("Picker", () => {
    it("names the trigger by the field's label and the rendered value and opens the picker", () => {
        const onOpen = vi.fn();
        render(
            <Field label="Link target">
                <Picker value={{ name: "About us" }} renderValue={(page) => page.name} onOpen={onOpen} />
            </Field>,
        );

        fireEvent.click(screen.getByRole("button", { name: "Link target About us" }));
        expect(onOpen).toHaveBeenCalledOnce();
    });

    it("follows the surrounding field", () => {
        render(
            <Field label="Link target" required disabled state="error" validationMessage="Choose a page.">
                <Picker value={null} renderValue={() => null} onOpen={vi.fn()} />
            </Field>,
        );

        const trigger = screen.getByRole("button", { name: "Link target" });
        // A button takes no aria-required, so the field's hidden "Required" describes it
        expect(trigger).toHaveAccessibleDescription("Choose a page. Required");
        expect(trigger).not.toHaveAttribute("aria-required");
        expect(trigger).toHaveAttribute("aria-invalid", "true");
        expect(trigger).toBeDisabled();
    });

    it("names the trigger by its aria-label and the rendered value on its own", () => {
        render(<Picker aria-label="Link target" value="About us" renderValue={(page) => page} onOpen={vi.fn()} />);

        expect(screen.getByRole("button", { name: "Link target About us" })).toBeInTheDocument();
    });

    it("treats null and an empty list as empty and offers clearing only with a value", () => {
        const { rerender } = render(<Picker aria-label="Files" value={[]} renderValue={() => "x"} onOpen={vi.fn()} onClear={vi.fn()} />);
        expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();

        rerender(<Picker aria-label="Files" value={["a.jpg"]} renderValue={(files) => files.join(", ")} onOpen={vi.fn()} onClear={vi.fn()} />);
        expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
    });

    it("doesn't open while read-only", () => {
        const onOpen = vi.fn();
        render(
            <Field label="Link target" readOnly>
                <Picker value="About us" renderValue={(page) => page} onOpen={onOpen} />
            </Field>,
        );

        fireEvent.click(screen.getByRole("button", { name: "Link target About us" }));
        expect(onOpen).not.toHaveBeenCalled();
    });

    it("keeps the focus in the field once the value is cleared", () => {
        function ClearablePicker() {
            const [value, setValue] = useState<string | null>("About us");
            return (
                <Field label="Link target">
                    <Picker value={value} renderValue={(page) => page} onOpen={vi.fn()} onClear={() => setValue(null)} />
                </Field>
            );
        }
        render(<ClearablePicker />);

        const clear = screen.getByRole("button", { name: "Clear" });
        clear.focus();
        fireEvent.click(clear);
        expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
        expect(screen.getByRole("button", { name: "Link target" })).toHaveFocus();
    });
});
