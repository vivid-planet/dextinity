import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { Input } from "../../input/Input";
import { Field } from "../Field";
import { useFieldContext } from "../fieldContext";

afterEach(cleanup);

describe("Field owner state", () => {
    it("emits the state, size, and booleans as data attributes", () => {
        render(
            <Field data-testid="field" label="Title" state="error" size="small" layout="stacked" required disabled readOnly loading>
                {(control) => <input {...control} />}
            </Field>,
        );

        const field = screen.getByTestId("field");
        expect(field.className).toContain("dextinityField");
        expect([field.dataset.state, field.dataset.size, field.dataset.layout]).toStrictEqual(["error", "small", "stacked"]);
        expect([field.dataset.required, field.dataset.disabled, field.dataset.readonly, field.dataset.loading]).toStrictEqual(["", "", "", ""]);
    });

    it("omits boolean attributes and uses defaults when unset", () => {
        render(
            <Field data-testid="field" label="Title">
                {(control) => <input {...control} />}
            </Field>,
        );

        const field = screen.getByTestId("field");
        expect([field.dataset.state, field.dataset.size, field.dataset.layout, field.hasAttribute("data-disabled")]).toStrictEqual([
            "default",
            "default",
            "inline",
            false,
        ]);
    });
});

describe("Field control props", () => {
    it("connects the control to the label and the message, preferring the validation message over the help", () => {
        render(
            <Field label="Title" helperText="Help" validationMessage="Enter a title." state="error" controlId="title">
                {(control) => <input {...control} />}
            </Field>,
        );

        const control = screen.getByRole("textbox", { name: "Title" });
        expect(control.id).toBe("title");
        expect(control.getAttribute("aria-invalid")).toBe("true");
        expect(document.getElementById(control.getAttribute("aria-describedby") ?? "")?.textContent).toBe("Enter a title.");
        expect(screen.queryByText("Help")).toBeNull();
    });

    it("shows the help while the state is default, even with a validation message", () => {
        render(
            <Field label="Title" helperText="Help" validationMessage="Enter a title.">
                {(control) => <input {...control} />}
            </Field>,
        );

        expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBeNull();
        expect(screen.getByText("Help").className).toContain("message");
    });
});

describe("Field help text", () => {
    it("puts a focusable info button right after the label and describes the control and the button by the help text", async () => {
        render(
            <Field label="Meta title" required helpText="Shown in search results." helperText="Up to 60 characters.">
                <Input />
            </Field>,
        );

        const control = screen.getByRole("textbox", { name: "Meta title" });
        expect(control).toHaveAccessibleDescription("Shown in search results. Up to 60 characters.");
        const button = screen.getByRole("button", { name: "More information" });
        expect(button.previousElementSibling?.tagName).toBe("LABEL");
        expect(button.closest("label")).toBeNull();
        expect(button.tabIndex).toBe(0);
        expect(button).toHaveAccessibleDescription("Shown in search results.");
        await act(async () => fireEvent.click(button));
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Shown in search results.");
    });

    it("names the button from labels and takes another icon from slotProps", () => {
        const { container } = render(
            <Field label="Titel" helpText="Hilfe" labels={{ helpText: "Mehr Informationen" }} slotProps={{ helpIcon: { name: "help" } }}>
                <Input />
            </Field>,
        );

        expect(screen.getByRole("button", { name: "Mehr Informationen" })).toBeInTheDocument();
        expect(container.querySelector(".dextinityIcon")?.className).not.toContain("info");
    });
});

describe("Field layouts and reports", () => {
    it("renders the label of a group as no <label> and draws no box", () => {
        const { container } = render(
            <Field label="Employment" layout="group">
                {(control) => <div role="radiogroup" aria-labelledby={control["aria-labelledby"]} />}
            </Field>,
        );

        expect(screen.getByRole("radiogroup", { name: "Employment" })).toBeInTheDocument();
        expect(container.querySelector("label")).toBeNull();
        expect(container.querySelector(".dextinityField__box")).toBeNull();
    });

    it("leaves out the label row without label and links only the message", () => {
        const { container } = render(
            <Field layout="group" state="error" validationMessage="Accept the terms.">
                {(control) => <input type="checkbox" aria-label="Terms" {...control} />}
            </Field>,
        );

        expect(container.querySelector(".dextinityField__labelRow")).toBeNull();
        const checkbox = screen.getByRole("checkbox", { name: "Terms" });
        expect(checkbox).not.toHaveAttribute("aria-labelledby");
        expect(checkbox).toHaveAccessibleDescription("Accept the terms.");
    });

    it("shows a control's own error over the validation message and its counter at the label", () => {
        function ReportingControl() {
            const field = useFieldContext();
            const setControlReport = field?.setControlReport;
            useEffect(() => setControlReport?.({ error: "Not a date.", counter: "3 / 10" }), [setControlReport]);
            return <input {...field?.control} />;
        }
        render(
            <Field label="Day" helperText="Help">
                <ReportingControl />
            </Field>,
        );

        const control = screen.getByRole("textbox", { name: "Day" });
        expect(control).toHaveAttribute("aria-invalid", "true");
        expect(control).toHaveAccessibleDescription("Not a date.");
        expect(screen.getByText("3 / 10")).toBeInTheDocument();
    });
});
