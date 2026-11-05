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
});
