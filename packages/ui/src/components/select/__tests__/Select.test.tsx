import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { Select } from "../Select";

const options = [
    { value: "vienna", label: "Vienna" },
    { value: "graz", label: "Graz" },
];

afterEach(cleanup);

describe("Select", () => {
    it("names the trigger by the field's label and the chosen option, and follows the field", () => {
        render(
            <Field label="Location" required disabled state="error" validationMessage="Choose a location.">
                <Select name="location" options={options} value="graz" onChange={vi.fn()} />
            </Field>,
        );

        const trigger = screen.getByRole("combobox", { name: "Location Graz" });
        expect(trigger).toHaveAccessibleDescription("Choose a location.");
        expect(trigger).toHaveAttribute("aria-required", "true");
        expect(trigger).toHaveAttribute("aria-invalid", "true");
        expect(trigger).toBeDisabled();
    });

    it("names the trigger by its aria-label and the chosen option on its own", () => {
        render(<Select name="location" aria-label="Location" options={options} value="graz" onChange={vi.fn()} />);

        expect(screen.getByRole("combobox", { name: "Location Graz" })).toBeTruthy();
    });

    it("renders a chip with a remove button per chosen option", () => {
        render(<Select name="locations" aria-label="Locations" options={options} value={["vienna", "graz"]} onChange={vi.fn()} multiple />);

        expect(screen.getAllByRole("button", { name: /^Remove/ }).map((button) => button.getAttribute("aria-label"))).toStrictEqual([
            "Remove Vienna",
            "Remove Graz",
        ]);
    });

    it("uses textValue for the chips of options with rich labels", () => {
        render(
            <Select
                name="sites"
                aria-label="Sites"
                options={[{ value: "main", label: <strong>Main</strong>, textValue: "Main website" }]}
                value={["main"]}
                onChange={vi.fn()}
                multiple
            />,
        );

        expect(screen.getByRole("button", { name: "Remove Main website" })).toBeTruthy();
    });

    it("shows a number value", () => {
        render(
            <Select<false, number>
                name="size"
                aria-label="Size"
                options={[
                    { value: 10, label: "10" },
                    { value: 25, label: "25" },
                ]}
                value={25}
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("combobox", { name: "Size 25" })).toBeTruthy();
    });

    it("matches an object value by getKey", () => {
        render(
            <Select<false, { id: string }>
                name="manufacturer"
                aria-label="Manufacturer"
                options={[
                    { value: { id: "1" }, label: "Alpine" },
                    { value: { id: "2" }, label: "Danube" },
                ]}
                value={{ id: "2" }}
                getKey={(value) => value.id}
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("combobox", { name: "Manufacturer Danube" })).toBeTruthy();
    });

    it("matches a value by isOptionEqualToValue", () => {
        render(
            <Select<false, { id: string; version: number }>
                name="manufacturer"
                aria-label="Manufacturer"
                options={[{ value: { id: "1", version: 1 }, label: "Alpine" }]}
                value={{ id: "1", version: 2 }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("combobox", { name: "Manufacturer Alpine" })).toBeTruthy();
    });
});
