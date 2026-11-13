import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form, FormSpy } from "react-final-form";
import { describe, expect, it } from "vitest";

import { InputField } from "../../fields/inputField/InputField";
import { TextareaField } from "../../fields/textareaField/TextareaField";
import { isEqualTreatingEmptyAlike, isEqualTreatingEmptyAs } from "../isEqualTreatingEmptyAlike";

function renderForm(initialValues: Record<string, unknown>) {
    return render(
        <Form onSubmit={() => undefined} initialValues={initialValues}>
            {() => (
                <>
                    <InputField name="title" label="Title" />
                    <TextareaField name="description" label="Description" />
                    <FormSpy subscription={{ dirty: true }}>{({ dirty }) => <output>{dirty ? "dirty" : "pristine"}</output>}</FormSpy>
                </>
            )}
        </Form>,
    );
}

describe("isEqualTreatingEmptyAlike", () => {
    it("treats undefined, null, and an empty string as equal", () => {
        expect(isEqualTreatingEmptyAlike(undefined, "")).toBe(true);
        expect(isEqualTreatingEmptyAlike(null, "")).toBe(true);
        expect(isEqualTreatingEmptyAlike(null, undefined)).toBe(true);
        expect(isEqualTreatingEmptyAlike("a", "a")).toBe(true);
        expect(isEqualTreatingEmptyAlike("a", "")).toBe(false);
        expect(isEqualTreatingEmptyAlike(0, "")).toBe(false);
        expect(isEqualTreatingEmptyAlike(false, undefined)).toBe(false);
    });

    it("uses a control's own notion of empty", () => {
        const isEqual = isEqualTreatingEmptyAs((value) => value == null || value === "<p></p>");
        expect(isEqual("<p></p>", undefined)).toBe(true);
        expect(isEqual("<p>a</p>", undefined)).toBe(false);
    });

    it.each([
        ["an empty string", ""],
        ["null", null],
    ])("keeps a text field pristine after typing and clearing it when its initial value is %s", async (_, initialValue) => {
        renderForm({ title: initialValue, description: initialValue });

        await userEvent.type(screen.getByLabelText("Title"), "Benefits");
        await userEvent.type(screen.getByLabelText("Description"), "Text");
        expect(screen.getByRole("status")).toHaveTextContent("dirty");

        await userEvent.clear(screen.getByLabelText("Title"));
        await userEvent.clear(screen.getByLabelText("Description"));
        expect(screen.getByRole("status")).toHaveTextContent("pristine");
    });

    it("makes a cleared text field dirty when it had a text initially", async () => {
        renderForm({ title: "Benefits" });

        await userEvent.clear(screen.getByLabelText("Title"));

        expect(screen.getByRole("status")).toHaveTextContent("dirty");
    });

    it("keeps a custom isEqual", async () => {
        render(
            <Form onSubmit={() => undefined} initialValues={{ title: "" }}>
                {() => (
                    <>
                        <InputField name="title" label="Title" isEqual={(a, b) => a === b} />
                        <FormSpy subscription={{ dirty: true }}>{({ dirty }) => <output>{dirty ? "dirty" : "pristine"}</output>}</FormSpy>
                    </>
                )}
            </Form>,
        );

        await userEvent.type(screen.getByLabelText("Title"), "a");
        await userEvent.clear(screen.getByLabelText("Title"));

        expect(screen.getByRole("status")).toHaveTextContent("dirty");
    });
});
