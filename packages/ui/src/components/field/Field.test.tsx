import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Field } from "./Field";

afterEach(cleanup);

describe("Field owner state", () => {
    it("emits the state, size, and booleans as data attributes", () => {
        render(
            <Field data-testid="field" label="Title" state="error" size="small" required disabled readOnly loading>
                {(control) => <input {...control} />}
            </Field>,
        );

        const field = screen.getByTestId("field");
        expect(field.className).toContain("dextinityField");
        expect([field.dataset.state, field.dataset.size]).toStrictEqual(["error", "small"]);
        expect([field.dataset.required, field.dataset.disabled, field.dataset.readonly, field.dataset.loading]).toStrictEqual(["", "", "", ""]);
    });

    it("omits boolean attributes and uses defaults when unset", () => {
        render(
            <Field data-testid="field" label="Title">
                {(control) => <input {...control} />}
            </Field>,
        );

        const field = screen.getByTestId("field");
        expect([field.dataset.state, field.dataset.size, field.hasAttribute("data-disabled")]).toStrictEqual(["default", "default", false]);
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
