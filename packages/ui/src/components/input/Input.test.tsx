import { cleanup, render, screen } from "@testing-library/react";
import type { InputHTMLAttributes } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { Input } from "./Input";

function CustomInput(props: InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} />;
}

/**
 * Compile-time contract for the input slot. Never rendered — it exists so
 * `tsc` fails if the typing regresses.
 */
export function InputSlotTypeContract() {
    return (
        <>
            <Input aria-label="Title" slotProps={{ input: { className: "consumer-input" } }} />
            {/* @ts-expect-error a slot className is a string, like the top-level one */}
            <Input aria-label="Title" slotProps={{ input: { className: () => "consumer-input" } }} />
            <Input aria-label="Title" slots={{ input: CustomInput }} />
            {/* @ts-expect-error the slot takes the native input or a component that accepts input props */}
            <Input aria-label="Title" slots={{ input: "div" }} />
        </>
    );
}

afterEach(cleanup);

describe("Input", () => {
    it("passes native input props to the input and keeps the contract on the field around it", () => {
        render(<Input aria-label="Title" className="consumer-class" defaultValue="Hello" status="error" readOnly />);

        const input = screen.getByRole("textbox", { name: "Title" });
        expect([input.getAttribute("value"), input.hasAttribute("readonly"), input.getAttribute("aria-invalid")]).toStrictEqual([
            "Hello",
            true,
            "true",
        ]);
        const field = input.parentElement;
        expect(field?.className).toContain("consumer-class");
        expect([field?.dataset.status, field?.dataset.readonly]).toStrictEqual(["error", ""]);
    });

    it("keeps an aria-invalid that the caller sets without a status", () => {
        render(<Input aria-label="Title" aria-invalid />);

        expect(screen.getByRole("textbox", { name: "Title" }).getAttribute("aria-invalid")).toBe("true");
    });

    it("puts `style` on the field and merges `slotProps.input` into the input", () => {
        render(
            <Input aria-label="Title" style={{ inlineSize: "200px" }} defaultValue="Hello" slotProps={{ input: { className: "consumer-input" } }} />,
        );

        const input = screen.getByRole("textbox", { name: "Title" });
        expect([
            input.parentElement?.style.inlineSize,
            input.style.inlineSize,
            input.className.includes("consumer-input"),
            input.className.includes("input"),
        ]).toStrictEqual(["200px", "", true, true]);
    });

    it("merges `slotProps.root` into the field around the input without dropping its classes", () => {
        render(<Input aria-label="Title" className="consumer-class" slotProps={{ root: { title: "Field", className: "slot-class" } }} />);

        const field = screen.getByRole("textbox", { name: "Title" }).parentElement;
        expect([
            field?.title,
            field?.className.includes("consumer-class"),
            field?.className.includes("slot-class"),
            field?.className.includes("dextinityInput"),
        ]).toStrictEqual(["Field", true, true, true]);
    });
});
