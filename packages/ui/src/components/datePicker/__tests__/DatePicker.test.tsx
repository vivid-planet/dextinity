import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { DatePicker } from "../DatePicker";
import { DateRangePicker } from "../DateRangePicker";
import { DateTimePicker } from "../DateTimePicker";

afterEach(cleanup);

describe("DatePicker", () => {
    it("shows the day in the locale and submits it as YYYY-MM-DD", () => {
        const { container } = render(
            <Field label="Published on">
                <DatePicker name="publishedOn" value="2026-11-06" onChange={vi.fn()} locale="de-AT" />
            </Field>,
        );

        expect(screen.getByRole("textbox", { name: "Published on" })).toHaveProperty("value", "06.11.2026");
        expect(container.querySelector<HTMLInputElement>("input[type='hidden']")).toMatchObject({ name: "publishedOn", value: "2026-11-06" });
    });

    it("follows the surrounding field", () => {
        render(
            <Field label="Published on" required readOnly state="error" validationMessage="Enter the day.">
                <DatePicker name="publishedOn" value={null} onChange={vi.fn()} />
            </Field>,
        );

        const input = screen.getByRole("textbox", { name: "Published on" });
        expect(input).toHaveAccessibleDescription("Enter the day.");
        expect(input).toBeRequired();
        expect(input).toHaveAttribute("readonly");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByRole("button", { name: "Choose date" })).toBeDisabled();
    });

    it("shows a typing error in the surrounding field's message", async () => {
        render(
            <Field label="Published on" helperText="The day the article went live.">
                <DatePicker name="publishedOn" value={null} onChange={vi.fn()} locale="de-AT" />
            </Field>,
        );

        const input = screen.getByRole("textbox", { name: "Published on" });
        fireEvent.change(input, { target: { value: "next week" } });
        await act(async () => fireEvent.blur(input));

        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAccessibleDescription(/^Enter a date like/);
    });

    it("draws its own box and takes its name from aria-label on its own", () => {
        const { container } = render(<DatePicker name="publishedOn" aria-label="Published on" value={null} onChange={vi.fn()} />);

        expect((container.firstElementChild as HTMLElement).className).toContain("dextinityField");
        expect(screen.getByRole("textbox", { name: "Published on" })).toBeInTheDocument();
    });
});

describe("DateTimePicker", () => {
    it("names the time input after the field's label", () => {
        render(
            <Field label="Publish at">
                <DateTimePicker name="publishAt" value={new Date(2026, 10, 6, 8, 30).toISOString()} onChange={vi.fn()} locale="de-AT" />
            </Field>,
        );

        expect(screen.getByRole("textbox", { name: "Publish at" })).toHaveProperty("value", "06.11.2026");
        expect(screen.getByRole("textbox", { name: "Publish at Time" })).toHaveProperty("value", "08:30");
    });

    it("names the time input after its aria-label on its own", () => {
        render(<DateTimePicker name="publishAt" aria-label="Publish at" value={null} onChange={vi.fn()} />);

        expect(screen.getByRole("textbox", { name: "Publish at" })).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Publish at Time" })).toBeInTheDocument();
    });
});

describe("DateRangePicker", () => {
    it("names both inputs after the field's label and follows its state", () => {
        render(
            <Field label="Period" disabled state="error" validationMessage="Choose a period.">
                <DateRangePicker name="period" value={{ start: "2026-11-06", end: null }} onChange={vi.fn()} locale="de-AT" />
            </Field>,
        );

        const start = screen.getByRole("textbox", { name: "Period Start" });
        const end = screen.getByRole("textbox", { name: "Period End" });
        expect(start).toHaveProperty("value", "06.11.2026");
        expect(end).toHaveProperty("value", "");
        for (const input of [start, end]) {
            expect(input).toBeDisabled();
            expect(input).toHaveAccessibleDescription("Choose a period.");
            expect(input).toHaveAttribute("aria-invalid", "true");
        }
    });

    it("names both inputs after its aria-label on its own", () => {
        render(<DateRangePicker name="period" aria-label="Period" value={null} onChange={vi.fn()} />);

        expect(screen.getByRole("textbox", { name: "Period Start" })).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Period End" })).toBeInTheDocument();
    });
});
