import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Select } from "./Select";

const options = [
    { value: "vienna", label: "Vienna" },
    { value: "graz", label: "Graz" },
];

afterEach(cleanup);

describe("Select", () => {
    it("composes the field root with its own root class and emits multiple and searchable", () => {
        const { container } = render(
            <Select name="locations" label="Locations" options={options} value={["vienna"]} onChange={vi.fn()} multiple searchable />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityField");
        expect(root.className).toContain("dextinitySelect");
        expect([root.dataset.multiple, root.dataset.searchable]).toStrictEqual(["", ""]);
    });

    it("names the trigger by the label and the chosen option", () => {
        render(<Select name="location" label="Location" options={options} value="graz" onChange={vi.fn()} />);

        expect(screen.getByRole("combobox", { name: "Location Graz" })).toBeTruthy();
    });

    it("renders a chip with a remove button per chosen option", () => {
        render(<Select name="locations" label="Locations" options={options} value={["vienna", "graz"]} onChange={vi.fn()} multiple />);

        expect(screen.getAllByRole("button", { name: /^Remove/ }).map((button) => button.getAttribute("aria-label"))).toStrictEqual([
            "Remove Vienna",
            "Remove Graz",
        ]);
    });

    it("uses textValue for the chips of options with rich labels", () => {
        render(
            <Select
                name="sites"
                label="Sites"
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
                label="Size"
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
                label="Manufacturer"
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
                label="Manufacturer"
                options={[{ value: { id: "1", version: 1 }, label: "Alpine" }]}
                value={{ id: "1", version: 2 }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("combobox", { name: "Manufacturer Alpine" })).toBeTruthy();
    });
});
