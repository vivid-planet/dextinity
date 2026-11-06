import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DatePicker } from "../DatePicker";
import { DateRangePicker } from "../DateRangePicker";
import { DateTimePicker } from "../DateTimePicker";

afterEach(cleanup);

describe("DatePicker", () => {
    it("composes the field root with its own root class and emits clearable", () => {
        const { container } = render(<DatePicker name="publishedOn" label="Published on" value={null} onChange={vi.fn()} clearable />);

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityField");
        expect(root.className).toContain("dextinityDatePicker");
        expect(root.dataset.clearable).toBe("");
    });

    it("shows the day in the locale and submits it as YYYY-MM-DD", () => {
        const { container } = render(<DatePicker name="publishedOn" label="Published on" value="2026-11-06" onChange={vi.fn()} locale="de-AT" />);

        expect(screen.getByRole("textbox", { name: "Published on" })).toHaveProperty("value", "06.11.2026");
        expect(container.querySelector<HTMLInputElement>("input[type='hidden']")).toMatchObject({ name: "publishedOn", value: "2026-11-06" });
    });
});

describe("DateTimePicker", () => {
    it("composes the field root with its own root class and names the time input after the label", () => {
        const { container } = render(
            <DateTimePicker
                name="publishAt"
                label="Publish at"
                value={new Date(2026, 10, 6, 8, 30).toISOString()}
                onChange={vi.fn()}
                locale="de-AT"
            />,
        );

        expect((container.firstElementChild as HTMLElement).className).toContain("dextinityDateTimePicker");
        expect(screen.getByRole("textbox", { name: "Publish at" })).toHaveProperty("value", "06.11.2026");
        expect(screen.getByRole("textbox", { name: "Publish at Time" })).toHaveProperty("value", "08:30");
    });
});

describe("DateRangePicker", () => {
    it("composes the field root with its own root class and names both inputs after the label", () => {
        const { container } = render(
            <DateRangePicker name="period" label="Period" value={{ start: "2026-11-06", end: null }} onChange={vi.fn()} locale="de-AT" />,
        );

        expect((container.firstElementChild as HTMLElement).className).toContain("dextinityDateRangePicker");
        expect(screen.getByRole("textbox", { name: "Period Start" })).toHaveProperty("value", "06.11.2026");
        expect(screen.getByRole("textbox", { name: "Period End" })).toHaveProperty("value", "");
    });
});
